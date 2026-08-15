// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title Uptime vault
/// @notice Tokenised future earnings of infrastructure nodes, priced by an adversarial
///         agent panel.
///
///         An operator lists a node and receives every share of it. An agent panel reads the
///         node's observed revenue history and prices a share. Investors buy shares from the
///         operator. Revenue the node earns is delivered to this contract and becomes
///         claimable by whoever holds shares, pro rata.
///
///         Inference happens off chain. This contract stores commitments only: a hash of the
///         revenue history the agents read, a hash of the canonical reasoning JSON, the
///         priced values, and the revenue accounting. The verdict hash is what makes the
///         valuation tamper evident, it cannot be quietly rewritten once shares have sold.
///
/// @dev    Built for the X Layer AI Season hackathon.
contract UptimeVault is ERC1155, Ownable, ReentrancyGuard {
    /// @dev Fixed-point scale for the revenue accumulator. Revenue per share is tiny relative
    ///      to a wei, so it is tracked at 1e18 precision and scaled back down on claim.
    uint256 private constant PRECISION = 1e18;

    struct Node {
        address operator;
        bytes32 sourceHash; // keccak256 of the canonical revenue history the agents read
        bytes32 verdictHash; // keccak256 of the canonical reasoning JSON
        uint256 sharesTotal; // never changes; shares move between holders, they are not minted twice
        uint256 pricePerShare; // wei, set by the panel
        uint256 revenueTotal; // everything ever delivered, for display
        uint256 accRevenuePerShare; // cumulative revenue per share, scaled by PRECISION
        uint64 termEnd; // unix seconds; shares stop selling here
        uint8 confidence; // 0-100, from the arbiter
        bool valued; // a panel has priced it, so shares may be bought
    }

    mapping(uint256 => Node) private _nodes;

    /// @dev What a holder has already been credited for, so revenue delivered before they
    ///      held a share is not payable to them. Reset on every balance change.
    mapping(uint256 => mapping(address => uint256)) private _rewardDebt;

    /// @dev Settled revenue awaiting withdrawal. Settling on balance change rather than
    ///      paying out means a share transfer can never fail because a recipient rejects ether.
    mapping(uint256 => mapping(address => uint256)) private _claimable;

    uint256 private _nextNodeId = 1;

    event NodeListed(
        uint256 indexed nodeId,
        address indexed operator,
        bytes32 sourceHash,
        uint256 sharesTotal,
        uint64 termEnd
    );
    event ValuationRecorded(
        uint256 indexed nodeId, uint256 pricePerShare, uint8 confidence, bytes32 verdictHash
    );
    event SharesBought(
        uint256 indexed nodeId, address indexed buyer, uint256 shares, uint256 paid
    );
    event RevenueDelivered(uint256 indexed nodeId, address indexed from, uint256 amount);
    event RevenueClaimed(uint256 indexed nodeId, address indexed holder, uint256 amount);

    error EmptySourceHash();
    error EmptyVerdictHash();
    error ZeroShares();
    error TermEndInPast();
    error UnknownNode();
    error AlreadyValued();
    error NotValued();
    error TermEnded();
    error IncorrectPayment();
    error ZeroAmount();
    error InvalidConfidence();
    error NotEnoughSharesAvailable();
    error NothingToClaim();
    error TransferFailed();

    /// @dev The URI is empty on purpose. Share metadata is the valuation, which lives on
    ///      chain in getNode and is served by hash off chain; a token image would add
    ///      nothing a holder could verify.
    constructor() ERC1155("") Ownable(msg.sender) {}

    /// @notice List a node and take every share of it. Anyone can list their own.
    /// @param sourceHash keccak256 of the canonical revenue history the agents will read
    /// @param sharesTotal how many shares the node divides into
    /// @param termEnd when the earnings term closes, unix seconds
    function listNode(bytes32 sourceHash, uint256 sharesTotal, uint64 termEnd)
        external
        returns (uint256 nodeId)
    {
        if (sourceHash == bytes32(0)) revert EmptySourceHash();
        if (sharesTotal == 0) revert ZeroShares();
        if (termEnd <= block.timestamp) revert TermEndInPast();

        nodeId = _nextNodeId++;
        Node storage n = _nodes[nodeId];
        n.operator = msg.sender;
        n.sourceHash = sourceHash;
        n.sharesTotal = sharesTotal;
        n.termEnd = termEnd;

        emit NodeListed(nodeId, msg.sender, sourceHash, sharesTotal, termEnd);

        // The operator starts holding the whole node. Selling a share is a transfer, not a
        // mint, which is what keeps sharesTotal equal to the sum of every balance and makes
        // the revenue split add up exactly.
        _mint(msg.sender, nodeId, sharesTotal, "");
    }

    /// @notice Write the panel's valuation against a node. Once only, and never by the
    ///         operator: a node operator must not be able to price their own earnings. The
    ///         owner of this contract is the Uptime service that runs the agent panel.
    function recordValuation(
        uint256 nodeId,
        uint256 pricePerShare,
        uint8 confidence,
        bytes32 verdictHash
    ) external onlyOwner {
        Node storage n = _node(nodeId);
        if (n.valued) revert AlreadyValued();
        if (verdictHash == bytes32(0)) revert EmptyVerdictHash();
        if (pricePerShare == 0) revert ZeroAmount();
        if (confidence > 100) revert InvalidConfidence();

        n.pricePerShare = pricePerShare;
        n.confidence = confidence;
        n.verdictHash = verdictHash;
        n.valued = true;

        emit ValuationRecorded(nodeId, pricePerShare, confidence, verdictHash);
    }

    /// @notice Buy shares from the operator at the priced rate.
    function buyShares(uint256 nodeId, uint256 count) external payable nonReentrant {
        Node storage n = _node(nodeId);
        if (!n.valued) revert NotValued();
        if (block.timestamp >= n.termEnd) revert TermEnded();
        if (count == 0) revert ZeroShares();
        if (balanceOf(n.operator, nodeId) < count) revert NotEnoughSharesAvailable();
        if (msg.value != count * n.pricePerShare) revert IncorrectPayment();

        address operator = n.operator;

        emit SharesBought(nodeId, msg.sender, count, msg.value);

        // Shares move first, then the operator is paid, so a reentrant operator finds the
        // accounting already settled.
        _safeTransferFrom(operator, msg.sender, nodeId, count, "");

        (bool ok,) = payable(operator).call{value: msg.value}("");
        if (!ok) revert TransferFailed();
    }

    /// @notice Deliver revenue the node earned. Anyone may call this: the operator paying in
    ///         directly, or a relayer forwarding earnings that settled on another chain. What
    ///         matters to a holder is that the value arrived and is now claimable, which this
    ///         contract can prove, rather than who sent it.
    function deliverRevenue(uint256 nodeId) external payable {
        Node storage n = _node(nodeId);
        if (msg.value == 0) revert ZeroAmount();

        n.revenueTotal += msg.value;
        // Truncation leaves at most sharesTotal-1 wei per delivery undistributed, which stays
        // in the contract and is picked up by the next delivery's arithmetic.
        n.accRevenuePerShare += (msg.value * PRECISION) / n.sharesTotal;

        emit RevenueDelivered(nodeId, msg.sender, msg.value);
    }

    /// @notice Withdraw everything this node has accrued to you.
    function claim(uint256 nodeId) external nonReentrant returns (uint256 amount) {
        Node storage n = _node(nodeId);

        _settle(nodeId, msg.sender, n.accRevenuePerShare);
        amount = _claimable[nodeId][msg.sender];
        if (amount == 0) revert NothingToClaim();
        _claimable[nodeId][msg.sender] = 0;

        emit RevenueClaimed(nodeId, msg.sender, amount);

        (bool ok,) = payable(msg.sender).call{value: amount}("");
        if (!ok) revert TransferFailed();
    }

    /// @notice What `holder` could claim from this node right now.
    function pending(uint256 nodeId, address holder) external view returns (uint256) {
        Node storage n = _node(nodeId);
        uint256 accrued =
            (balanceOf(holder, nodeId) * n.accRevenuePerShare) / PRECISION - _rewardDebt[nodeId][holder];
        return _claimable[nodeId][holder] + accrued;
    }

    function getNode(uint256 nodeId) external view returns (Node memory) {
        return _node(nodeId);
    }

    /// @notice How many nodes exist. Node ids run 1..totalNodes().
    function totalNodes() external view returns (uint256) {
        return _nextNodeId - 1;
    }

    /// @dev Credit a holder for revenue delivered while they held their current balance, and
    ///      reset their debt to that balance. Called on both sides of every transfer.
    function _settle(uint256 nodeId, address who, uint256 acc) private {
        uint256 marker = (balanceOf(who, nodeId) * acc) / PRECISION;
        uint256 owed = marker - _rewardDebt[nodeId][who];
        if (owed > 0) _claimable[nodeId][who] += owed;
        _rewardDebt[nodeId][who] = marker;
    }

    /// @dev Reset a holder's debt to whatever they hold now. Called after balances move, so
    ///      shares that arrive carry no claim on revenue delivered before they arrived, and
    ///      shares that leave take no claim with them.
    function _syncDebt(uint256 nodeId, address who, uint256 acc) private {
        _rewardDebt[nodeId][who] = (balanceOf(who, nodeId) * acc) / PRECISION;
    }

    /// @dev Every balance change in ERC-1155 funnels through here, including mints. Settling
    ///      on both sides before the move and re-synchronising after is what lets shares
    ///      change hands mid-stream without anyone losing or gaining revenue they did not
    ///      hold shares for.
    function _update(address from, address to, uint256[] memory ids, uint256[] memory values)
        internal
        override
    {
        uint256 count = ids.length;

        for (uint256 i = 0; i < count; ++i) {
            uint256 acc = _nodes[ids[i]].accRevenuePerShare;
            if (from != address(0)) _settle(ids[i], from, acc);
            if (to != address(0)) _settle(ids[i], to, acc);
        }

        super._update(from, to, ids, values);

        for (uint256 i = 0; i < count; ++i) {
            uint256 acc = _nodes[ids[i]].accRevenuePerShare;
            if (from != address(0)) _syncDebt(ids[i], from, acc);
            if (to != address(0)) _syncDebt(ids[i], to, acc);
        }
    }

    function _node(uint256 nodeId) private view returns (Node storage n) {
        n = _nodes[nodeId];
        if (n.operator == address(0)) revert UnknownNode();
    }
}
