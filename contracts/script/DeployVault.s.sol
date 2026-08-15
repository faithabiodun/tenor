// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {UptimeVault} from "../src/UptimeVault.sol";

/// @notice Deploys UptimeVault. The broadcasting key becomes the contract owner, which is the
///         service that records valuations, so use the same key the backend holds. An operator
///         must never end up owning this contract: recordValuation is the one call that decides
///         what a node's earnings are worth, and whoever holds it must not be selling shares.
///
/// Testnet:
///   forge script script/DeployVault.s.sol:DeployVault --rpc-url xlayer_testnet --broadcast --verify
/// Mainnet:
///   forge script script/DeployVault.s.sol:DeployVault --rpc-url xlayer_mainnet --broadcast --verify
contract DeployVault is Script {
    function run() external returns (UptimeVault vault) {
        vm.startBroadcast();
        vault = new UptimeVault();
        vm.stopBroadcast();

        console2.log("UptimeVault:", address(vault));
        console2.log("owner (valuation service):", vault.owner());
        console2.log("chain id:", block.chainid);
    }
}
