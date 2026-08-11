// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {TenorReceivables} from "../src/TenorReceivables.sol";

/// @notice Deploys TenorReceivables. The broadcasting key becomes the contract owner, which is
///         the underwriting service that records verdicts, so use the same key the backend holds.
///
/// Testnet:
///   forge script script/Deploy.s.sol:Deploy --rpc-url xlayer_testnet --broadcast --verify
/// Mainnet:
///   forge script script/Deploy.s.sol:Deploy --rpc-url xlayer_mainnet --broadcast --verify
contract Deploy is Script {
    function run() external returns (TenorReceivables tenor) {
        vm.startBroadcast();
        tenor = new TenorReceivables();
        vm.stopBroadcast();

        console2.log("TenorReceivables:", address(tenor));
        console2.log("owner (underwriter):", tenor.owner());
        console2.log("chain id:", block.chainid);
    }
}
