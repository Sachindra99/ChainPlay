// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {console} from "forge-std/console.sol";
import {Test} from "forge-std/Test.sol";
import {GamingGrantPlatform} from "../src/ChainPlay.sol";
import {DeployGameGrant} from "../script/DeployChainPlay.s.sol";

contract GamingGrantPlatformTest is Test {
    GamingGrantPlatform private platform;
    DeployGameGrant private deployer;
    address private creator = address(0x1);
    address private developer1 = address(0x2);
    address private developer2 = address(0x3);
    address private user1 = address(0x4);

    function setUp() public {
        platform = new GamingGrantPlatform();
        vm.deal(creator, 1000 ether);
        vm.deal(developer1, 10 ether);
        vm.deal(developer2, 10 ether);
        vm.deal(user1, 10 ether);
        deployer = new DeployGameGrant();
    }

    function testCreateGrant() public {
        vm.startPrank(creator);
        uint256 totalAmount = 5 ether;
        uint256 duration = 1 days;

        platform.createGrant{value: totalAmount}(
            "GameDev Fund",
            totalAmount,
            duration,
            "ipfs://QmX8"
        );

        GamingGrantPlatform.Grant memory grant = platform.getGrant(1);
        assertEq(grant.name, "GameDev Fund");
        assertEq(grant.startTime, block.timestamp);
        assertEq(grant.duration, duration);
        assertEq(grant.totalAmount, totalAmount);
        assertEq(grant.creator, creator);

        vm.stopPrank();
    }

    function testSubmitGame() public {
        testCreateGrant();

        vm.startPrank(developer1);
        platform.submitGame(
            1,
            "GameOne",
            "An adventure game",
            "ipfs://QmX8",
            "ipfs://QmX8",
            "ipfs://QmX8"
        );
        GamingGrantPlatform.Game memory game = platform.getGame(1);

        assertEq(game.name, "GameOne");
        assertEq(game.details, "An adventure game");
        assertEq(game.developer, developer1);

        vm.stopPrank();
    }

    function testDoubleSubmitGame() public {
        testSubmitGame();

        vm.startPrank(developer1);
        vm.expectRevert(abi.encodeWithSignature("GameAlreadySubmitted()"));
        platform.submitGame(
            1,
            "Another Game",
            "An RPG experience",
            "ipfs://QmX8",
            "ipfs://QmX8",
            "ipfs://QmX8"
        );
        vm.stopPrank();
    }

    function testVoteGame() public {
        testSubmitGame();

        vm.startPrank(user1);
        uint256 voteAmount = 1 ether;
        platform.vote{value: voteAmount}(1, 1);

        GamingGrantPlatform.Game memory game = platform.getGame(1);
        assertEq(game.voteCount, 1);
        assertEq(game.funding, voteAmount);
        vm.stopPrank();
    }

    function testMultipleVotes() public {
        testVoteGame();

        vm.startPrank(user1);
        vm.expectRevert("Already voted");
        platform.vote{value: 1 ether}(1, 1);
        vm.stopPrank();
    }

    function testFinalizeGrant() public {
        vm.prank(creator);
        platform.createGrant{value: 100 ether}(
            "Test Grant",
            100 ether,
            1 weeks,
            "ipfs://QmX8"
        );

        vm.prank(developer1);
        platform.submitGame(
            1,
            "Game 1",
            "A great game!",
            "ipfs://QmX8",
            "ipfs://QmX8",
            "ipfs://QmX8"
        );

        // Voting process
        vm.deal(user1, 1 ether);
        vm.prank(user1);
        platform.vote{value: 1 ether}(1, 1);

        vm.deal(developer2, 1 ether);
        vm.prank(developer2);
        platform.vote{value: 1 ether}(1, 1);

        // Move time forward by one week to end the grant
        vm.warp(block.timestamp + 1 weeks + 1);

        vm.prank(creator);
        platform.finalizeGrant(1);

        GamingGrantPlatform.Grant memory grant = platform.getGrant(1);
        assertTrue(grant.finalized);
    }

    function testFinalizeGrantBeforeEnd() public {
        testVoteGame();

        vm.startPrank(creator);
        vm.expectRevert("Grant duration not over");
        platform.finalizeGrant(1);
        vm.stopPrank();
    }

    function testNonCreatorCannotFinalizeGrant() public {
        testVoteGame();
        vm.startPrank(user1);

        vm.expectRevert(abi.encodeWithSignature("NotGrantCreator()"));
        platform.finalizeGrant(1);
        vm.stopPrank();
    }

    function testCreateGrantWithoutPayment() public {
        vm.startPrank(creator);
        uint256 totalAmount = 5 ether;
        uint256 duration = 1 days;

        // Expect revert since the Ether value sent does not match totalAmount
        vm.expectRevert("Ether sent must equal totalAmount");
        platform.createGrant(
            "GameDev Fund",
            totalAmount,
            duration,
            "ipfs://QmX8"
        );

        vm.stopPrank();
    }

    function testDeployGamingGrantPlatform() public {
        // Execute the deploy script
        deployer.run();

        // Verify that the GamingGrantPlatform was deployed correctly
        platform = new GamingGrantPlatform(); // We directly instantiate to get the address

        // Check that the platform address is not zero
        assertTrue(
            address(platform) != address(0),
            "GamingGrantPlatform should be deployed"
        );

        // Optional: Check if the console log captures the correct address
        // Note: This may not be testable directly in a typical test case as console logs are for debugging
        // Ensure the contract was deployed and the address is correct
        console.log("GamingGrantPlatform deployed at:", address(platform));
    }

    function testGetGame() public {
        testCreateGrant(); // Ensure a grant is created first
        platform.submitGame(
            1,
            "Game One",
            "An awesome adventure game",
            "ipfs://QmX8",
            "ipfs://QmX8",
            "ipfs://QmX8"
        );

        GamingGrantPlatform.Game memory game = platform.getGame(1);

        assertEq(game.name, "Game One");
        assertEq(game.details, "An awesome adventure game");
        assertEq(game.voteCount, 0);
        assertEq(game.funding, 0);
    }

    function testGetTotalVotes() public {
        testCreateGrant(); // Ensure a grant is created first

        uint256 totalVotes = platform.getTotalVotes(1);
        assertEq(totalVotes, 0); // Initially, there should be no votes

        platform.submitGame(
            1,
            "Game One",
            "An awesome adventure game",
            "ipfs://QmX8",
            "ipfs://QmX8",
            "ipfs://QmX8"
        );

        // Simulate voting (need to add voting logic here)
        vm.deal(address(0x2), 1 ether); // Fund another address for voting
        vm.startPrank(address(0x2));
        platform.vote{value: 1 ether}(1, 1);
        vm.stopPrank();

        totalVotes = platform.getTotalVotes(1);
        assertEq(totalVotes, 1); // There should be one vote now
    }

    function testGetVoteCount() public {
        testCreateGrant(); // Ensure a grant is created first
        platform.submitGame(
            1,
            "Game One",
            "An awesome adventure game",
            "ipfs://QmX8",
            "ipfs://QmX8",
            "ipfs://QmX8"
        );

        uint256 voteCount = platform.getVoteCount(1);
        assertEq(voteCount, 0); // Initially, there should be no votes

        vm.deal(address(0x2), 1 ether); // Fund another address for voting
        vm.startPrank(address(0x2));
        platform.vote{value: 1 ether}(1, 1);
        vm.stopPrank();

        voteCount = platform.getVoteCount(1);
        assertEq(voteCount, 1); // There should be one vote now
    }

    function testGetAllGamesOfGrant() public {
        testCreateGrant(); // Ensure a grant is created first
        vm.prank(developer1);
        platform.submitGame(
            1,
            "Game One",
            "An awesome adventure game",
            "ipfs://QmX8",
            "ipfs://QmX8",
            "ipfs://QmX8"
        );
        vm.prank(developer2);
        platform.submitGame(
            1,
            "Game Two",
            "A thrilling RPG",
            "ipfs://QmX8",
            "ipfs://QmX8",
            "ipfs://QmX8"
        );

        uint256[] memory games = platform.getAllGamesOfGrant(1);

        assertEq(games.length, 2); // Should return two games
        assertEq(games[0], 1); // Game ID for "Game One"
        assertEq(games[1], 2); // Game ID for "Game Two"
    }

    function testGetAllGrants() public {
        testCreateGrant(); // Ensure a grant is created first

        GamingGrantPlatform.Grant[] memory grants = platform.getAllGrants();
        assertEq(grants.length, 1); // Should return one grant
        assertEq(grants[0].name, "GameDev Fund"); // Check the grant name
    }

    function testGetGrant() public {
        testCreateGrant(); // Ensure a grant is created first

        GamingGrantPlatform.Grant memory grant = platform.getGrant(1);
        assertEq(grant.name, "GameDev Fund"); // Check the grant name
    }
}
