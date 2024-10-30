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
    enum Genre {
        Action,
        Adventure,
        RPG,
        Strategy,
        Sports,
        Puzzle
    }

    struct Grant {
        string name;
        uint256 totalAmount;
        uint256 startTime;
        uint256 duration;
        bool finalized;
        uint256[] games;
        uint256 totalVotes;
        address creator;
        string grantURI;
    }

    struct Game {
        string name;
        string details;
        address developer;
        uint256 voteCount;
        uint256 funding;
        string gameURI;
        string imageURI;
        string videoURI;
        Genre genre; // New genre field added here
        uint256 grantId;
    }

    /* State variables */
    Counters.Counter private grantIdCounter;
    Counters.Counter private gameIdCounter;

    mapping(uint256 => Grant) private grants;
    mapping(uint256 => Game) private games;
    mapping(address => mapping(uint256 => bool)) private submittedGames;
    mapping(uint256 => mapping(address => uint256)) private votes;
    mapping(uint256 => mapping(address => bool)) private hasVoted;

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
        string videoURI,
        Genre genre // Emit genre in the GameSubmitted event
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

    function submitGame(
        uint256 grantId,
        string memory gameName,
        string memory gameDetails,
        string memory gameURI,
        string memory imageURI,
        string memory videoURI,
        Genre genre // Genre parameter added here
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
            videoURI: videoURI,
            genre: genre,
            grantId: grantId
        });

        grants[grantId].games.push(gameId);
        submittedGames[msg.sender][grantId] = true;

        emit GameSubmitted(
            grantId,
            gameId,
            msg.sender,
            gameURI,
            imageURI,
            videoURI,
            genre
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

        // Ensure there are votes to avoid division by zero
        if (grant.totalVotes > 0) {
            // Quadratic funding logic
            for (uint256 i = 0; i < grant.games.length; i++) {
                uint256 gameId = grant.games[i];
                Game storage game = games[gameId];
                uint256 sumOfSquareRoots;

                // Calculate sum(sqrt(c_i)) for each game's contributions
                for (uint256 j = 0; j < grant.totalVotes; j++) {
                    uint256 contribution = votes[grantId][game.developer];
                    sumOfSquareRoots += sqrt(contribution);
                }

                // Calculate the matched amount using the sum of square roots
                uint256 matchedAmount = (totalFunding * sumOfSquareRoots) /
                    grant.totalVotes;

                // Update the funding and transfer to the developer
                game.funding += matchedAmount;
                payable(game.developer).transfer(game.funding);
            }
        }

        grant.finalized = true;
        emit GrantFinalized(grantId, grant.totalVotes, totalFunding);
    }

    /**
     * @dev Computes the integer square root of a number.
     */
    function sqrt(uint256 x) private pure returns (uint256) {
        uint256 z = (x + 1) / 2;
        uint256 y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
        return y;
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
    ) external view returns (Game[] memory) {
        uint256[] memory gameIds = grants[grantId].games;
        Game[] memory gamesInGrant = new Game[](gameIds.length);

        for (uint256 i = 0; i < gameIds.length; i++) {
            gamesInGrant[i] = games[gameIds[i]];
        }

        return gamesInGrant;
    }

    function getAllGrants() external view returns (Grant[] memory) {
        Grant[] memory allGrants = new Grant[](grantIdCounter.current());
        for (uint256 i = 1; i <= grantIdCounter.current(); i++) {
            allGrants[i - 1] = grants[i];
        }
        return allGrants;
    }

    function getAllGames() external view returns (Game[] memory) {
        Game[] memory allGames = new Game[](gameIdCounter.current());
        for (uint256 i = 1; i <= gameIdCounter.current(); i++) {
            allGames[i - 1] = games[i];
        }
        return allGames;
    }

    /**
     * @notice Fetches all games on the platform by genre.
     * @param genre Genre to filter games by.
     * @return gamesByGenre Array of games that match the specified genre.
     */
    function getAllGamesByGenre(
        Genre genre
    ) external view returns (Game[] memory) {
        uint256 gameCount = gameIdCounter.current();
        uint256 matchingGameCount;

        // First loop to count matching games
        for (uint256 i = 1; i <= gameCount; i++) {
            if (games[i].genre == genre) {
                matchingGameCount++;
            }
        }

        // Create a temporary array to hold the matching games
        Game[] memory gamesByGenre = new Game[](matchingGameCount);
        uint256 index;

        // Second loop to populate the array with matching games
        for (uint256 i = 1; i <= gameCount; i++) {
            if (games[i].genre == genre) {
                gamesByGenre[index] = games[i];
                index++;
            }
        }

        return gamesByGenre;
    }
}
