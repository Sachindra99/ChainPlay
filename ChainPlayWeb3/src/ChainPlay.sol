// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {Counters} from "./Counters.sol";

/**
 * @title Gaming Grant Platform Contract
 * @notice A decentralized platform where gaming companies can create grants,
 *         game developers can post their games, and users can vote and fund games.
 *         After the grant duration ends, funds are distributed using Quadratic Funding rules.
 */
contract GamingGrantPlatform {
    using Counters for Counters.Counter;

    /* Errors */
    error GrantDurationOver();
    error InvalidGrant();
    error VotingNotOpen();
    error NotEnoughFunds();
    error GameAlreadySubmitted();
    error NotGrantCreator();

    /* Type declarations */
    struct Grant {
        string name;
        uint256 totalAmount; // Total grant amount from the company
        uint256 startTime; // Timestamp when the grant starts
        uint256 duration; // Duration of the grant in seconds
        bool finalized; // True if grant funding has been distributed
        uint256[] games; // List of game IDs under this grant
        uint256 totalVotes; // Total votes across all games (used for quadratic funding)
        address creator; // Tracks the creator's address
        string grantURI; // IPFS URI for the grant banner
    }

    struct Game {
        string name;
        string details;
        address developer;
        uint256 voteCount; // Number of votes received
        uint256 funding; // Amount funded by users
        string gameURI; // IPFS URI for the game download link
        string imageURI; // IPFS URI for the game's image
        string videoURI; // IPFS URI for the gameplay video
    }

    /* State variables */
    Counters.Counter private grantIdCounter;
    Counters.Counter private gameIdCounter;

    mapping(uint256 => Grant) private grants; // grantId => Grant
    mapping(uint256 => Game) private games; // gameId => Game
    mapping(address => mapping(uint256 => bool)) private submittedGames; // Tracks if developer submitted a game for a grant
    mapping(uint256 => mapping(address => uint256)) private votes; // Tracks votes by users for games in a grant
    mapping(uint256 => mapping(address => bool)) private hasVoted; // Tracks if a user voted for a game under a specific grant

    /* Events */
    event GrantCreated(
        uint256 indexed grantId,
        string name,
        uint256 totalAmount,
        uint256 startTime,
        uint256 duration,
        string grantURI
    );
    event GameSubmitted(
        uint256 indexed grantId,
        uint256 indexed gameId,
        address indexed developer,
        string gameURI,
        string imageURI,
        string videoURI
    );
    event Voted(uint256 indexed gameId, address indexed voter, uint256 amount);
    event GrantFinalized(
        uint256 indexed grantId,
        uint256 totalVotes,
        uint256 totalAmountDistributed
    );

    /* Modifiers */
    modifier grantActive(uint256 grantId) {
        require(
            block.timestamp <=
                grants[grantId].startTime + grants[grantId].duration,
            "Grant has ended"
        );
        _;
    }

    modifier grantExists(uint256 grantId) {
        require(grants[grantId].startTime != 0, "Grant does not exist");
        _;
    }

    modifier onlyGrantCreator(uint256 grantId) {
        if (msg.sender != grants[grantId].creator) revert NotGrantCreator();
        _;
    }

    /* Functions */

    /**
     * @notice Creates a new grant for game developers.
     * @param name Name of the grant.
     * @param totalAmount Total funding amount provided by the gaming company.
     * @param duration Duration of the grant in seconds.
     * @param grantURI IPFS URI for the grant banner.
     */
    function createGrant(
        string memory name,
        uint256 totalAmount,
        uint256 duration,
        string memory grantURI
    ) external payable {
        require(msg.value == totalAmount, "Ether sent must equal totalAmount");

        grantIdCounter.increment();
        uint256 grantId = grantIdCounter.current();

        grants[grantId] = Grant({
            name: name,
            totalAmount: totalAmount,
            startTime: block.timestamp,
            duration: duration,
            finalized: false,
            games: new uint256[](0),
            totalVotes: 0,
            creator: msg.sender,
            grantURI: grantURI
        });

        emit GrantCreated(
            grantId,
            name,
            totalAmount,
            block.timestamp,
            duration,
            grantURI
        );
    }

    /**
     * @notice Allows game developers to submit their game under a specific grant.
     * @param grantId ID of the grant.
     * @param gameName Name of the game.
     * @param gameDetails Details of the game (e.g., description, features).
     * @param gameURI IPFS URI for the game download link.
     * @param imageURI IPFS URI for the game's image.
     * @param videoURI IPFS URI for the gameplay video.
     */
    function submitGame(
        uint256 grantId,
        string memory gameName,
        string memory gameDetails,
        string memory gameURI,
        string memory imageURI,
        string memory videoURI
    ) external grantExists(grantId) grantActive(grantId) {
        if (submittedGames[msg.sender][grantId]) {
            revert GameAlreadySubmitted();
        }

        gameIdCounter.increment();
        uint256 gameId = gameIdCounter.current();

        games[gameId] = Game({
            name: gameName,
            details: gameDetails,
            developer: msg.sender,
            voteCount: 0,
            funding: 0,
            gameURI: gameURI,
            imageURI: imageURI,
            videoURI: videoURI
        });

        grants[grantId].games.push(gameId);
        submittedGames[msg.sender][grantId] = true;

        emit GameSubmitted(
            grantId,
            gameId,
            msg.sender,
            gameURI,
            imageURI,
            videoURI
        );
    }

    /**
     * @notice Allows users to vote and fund their favorite game under a specific grant.
     * @param gameId ID of the game.
     * @param grantId ID of the grant.
     */
    function vote(
        uint256 gameId,
        uint256 grantId
    ) external payable grantExists(grantId) grantActive(grantId) {
        require(msg.value > 0, "Not enough funds sent");
        require(!hasVoted[grantId][msg.sender], "Already voted");

        votes[grantId][msg.sender] += msg.value;
        hasVoted[grantId][msg.sender] = true;

        games[gameId].voteCount++;
        games[gameId].funding += msg.value;
        grants[grantId].totalVotes++;

        emit Voted(gameId, msg.sender, msg.value);
    }

    /**
     * @notice Finalizes the grant after the duration is over and distributes the grant using Quadratic Funding.
     * @param grantId ID of the grant to be finalized.
     */
    function finalizeGrant(
        uint256 grantId
    ) external grantExists(grantId) onlyGrantCreator(grantId) {
        Grant storage grant = grants[grantId];
        require(
            block.timestamp > grant.startTime + grant.duration,
            "Grant duration not over"
        );
        require(!grant.finalized, "Grant already finalized");

        uint256 totalFunding = grant.totalAmount;
        uint256 totalVotes = grant.totalVotes;

        // Ensure there are votes to avoid division by zero
        if (totalVotes > 0) {
            // Quadratic funding logic
            for (uint256 i = 0; i < grant.games.length; i++) {
                uint256 gameId = grant.games[i];
                Game storage game = games[gameId];

                uint256 quadraticFunding = ((game.voteCount ** 2) *
                    totalFunding) / (totalVotes ** 2);
                game.funding += quadraticFunding;

                payable(game.developer).transfer(game.funding);
            }
        }

        grant.finalized = true;
        emit GrantFinalized(grantId, totalVotes, totalFunding);
    }

    /* Getter Functions */
    function getGrant(uint256 grantId) external view returns (Grant memory) {
        return grants[grantId];
    }

    function getGame(uint256 gameId) external view returns (Game memory) {
        return games[gameId];
    }

    function getTotalVotes(uint256 grantId) external view returns (uint256) {
        return grants[grantId].totalVotes;
    }

    function getVoteCount(uint256 gameId) external view returns (uint256) {
        return games[gameId].voteCount;
    }

    function getAllGamesOfGrant(
        uint256 grantId
    ) external view returns (uint256[] memory) {
        return grants[grantId].games;
    }

    function getAllGrants() external view returns (Grant[] memory) {
        Grant[] memory allGrants = new Grant[](grantIdCounter.current());
        for (uint256 i = 1; i <= grantIdCounter.current(); i++) {
            allGrants[i - 1] = grants[i];
        }
        return allGrants;
    }
}
