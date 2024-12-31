// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "forge-std/Test.sol";
import "../src/ChainPlay.sol";

contract GamingGrantPlatformTest is Test {
    GamingGrantPlatform platform;
    address public creator;
    address public developer1;
    address public developer2;
    address public voter1;
    address public voter2;

    // Test constants
    uint256 constant GRANT_AMOUNT = 10 ether;
    uint256 constant GRANT_DURATION = 7 days;
    uint256 constant VOTE_AMOUNT = 1 ether;

    function setUp() public {
        platform = new GamingGrantPlatform();

        // Setup test addresses
        creator = makeAddr("creator");
        developer1 = makeAddr("developer1");
        developer2 = makeAddr("developer2");
        voter1 = makeAddr("voter1");
        voter2 = makeAddr("voter2");

        // Fund test addresses
        vm.deal(creator, 100 ether);
        vm.deal(voter1, 10 ether);
        vm.deal(voter2, 10 ether);
    }

    /* Grant Creation Tests */

    function testCreateGrant() public {
        vm.startPrank(creator);

        platform.createGrant{value: GRANT_AMOUNT}(
            "Game Development Grant",
            GRANT_AMOUNT,
            GRANT_DURATION,
            "ipfs://grant-uri"
        );

        GamingGrantPlatform.Grant memory grant = platform.getGrant(1);

        assertEq(grant.name, "Game Development Grant");
        assertEq(grant.totalAmount, GRANT_AMOUNT);
        assertEq(grant.duration, GRANT_DURATION);
        assertEq(grant.creator, creator);
        assertEq(grant.grantURI, "ipfs://grant-uri");
        assertFalse(grant.finalized);

        vm.stopPrank();
    }

    function testCreateGrantWithInsufficientFunds() public {
        vm.startPrank(creator);

        vm.expectRevert("Ether sent must equal totalAmount");
        platform.createGrant{value: 1 ether}(
            "Game Development Grant",
            GRANT_AMOUNT,
            GRANT_DURATION,
            "ipfs://grant-uri"
        );

        vm.stopPrank();
    }

    /* Game Submission Tests */

    function testSubmitGame() public {
        // First create a grant
        vm.prank(creator);
        platform.createGrant{value: GRANT_AMOUNT}(
            "Game Development Grant",
            GRANT_AMOUNT,
            GRANT_DURATION,
            "ipfs://grant-uri"
        );

        // Submit a game
        vm.startPrank(developer1);
        platform.submitGame(
            1, // grantId
            "Awesome Game",
            "An awesome game description",
            "ipfs://game-uri",
            "ipfs://image-uri",
            "ipfs://video-uri",
            GamingGrantPlatform.Genre.Action
        );

        GamingGrantPlatform.Game memory game = platform.getGame(1);

        assertEq(game.name, "Awesome Game");
        assertEq(game.developer, developer1);
        assertEq(game.gameURI, "ipfs://game-uri");
        assertEq(game.imageURI, "ipfs://image-uri");
        assertEq(game.videoURI, "ipfs://video-uri");
        assertEq(uint(game.genre), uint(GamingGrantPlatform.Genre.Action));

        vm.stopPrank();
    }

    function testCannotSubmitMultipleGamesPerGrant() public {
        // Create grant
        vm.prank(creator);
        platform.createGrant{value: GRANT_AMOUNT}(
            "Game Development Grant",
            GRANT_AMOUNT,
            GRANT_DURATION,
            "ipfs://grant-uri"
        );

        // Submit first game
        vm.startPrank(developer1);
        platform.submitGame(
            1,
            "First Game",
            "Description",
            "ipfs://game-uri-1",
            "ipfs://image-uri-1",
            "ipfs://video-uri-1",
            GamingGrantPlatform.Genre.Action
        );

        // Try to submit second game
        vm.expectRevert(GamingGrantPlatform.GameAlreadySubmitted.selector);
        platform.submitGame(
            1,
            "Second Game",
            "Description",
            "ipfs://game-uri-2",
            "ipfs://image-uri-2",
            "ipfs://video-uri-2",
            GamingGrantPlatform.Genre.RPG
        );

        vm.stopPrank();
    }

    function testCannotSubmitGameAfterGrantEnds() public {
        // Create grant
        vm.prank(creator);
        platform.createGrant{value: GRANT_AMOUNT}(
            "Game Development Grant",
            GRANT_AMOUNT,
            GRANT_DURATION,
            "ipfs://grant-uri"
        );

        // Move time forward past grant duration
        vm.warp(block.timestamp + GRANT_DURATION + 1);

        // Try to submit game
        vm.startPrank(developer1);
        vm.expectRevert("Grant has ended");
        platform.submitGame(
            1,
            "Late Game",
            "Description",
            "ipfs://game-uri",
            "ipfs://image-uri",
            "ipfs://video-uri",
            GamingGrantPlatform.Genre.Action
        );

        vm.stopPrank();
    }

    /* Voting Tests */

    function testVoting() public {
        // Setup grant and game
        setupGrantAndGame();

        // Vote
        vm.prank(voter1);
        platform.vote{value: VOTE_AMOUNT}(1, 1);

        GamingGrantPlatform.Game memory game = platform.getGame(1);
        assertEq(game.voteCount, 1);
        assertEq(game.funding, VOTE_AMOUNT);
    }

    function testCannotVoteMultipleTimes() public {
        // Setup grant and game
        setupGrantAndGame();

        vm.startPrank(voter1);

        // First vote succeeds
        platform.vote{value: VOTE_AMOUNT}(1, 1);

        // Second vote fails
        vm.expectRevert("Already voted");
        platform.vote{value: VOTE_AMOUNT}(1, 1);

        vm.stopPrank();
    }

    function testCannotVoteAfterGrantEnds() public {
        // Setup grant and game
        setupGrantAndGame();

        // Move time forward past grant duration
        vm.warp(block.timestamp + GRANT_DURATION + 1);

        // Try to vote
        vm.startPrank(voter1);
        vm.expectRevert("Grant has ended");
        platform.vote{value: VOTE_AMOUNT}(1, 1);

        vm.stopPrank();
    }

    /* Grant Finalization Tests */

    function testGrantFinalization() public {
        // Setup grant and game
        setupGrantAndGame();

        // Add votes
        vm.prank(voter1);
        platform.vote{value: VOTE_AMOUNT}(1, 1);

        vm.prank(voter2);
        platform.vote{value: 2 ether}(1, 1);

        // Move time forward past grant duration
        vm.warp(block.timestamp + GRANT_DURATION + 1);

        // Record developer's initial balance
        uint256 initialBalance = developer1.balance;

        // Finalize grant
        vm.prank(creator);
        platform.finalizeGrant(1);

        // Verify developer received funds
        assertGt(developer1.balance, initialBalance);

        // Verify grant is marked as finalized
        GamingGrantPlatform.Grant memory grant = platform.getGrant(1);
        assertTrue(grant.finalized);
    }

    function testCannotFinalizeGrantBeforeEnd() public {
        // Setup grant and game
        setupGrantAndGame();

        // Try to finalize before end
        vm.prank(creator);
        vm.expectRevert("Grant duration not over");
        platform.finalizeGrant(1);
    }

    function testCannotFinalizeGrantTwice() public {
        // Setup grant and game
        setupGrantAndGame();

        // Move time forward past grant duration
        vm.warp(block.timestamp + GRANT_DURATION + 1);

        vm.startPrank(creator);

        // First finalization succeeds
        platform.finalizeGrant(1);

        // Second finalization fails
        vm.expectRevert("Grant already finalized");
        platform.finalizeGrant(1);

        vm.stopPrank();
    }

    function testOnlyCreatorCanFinalizeGrant() public {
        // Setup grant and game
        setupGrantAndGame();

        // Move time forward past grant duration
        vm.warp(block.timestamp + GRANT_DURATION + 1);

        // Try to finalize from non-creator address
        vm.prank(developer1);
        vm.expectRevert(GamingGrantPlatform.NotGrantCreator.selector);
        platform.finalizeGrant(1);
    }

    /* Getter Function Tests */

    function testGetAllGamesOfGrant() public {
        // Setup grant and multiple games
        vm.prank(creator);
        platform.createGrant{value: GRANT_AMOUNT}(
            "Game Development Grant",
            GRANT_AMOUNT,
            GRANT_DURATION,
            "ipfs://grant-uri"
        );

        vm.prank(developer1);
        platform.submitGame(
            1,
            "Game 1",
            "Description 1",
            "ipfs://game-uri-1",
            "ipfs://image-uri-1",
            "ipfs://video-uri-1",
            GamingGrantPlatform.Genre.Action
        );

        vm.prank(developer2);
        platform.submitGame(
            1,
            "Game 2",
            "Description 2",
            "ipfs://game-uri-2",
            "ipfs://image-uri-2",
            "ipfs://video-uri-2",
            GamingGrantPlatform.Genre.RPG
        );

        GamingGrantPlatform.Game[] memory games = platform.getAllGamesOfGrant(
            1
        );
        assertEq(games.length, 2);
        assertEq(games[0].name, "Game 1");
        assertEq(games[1].name, "Game 2");
    }

    function testGetAllGamesByGenre() public {
        // Setup grant and multiple games of different genres
        vm.prank(creator);
        platform.createGrant{value: GRANT_AMOUNT}(
            "Game Development Grant",
            GRANT_AMOUNT,
            GRANT_DURATION,
            "ipfs://grant-uri"
        );

        vm.prank(developer1);
        platform.submitGame(
            1,
            "Action Game 1",
            "Description",
            "ipfs://game-uri-1",
            "ipfs://image-uri-1",
            "ipfs://video-uri-1",
            GamingGrantPlatform.Genre.Action
        );

        vm.prank(developer2);
        platform.submitGame(
            1,
            "RPG Game",
            "Description",
            "ipfs://game-uri-2",
            "ipfs://image-uri-2",
            "ipfs://video-uri-2",
            GamingGrantPlatform.Genre.RPG
        );

        // Get all Action games
        GamingGrantPlatform.Game[] memory actionGames = platform
            .getAllGamesByGenre(GamingGrantPlatform.Genre.Action);
        assertEq(actionGames.length, 1);
        assertEq(actionGames[0].name, "Action Game 1");
    }

    /* Helper Functions */

    function setupGrantAndGame() internal {
        // Create grant
        vm.prank(creator);
        platform.createGrant{value: GRANT_AMOUNT}(
            "Game Development Grant",
            GRANT_AMOUNT,
            GRANT_DURATION,
            "ipfs://grant-uri"
        );

        // Submit game
        vm.prank(developer1);
        platform.submitGame(
            1,
            "Test Game",
            "Description",
            "ipfs://game-uri",
            "ipfs://image-uri",
            "ipfs://video-uri",
            GamingGrantPlatform.Genre.Action
        );
    }

    function testQuadraticFundingDistribution() public {
        // Setup initial grant
        vm.prank(creator);
        platform.createGrant{value: GRANT_AMOUNT}(
            "Game Development Grant",
            GRANT_AMOUNT,
            GRANT_DURATION,
            "ipfs://grant-uri"
        );

        // Developer 1 submits first game
        vm.prank(developer1);
        platform.submitGame(
            1,
            "Game 1",
            "Description 1",
            "ipfs://game-uri-1",
            "ipfs://image-uri-1",
            "ipfs://video-uri-1",
            GamingGrantPlatform.Genre.Action
        );

        // Developer 2 submits second game
        vm.prank(developer2);
        platform.submitGame(
            1,
            "Game 2",
            "Description 2",
            "ipfs://game-uri-2",
            "ipfs://image-uri-2",
            "ipfs://video-uri-2",
            GamingGrantPlatform.Genre.RPG
        );

        // Record initial balances
        uint256 dev1InitialBalance = developer1.balance;
        uint256 dev2InitialBalance = developer2.balance;

        // Voter 1 contributes a large amount to Game 1
        vm.prank(voter1);
        platform.vote{value: 4 ether}(1, 1); // 4 ETH to Game 1

        // Voter 2 and Voter 3 split their votes for Game 2
        address voter3 = makeAddr("voter3");
        vm.deal(voter3, 10 ether);

        vm.prank(voter2);
        platform.vote{value: 1 ether}(2, 1); // 1 ETH to Game 2

        vm.prank(voter3);
        platform.vote{value: 1 ether}(2, 1); // 1 ETH to Game 2

        // Move time forward past grant duration
        vm.warp(block.timestamp + GRANT_DURATION + 1);

        // Finalize grant
        vm.prank(creator);
        platform.finalizeGrant(1);

        // Calculate final balances
        uint256 dev1FinalBalance = developer1.balance;
        uint256 dev2FinalBalance = developer2.balance;

        uint256 dev1Received = dev1FinalBalance - dev1InitialBalance;
        uint256 dev2Received = dev2FinalBalance - dev2InitialBalance;

        // Verify the quadratic funding distribution
        // Game 1: Single contribution of 4 ETH = sqrt(4)^2 = 4
        // Game 2: Two contributions of 1 ETH = (sqrt(1) + sqrt(1))^2 = 4
        // Both games should receive equal matching because:
        // - Game 1: One large contribution has the same weight as
        // - Game 2: Two smaller contributions combined
        // The matching pool (10 ETH) should be split equally

        // Expected amounts:
        // Game 1: 4 ETH (direct) + 5 ETH (matching) = 9 ETH
        // Game 2: 2 ETH (direct) + 5 ETH (matching) = 7 ETH

        assertEq(
            dev1Received,
            9 ether,
            "Developer 1 should receive 9 ETH total"
        );
        assertEq(
            dev2Received,
            7 ether,
            "Developer 2 should receive 7 ETH total"
        );

        // Verify the ratio of matched funds is approximately equal
        // (dev1Received - 4 ether) should be approximately equal to
        // (dev2Received - 2 ether)
        uint256 dev1Matched = dev1Received - 4 ether;
        uint256 dev2Matched = dev2Received - 2 ether;
        assertEq(dev1Matched, dev2Matched, "Matched amounts should be equal");
    }
}
