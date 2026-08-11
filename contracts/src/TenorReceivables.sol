// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title Tenor receivables
/// @notice Tokenised freelancer receivables priced by an adversarial agent panel.
///         Inference happens off chain. This contract stores commitments only: a hash of
///         the source document, a hash of the canonical reasoning JSON, the priced values,
///         and status. The verdict hash is what makes the pricing rationale tamper evident,
///         it cannot be quietly rewritten after the fact.
/// @dev    Prototype for the X Layer AI Season hackathon. Not a live financial product.
contract TenorReceivables is ERC721, Ownable {
    enum Status {
        Priced,
        Funded,
        Repaid,
        Defaulted
    }

    struct Receivable {
        address freelancer;
        bytes32 docHash; // keccak256 of the uploaded document bytes
        bytes32 verdictHash; // keccak256 of the canonical reasoning JSON
        uint256 faceValue; // what the client owes, in minor units
        uint256 advanceValue; // agent-priced value today, minor units
        uint64 dueDate; // unix seconds
        uint8 confidence; // 0-100, from the arbiter
        Status status;
    }

    mapping(uint256 => Receivable) public receivables;
    mapping(uint256 => address) public funders;

    uint256 private _nextTokenId = 1;

    event ReceivableMinted(
        uint256 indexed tokenId,
        address indexed freelancer,
        bytes32 docHash,
        uint256 faceValue,
        uint64 dueDate
    );
    event VerdictRecorded(
        uint256 indexed tokenId, uint256 advanceValue, uint8 confidence, bytes32 verdictHash
    );
    event ReceivableFunded(uint256 indexed tokenId, address indexed funder, uint256 amount);
    event ReceivableRepaid(uint256 indexed tokenId);
    event ReceivableDefaulted(uint256 indexed tokenId);

    error AdvanceExceedsFace();
    error InvalidConfidence();
    error DueDateInPast();
    error VerdictAlreadyRecorded();
    error VerdictNotRecorded();
    error IllegalStatusTransition();
    error IncorrectFundingAmount();
    error EmptyDocHash();
    error EmptyVerdictHash();
    error ZeroAmount();
    error TransferFailed();

    constructor() ERC721("Tenor Receivable", "TENOR") Ownable(msg.sender) {}

    /// @notice Mint a receivable against an uploaded document. Anyone can mint their own.
    /// @param docHash keccak256 of the document bytes the agents read
    /// @param faceValue what the client owes, in minor units of the invoice currency
    /// @param dueDate when the client owes it, unix seconds
    function mintReceivable(bytes32 docHash, uint256 faceValue, uint64 dueDate)
        external
        returns (uint256 tokenId)
    {
        if (docHash == bytes32(0)) revert EmptyDocHash();
        if (faceValue == 0) revert ZeroAmount();
        if (dueDate <= block.timestamp) revert DueDateInPast();

        tokenId = _nextTokenId++;
        receivables[tokenId] = Receivable({
            freelancer: msg.sender,
            docHash: docHash,
            verdictHash: bytes32(0),
            faceValue: faceValue,
            advanceValue: 0,
            dueDate: dueDate,
            confidence: 0,
            status: Status.Priced
        });

        emit ReceivableMinted(tokenId, msg.sender, docHash, faceValue, dueDate);
        _safeMint(msg.sender, tokenId);
    }

    /// @notice Write the arbiter's verdict against a receivable. Once only, and never by the
    ///         holder, a freelancer must not be able to price their own paper. The owner of
    ///         this contract is the Tenor underwriting service that runs the agent panel.
    function recordVerdict(
        uint256 tokenId,
        uint256 advanceValue,
        uint8 confidence,
        bytes32 verdictHash
    ) external onlyOwner {
        Receivable storage r = _receivable(tokenId);
        if (r.status != Status.Priced) revert IllegalStatusTransition();
        if (r.verdictHash != bytes32(0)) revert VerdictAlreadyRecorded();
        if (verdictHash == bytes32(0)) revert EmptyVerdictHash();
        if (advanceValue == 0) revert ZeroAmount();
        if (advanceValue > r.faceValue) revert AdvanceExceedsFace();
        if (confidence > 100) revert InvalidConfidence();

        r.advanceValue = advanceValue;
        r.confidence = confidence;
        r.verdictHash = verdictHash;

        emit VerdictRecorded(tokenId, advanceValue, confidence, verdictHash);
    }

    /// @notice Advance the priced amount to the freelancer and take the funder slot.
    /// @dev    Prototype simplification: advanceValue is denominated in minor units of the
    ///         invoice currency but paid here in wei of the native gas token. There is no
    ///         oracle and no real settlement, so a demo funding costs a negligible amount.
    function fund(uint256 tokenId) external payable {
        Receivable storage r = _receivable(tokenId);
        if (r.status != Status.Priced) revert IllegalStatusTransition();
        if (r.verdictHash == bytes32(0)) revert VerdictNotRecorded();
        if (msg.value != r.advanceValue) revert IncorrectFundingAmount();

        r.status = Status.Funded;
        funders[tokenId] = msg.sender;

        emit ReceivableFunded(tokenId, msg.sender, msg.value);

        (bool ok,) = payable(r.freelancer).call{value: msg.value}("");
        if (!ok) revert TransferFailed();
    }

    /// @notice Attest that the client paid. Status only, settlement is out of scope.
    function markRepaid(uint256 tokenId) external onlyOwner {
        Receivable storage r = _receivable(tokenId);
        if (r.status != Status.Funded) revert IllegalStatusTransition();
        r.status = Status.Repaid;
        emit ReceivableRepaid(tokenId);
    }

    /// @notice Attest that the client did not pay. Status only, settlement is out of scope.
    function markDefaulted(uint256 tokenId) external onlyOwner {
        Receivable storage r = _receivable(tokenId);
        if (r.status != Status.Funded) revert IllegalStatusTransition();
        r.status = Status.Defaulted;
        emit ReceivableDefaulted(tokenId);
    }

    function getReceivable(uint256 tokenId) external view returns (Receivable memory) {
        return _receivable(tokenId);
    }

    /// @notice How many receivables exist. Token ids run 1..totalMinted().
    function totalMinted() external view returns (uint256) {
        return _nextTokenId - 1;
    }

    function _receivable(uint256 tokenId) private view returns (Receivable storage) {
        _requireOwned(tokenId);
        return receivables[tokenId];
    }
}
