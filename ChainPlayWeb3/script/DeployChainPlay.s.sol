// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {Script, console} from "forge-std/Script.sol";
import {GamingGrantPlatform} from "../src/ChainPlay.sol";

contract DeployGameGrant is Script {
    function run() external {
        vm.startBroadcast();

        // Deploy the GameGrant contract without any initial grants
        GamingGrantPlatform gamingGrantPlatform = new GamingGrantPlatform();

        console.log(
            "GameGrant contract deployed at:",
            address(gamingGrantPlatform)
        );

        vm.stopBroadcast();
    }
}
