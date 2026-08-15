// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Test} from "forge-std/Test.sol";
import {UptimeVault} from "../src/UptimeVault.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract UptimeVaultTest is Test {
    UptimeVault vault;

    address operator = makeAddr("operator");
    address alice = makeAddr("alice");
    address bob = makeAddr("bob");
    address relayer = makeAddr("relayer");

    bytes32 constant SOURCE = keccak256("revenue history");
    bytes32 constant VERDICT = keccak256("canonical reasoning");

    uint256 constant SHARES = 100;
    uint256 constant PRICE = 0.01 ether;

    function setUp() public {
        vault = new UptimeVault();
        vm.deal(alice, 100 ether);
        vm.deal(bob, 100 ether);
        vm.deal(relayer, 100 ether);
    }

    /// A listed node, priced, with `bought` shares sold to alice.
    function _openNode(uint256 bought) internal returns (uint256 nodeId) {
        vm.prank(operator);
        nodeId = vault.listNode(SOURCE, SHARES, uint64(block.timestamp + 180 days));
        vault.recordValuation(nodeId, PRICE, 80, VERDICT);
        if (bought > 0) {
            vm.prank(alice);
            vault.buyShares{value: bought * PRICE}(nodeId, bought);
        }
    }

    // --- listing ------------------------------------------------------------------------

    function test_listNode_givesOperatorEveryShare() public {
        vm.prank(operator);
        uint256 id = vault.listNode(SOURCE, SHARES, uint64(block.timestamp + 30 days));

        assertEq(vault.balanceOf(operator, id), SHARES);
        assertEq(vault.totalNodes(), 1);

        UptimeVault.Node memory n = vault.getNode(id);
        assertEq(n.operator, operator);
        assertEq(n.sourceHash, SOURCE);
        assertEq(n.sharesTotal, SHARES);
        assertFalse(n.valued);
    }

    function test_listNode_rejectsEmptySourceHash() public {
        vm.prank(operator);
        vm.expectRevert(UptimeVault.EmptySourceHash.selector);
        vault.listNode(bytes32(0), SHARES, uint64(block.timestamp + 30 days));
    }

    function test_listNode_rejectsZeroShares() public {
        vm.prank(operator);
        vm.expectRevert(UptimeVault.ZeroShares.selector);
        vault.listNode(SOURCE, 0, uint64(block.timestamp + 30 days));
    }

    function test_listNode_rejectsTermEndInPast() public {
        vm.prank(operator);
        vm.expectRevert(UptimeVault.TermEndInPast.selector);
        vault.listNode(SOURCE, SHARES, uint64(block.timestamp));
    }

    function test_unknownNodeReverts() public {
        vm.expectRevert(UptimeVault.UnknownNode.selector);
        vault.getNode(99);
    }

    // --- valuation ----------------------------------------------------------------------

    function test_recordValuation_setsPriceAndOpensSales() public {
        vm.prank(operator);
        uint256 id = vault.listNode(SOURCE, SHARES, uint64(block.timestamp + 30 days));
        vault.recordValuation(id, PRICE, 80, VERDICT);

        UptimeVault.Node memory n = vault.getNode(id);
        assertTrue(n.valued);
        assertEq(n.pricePerShare, PRICE);
        assertEq(n.confidence, 80);
        assertEq(n.verdictHash, VERDICT);
    }

    /// The whole point of the design: an operator must not price their own earnings.
    function test_recordValuation_isNotOpenToTheOperator() public {
        vm.prank(operator);
        uint256 id = vault.listNode(SOURCE, SHARES, uint64(block.timestamp + 30 days));

        vm.prank(operator);
        vm.expectRevert(
            abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, operator)
        );
        vault.recordValuation(id, PRICE, 80, VERDICT);
    }

    function test_recordValuation_cannotBeRewritten() public {
        uint256 id = _openNode(0);
        vm.expectRevert(UptimeVault.AlreadyValued.selector);
        vault.recordValuation(id, PRICE * 2, 90, VERDICT);
    }

    function test_recordValuation_rejectsEmptyVerdictHash() public {
        vm.prank(operator);
        uint256 id = vault.listNode(SOURCE, SHARES, uint64(block.timestamp + 30 days));
        vm.expectRevert(UptimeVault.EmptyVerdictHash.selector);
        vault.recordValuation(id, PRICE, 80, bytes32(0));
    }

    function test_recordValuation_rejectsZeroPrice() public {
        vm.prank(operator);
        uint256 id = vault.listNode(SOURCE, SHARES, uint64(block.timestamp + 30 days));
        vm.expectRevert(UptimeVault.ZeroAmount.selector);
        vault.recordValuation(id, 0, 80, VERDICT);
    }

    function test_recordValuation_rejectsConfidenceAbove100() public {
        vm.prank(operator);
        uint256 id = vault.listNode(SOURCE, SHARES, uint64(block.timestamp + 30 days));
        vm.expectRevert(UptimeVault.InvalidConfidence.selector);
        vault.recordValuation(id, PRICE, 101, VERDICT);
    }

    // --- buying -------------------------------------------------------------------------

    function test_buyShares_movesSharesAndPaysOperator() public {
        uint256 id = _openNode(0);
        uint256 before = operator.balance;

        vm.prank(alice);
        vault.buyShares{value: 40 * PRICE}(id, 40);

        assertEq(vault.balanceOf(alice, id), 40);
        assertEq(vault.balanceOf(operator, id), 60);
        assertEq(operator.balance - before, 40 * PRICE);
    }

    function test_buyShares_rejectsWrongPayment() public {
        uint256 id = _openNode(0);
        vm.prank(alice);
        vm.expectRevert(UptimeVault.IncorrectPayment.selector);
        vault.buyShares{value: 39 * PRICE}(id, 40);
    }

    function test_buyShares_rejectsBeforeValuation() public {
        vm.prank(operator);
        uint256 id = vault.listNode(SOURCE, SHARES, uint64(block.timestamp + 30 days));
        vm.prank(alice);
        vm.expectRevert(UptimeVault.NotValued.selector);
        vault.buyShares{value: PRICE}(id, 1);
    }

    function test_buyShares_rejectsAfterTermEnd() public {
        uint256 id = _openNode(0);
        vm.warp(block.timestamp + 181 days);
        vm.prank(alice);
        vm.expectRevert(UptimeVault.TermEnded.selector);
        vault.buyShares{value: PRICE}(id, 1);
    }

    function test_buyShares_cannotOversell() public {
        uint256 id = _openNode(60);
        vm.prank(bob);
        vm.expectRevert(UptimeVault.NotEnoughSharesAvailable.selector);
        vault.buyShares{value: 41 * PRICE}(id, 41);
    }

    // --- revenue ------------------------------------------------------------------------

    function test_deliverRevenue_splitsProRata() public {
        uint256 id = _openNode(40);

        vm.prank(relayer);
        vault.deliverRevenue{value: 10 ether}(id);

        assertEq(vault.pending(id, alice), 4 ether);
        assertEq(vault.pending(id, operator), 6 ether);
    }

    function test_deliverRevenue_rejectsZero() public {
        uint256 id = _openNode(40);
        vm.expectRevert(UptimeVault.ZeroAmount.selector);
        vault.deliverRevenue{value: 0}(id);
    }

    function test_claim_paysTheHolder() public {
        uint256 id = _openNode(40);
        vm.prank(relayer);
        vault.deliverRevenue{value: 10 ether}(id);

        uint256 before = alice.balance;
        vm.prank(alice);
        vault.claim(id);

        assertEq(alice.balance - before, 4 ether);
        assertEq(vault.pending(id, alice), 0);
    }

    function test_claim_twiceReverts() public {
        uint256 id = _openNode(40);
        vm.prank(relayer);
        vault.deliverRevenue{value: 10 ether}(id);

        vm.prank(alice);
        vault.claim(id);
        vm.prank(alice);
        vm.expectRevert(UptimeVault.NothingToClaim.selector);
        vault.claim(id);
    }

    /// Revenue that arrived before you bought is not yours. Without the reward-debt reset in
    /// _update a buyer would walk into a claim on the seller's earnings.
    function test_buyingDoesNotBackdateAClaim() public {
        uint256 id = _openNode(0);

        vm.prank(relayer);
        vault.deliverRevenue{value: 10 ether}(id);

        vm.prank(alice);
        vault.buyShares{value: 40 * PRICE}(id, 40);

        assertEq(vault.pending(id, alice), 0);
        assertEq(vault.pending(id, operator), 10 ether);
    }

    /// The case the accumulator exists for: shares change hands between two deliveries and
    /// each holder is owed exactly the revenue that arrived while they held.
    function test_transferMidStreamSplitsRevenueByPeriod() public {
        uint256 id = _openNode(40);

        vm.prank(relayer);
        vault.deliverRevenue{value: 10 ether}(id);

        vm.prank(alice);
        vault.safeTransferFrom(alice, bob, id, 40, "");

        vm.prank(relayer);
        vault.deliverRevenue{value: 10 ether}(id);

        // Alice held 40 shares for the first delivery only.
        assertEq(vault.pending(id, alice), 4 ether);
        // Bob held 40 shares for the second delivery only.
        assertEq(vault.pending(id, bob), 4 ether);
        // The operator held 60 throughout.
        assertEq(vault.pending(id, operator), 12 ether);
    }

    function test_everyoneCanActuallyWithdrawWhatTheyAreOwed() public {
        uint256 id = _openNode(40);

        vm.prank(relayer);
        vault.deliverRevenue{value: 10 ether}(id);
        vm.prank(alice);
        vault.safeTransferFrom(alice, bob, id, 40, "");
        vm.prank(relayer);
        vault.deliverRevenue{value: 10 ether}(id);

        uint256 aliceBefore = alice.balance;
        uint256 bobBefore = bob.balance;
        uint256 operatorBefore = operator.balance;

        vm.prank(alice);
        vault.claim(id);
        vm.prank(bob);
        vault.claim(id);
        vm.prank(operator);
        vault.claim(id);

        assertEq(alice.balance - aliceBefore, 4 ether);
        assertEq(bob.balance - bobBefore, 4 ether);
        assertEq(operator.balance - operatorBefore, 12 ether);

        // Everything delivered was paid out, and the vault kept nothing.
        assertEq(address(vault).balance, 0);
    }

    /// Partial sales, three holders, revenue on both sides of a transfer. The invariant that
    /// matters is that claims never exceed deliveries.
    function test_vaultNeverPaysOutMoreThanItTookIn() public {
        uint256 id = _openNode(30);
        vm.prank(bob);
        vault.buyShares{value: 20 * PRICE}(id, 20);

        vm.prank(relayer);
        vault.deliverRevenue{value: 7 ether}(id);

        vm.prank(alice);
        vault.safeTransferFrom(alice, bob, id, 10, "");

        vm.prank(relayer);
        vault.deliverRevenue{value: 3 ether}(id);

        uint256 owed = vault.pending(id, alice) + vault.pending(id, bob)
            + vault.pending(id, operator);
        assertLe(owed, 10 ether);
        assertLe(owed, address(vault).balance);
    }

    function test_revenueTotalIsCumulative() public {
        uint256 id = _openNode(40);
        vm.prank(relayer);
        vault.deliverRevenue{value: 3 ether}(id);
        vm.prank(relayer);
        vault.deliverRevenue{value: 4 ether}(id);

        assertEq(vault.getNode(id).revenueTotal, 7 ether);
    }

    /// Revenue keeps arriving after the term closes; only share sales stop.
    function test_revenueStillArrivesAfterTermEnd() public {
        uint256 id = _openNode(40);
        vm.warp(block.timestamp + 181 days);

        vm.prank(relayer);
        vault.deliverRevenue{value: 10 ether}(id);
        assertEq(vault.pending(id, alice), 4 ether);
    }

    /// Uneven splits truncate rather than over-credit, so the vault stays solvent.
    function test_indivisibleRevenueDoesNotOvercredit() public {
        uint256 id = _openNode(33);

        vm.prank(relayer);
        vault.deliverRevenue{value: 100 wei}(id);

        uint256 owed = vault.pending(id, alice) + vault.pending(id, operator);
        assertLe(owed, 100);
    }
}
