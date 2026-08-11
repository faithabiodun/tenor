// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Test} from "forge-std/Test.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC721Errors} from "@openzeppelin/contracts/interfaces/draft-IERC6093.sol";
import {TenorReceivables} from "../src/TenorReceivables.sol";

contract TenorReceivablesTest is Test {
    TenorReceivables internal tenor;

    address internal underwriter = address(this); // deploys, so owns
    address internal freelancer = makeAddr("freelancer");
    address internal funder = makeAddr("funder");

    // Invoice A-1042: $3,000 face, $2,340 advanced at 78%, in minor units.
    bytes32 internal constant DOC_HASH = keccak256("invoice-A-1042.pdf");
    bytes32 internal constant VERDICT_HASH = keccak256('{"advance_rate":78}');
    uint256 internal constant FACE = 3000_00;
    uint256 internal constant ADVANCE = 2340_00;
    uint8 internal constant CONFIDENCE = 72;

    uint64 internal dueDate;

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

    function setUp() public {
        vm.warp(1_770_000_000); // a sane "now", block.timestamp starts at 1 otherwise
        dueDate = uint64(block.timestamp + 60 days);
        tenor = new TenorReceivables();
        vm.deal(funder, 1 ether);
    }

    // --- helpers ---------------------------------------------------------

    function _mint() internal returns (uint256 tokenId) {
        vm.prank(freelancer);
        tokenId = tenor.mintReceivable(DOC_HASH, FACE, dueDate);
    }

    function _mintAndPrice() internal returns (uint256 tokenId) {
        tokenId = _mint();
        tenor.recordVerdict(tokenId, ADVANCE, CONFIDENCE, VERDICT_HASH);
    }

    // --- happy path ------------------------------------------------------

    function test_HappyPath_MintPriceFundRepay() public {
        vm.expectEmit(true, true, false, true);
        emit ReceivableMinted(1, freelancer, DOC_HASH, FACE, dueDate);
        uint256 tokenId = _mint();

        assertEq(tokenId, 1);
        assertEq(tenor.ownerOf(tokenId), freelancer);
        assertEq(tenor.totalMinted(), 1);

        TenorReceivables.Receivable memory r = tenor.getReceivable(tokenId);
        assertEq(r.freelancer, freelancer);
        assertEq(r.docHash, DOC_HASH);
        assertEq(r.verdictHash, bytes32(0));
        assertEq(r.faceValue, FACE);
        assertEq(r.advanceValue, 0);
        assertEq(r.dueDate, dueDate);
        assertEq(r.confidence, 0);
        assertEq(uint8(r.status), uint8(TenorReceivables.Status.Priced));

        vm.expectEmit(true, false, false, true);
        emit VerdictRecorded(tokenId, ADVANCE, CONFIDENCE, VERDICT_HASH);
        tenor.recordVerdict(tokenId, ADVANCE, CONFIDENCE, VERDICT_HASH);

        r = tenor.getReceivable(tokenId);
        assertEq(r.advanceValue, ADVANCE);
        assertEq(r.confidence, CONFIDENCE);
        assertEq(r.verdictHash, VERDICT_HASH);
        assertEq(uint8(r.status), uint8(TenorReceivables.Status.Priced));

        vm.expectEmit(true, true, false, true);
        emit ReceivableFunded(tokenId, funder, ADVANCE);
        vm.prank(funder);
        tenor.fund{value: ADVANCE}(tokenId);

        assertEq(tenor.funders(tokenId), funder);
        assertEq(freelancer.balance, ADVANCE, "advance lands with the freelancer");
        assertEq(address(tenor).balance, 0, "contract holds nothing");
        assertEq(
            uint8(tenor.getReceivable(tokenId).status), uint8(TenorReceivables.Status.Funded)
        );

        vm.expectEmit(true, false, false, false);
        emit ReceivableRepaid(tokenId);
        tenor.markRepaid(tokenId);
        assertEq(
            uint8(tenor.getReceivable(tokenId).status), uint8(TenorReceivables.Status.Repaid)
        );
    }

    function test_HappyPath_Default() public {
        uint256 tokenId = _mintAndPrice();
        vm.prank(funder);
        tenor.fund{value: ADVANCE}(tokenId);

        vm.expectEmit(true, false, false, false);
        emit ReceivableDefaulted(tokenId);
        tenor.markDefaulted(tokenId);
        assertEq(
            uint8(tenor.getReceivable(tokenId).status), uint8(TenorReceivables.Status.Defaulted)
        );
    }

    // --- mint invariants -------------------------------------------------

    function test_RevertWhen_DocHashIsZero() public {
        vm.expectRevert(TenorReceivables.EmptyDocHash.selector);
        vm.prank(freelancer);
        tenor.mintReceivable(bytes32(0), FACE, dueDate);
    }

    function test_RevertWhen_FaceValueIsZero() public {
        vm.expectRevert(TenorReceivables.ZeroAmount.selector);
        vm.prank(freelancer);
        tenor.mintReceivable(DOC_HASH, 0, dueDate);
    }

    function test_RevertWhen_DueDateInPast() public {
        vm.expectRevert(TenorReceivables.DueDateInPast.selector);
        vm.prank(freelancer);
        tenor.mintReceivable(DOC_HASH, FACE, uint64(block.timestamp - 1));
    }

    function test_RevertWhen_DueDateIsNow() public {
        vm.expectRevert(TenorReceivables.DueDateInPast.selector);
        vm.prank(freelancer);
        tenor.mintReceivable(DOC_HASH, FACE, uint64(block.timestamp));
    }

    // --- verdict invariants ----------------------------------------------

    function test_RevertWhen_AdvanceExceedsFace() public {
        uint256 tokenId = _mint();
        vm.expectRevert(TenorReceivables.AdvanceExceedsFace.selector);
        tenor.recordVerdict(tokenId, FACE + 1, CONFIDENCE, VERDICT_HASH);
    }

    function test_AdvanceEqualToFaceIsAllowed() public {
        uint256 tokenId = _mint();
        tenor.recordVerdict(tokenId, FACE, CONFIDENCE, VERDICT_HASH);
        assertEq(tenor.getReceivable(tokenId).advanceValue, FACE);
    }

    function test_RevertWhen_ConfidenceAbove100() public {
        uint256 tokenId = _mint();
        vm.expectRevert(TenorReceivables.InvalidConfidence.selector);
        tenor.recordVerdict(tokenId, ADVANCE, 101, VERDICT_HASH);
    }

    function test_RevertWhen_VerdictRecordedTwice() public {
        uint256 tokenId = _mintAndPrice();
        vm.expectRevert(TenorReceivables.VerdictAlreadyRecorded.selector);
        tenor.recordVerdict(tokenId, ADVANCE, CONFIDENCE, keccak256("second opinion"));
    }

    function test_RevertWhen_VerdictHashIsZero() public {
        uint256 tokenId = _mint();
        vm.expectRevert(TenorReceivables.EmptyVerdictHash.selector);
        tenor.recordVerdict(tokenId, ADVANCE, CONFIDENCE, bytes32(0));
    }

    function test_RevertWhen_VerdictRecordedAfterFunding() public {
        uint256 tokenId = _mintAndPrice();
        vm.prank(funder);
        tenor.fund{value: ADVANCE}(tokenId);

        vm.expectRevert(TenorReceivables.IllegalStatusTransition.selector);
        tenor.recordVerdict(tokenId, ADVANCE, CONFIDENCE, keccak256("too late"));
    }

    function test_RevertWhen_NonOwnerRecordsVerdict() public {
        uint256 tokenId = _mint();
        vm.expectRevert(
            abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, freelancer)
        );
        vm.prank(freelancer);
        tenor.recordVerdict(tokenId, ADVANCE, CONFIDENCE, VERDICT_HASH);
    }

    // --- funding invariants ----------------------------------------------

    function test_RevertWhen_FundingBeforeVerdict() public {
        uint256 tokenId = _mint();
        vm.expectRevert(TenorReceivables.VerdictNotRecorded.selector);
        vm.prank(funder);
        tenor.fund{value: ADVANCE}(tokenId);
    }

    function test_RevertWhen_FundingWithWrongValue() public {
        uint256 tokenId = _mintAndPrice();
        vm.expectRevert(TenorReceivables.IncorrectFundingAmount.selector);
        vm.prank(funder);
        tenor.fund{value: ADVANCE - 1}(tokenId);
    }

    function test_RevertWhen_FundingTwice() public {
        uint256 tokenId = _mintAndPrice();
        vm.prank(funder);
        tenor.fund{value: ADVANCE}(tokenId);

        address second = makeAddr("second funder");
        vm.deal(second, 1 ether);
        vm.expectRevert(TenorReceivables.IllegalStatusTransition.selector);
        vm.prank(second);
        tenor.fund{value: ADVANCE}(tokenId);
    }

    // --- status transition invariants ------------------------------------

    function test_RevertWhen_MarkRepaidFromPriced() public {
        uint256 tokenId = _mintAndPrice();
        vm.expectRevert(TenorReceivables.IllegalStatusTransition.selector);
        tenor.markRepaid(tokenId);
    }

    function test_RevertWhen_MarkDefaultedFromPriced() public {
        uint256 tokenId = _mintAndPrice();
        vm.expectRevert(TenorReceivables.IllegalStatusTransition.selector);
        tenor.markDefaulted(tokenId);
    }

    function test_RevertWhen_MarkRepaidTwice() public {
        uint256 tokenId = _mintAndPrice();
        vm.prank(funder);
        tenor.fund{value: ADVANCE}(tokenId);
        tenor.markRepaid(tokenId);

        vm.expectRevert(TenorReceivables.IllegalStatusTransition.selector);
        tenor.markRepaid(tokenId);
    }

    function test_RevertWhen_DefaultedAfterRepaid() public {
        uint256 tokenId = _mintAndPrice();
        vm.prank(funder);
        tenor.fund{value: ADVANCE}(tokenId);
        tenor.markRepaid(tokenId);

        vm.expectRevert(TenorReceivables.IllegalStatusTransition.selector);
        tenor.markDefaulted(tokenId);
    }

    function test_RevertWhen_FundingARepaidReceivable() public {
        uint256 tokenId = _mintAndPrice();
        vm.prank(funder);
        tenor.fund{value: ADVANCE}(tokenId);
        tenor.markRepaid(tokenId);

        vm.expectRevert(TenorReceivables.IllegalStatusTransition.selector);
        vm.prank(funder);
        tenor.fund{value: ADVANCE}(tokenId);
    }

    function test_RevertWhen_NonOwnerMarksRepaid() public {
        uint256 tokenId = _mintAndPrice();
        vm.prank(funder);
        tenor.fund{value: ADVANCE}(tokenId);

        vm.expectRevert(
            abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, freelancer)
        );
        vm.prank(freelancer);
        tenor.markRepaid(tokenId);
    }

    // --- unknown tokens ---------------------------------------------------

    function test_RevertWhen_ActingOnUnknownToken() public {
        vm.expectRevert(
            abi.encodeWithSelector(IERC721Errors.ERC721NonexistentToken.selector, uint256(99))
        );
        tenor.getReceivable(99);
    }

    // --- fuzz -------------------------------------------------------------

    function testFuzz_VerdictWithinBoundsAlwaysRecords(
        uint256 faceValue,
        uint256 advanceValue,
        uint8 confidence
    ) public {
        faceValue = bound(faceValue, 1, type(uint128).max);
        advanceValue = bound(advanceValue, 1, faceValue);
        confidence = uint8(bound(confidence, 0, 100));

        vm.prank(freelancer);
        uint256 tokenId = tenor.mintReceivable(DOC_HASH, faceValue, dueDate);
        tenor.recordVerdict(tokenId, advanceValue, confidence, VERDICT_HASH);

        TenorReceivables.Receivable memory r = tenor.getReceivable(tokenId);
        assertLe(r.advanceValue, r.faceValue);
        assertLe(r.confidence, 100);
    }
}
