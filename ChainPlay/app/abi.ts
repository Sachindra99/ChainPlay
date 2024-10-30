const abi = [
  {
    "type": "function",
    "name": "createGrant",
    "inputs": [
      { "name": "name", "type": "string", "internalType": "string" },
      { "name": "totalAmount", "type": "uint256", "internalType": "uint256" },
      { "name": "duration", "type": "uint256", "internalType": "uint256" },
      { "name": "grantURI", "type": "string", "internalType": "string" }
    ],
    "outputs": [],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "finalizeGrant",
    "inputs": [
      { "name": "grantId", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "getAllGames",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "tuple[]",
        "internalType": "struct GamingGrantPlatform.Game[]",
        "components": [
          { "name": "name", "type": "string", "internalType": "string" },
          { "name": "details", "type": "string", "internalType": "string" },
          {
            "name": "developer",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "voteCount",
            "type": "uint256",
            "internalType": "uint256"
          },
          { "name": "funding", "type": "uint256", "internalType": "uint256" },
          { "name": "gameURI", "type": "string", "internalType": "string" },
          { "name": "imageURI", "type": "string", "internalType": "string" },
          { "name": "videoURI", "type": "string", "internalType": "string" },
          {
            "name": "genre",
            "type": "uint8",
            "internalType": "enum GamingGrantPlatform.Genre"
          },
          { "name": "grantId", "type": "uint256", "internalType": "uint256" }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getAllGamesByGenre",
    "inputs": [
      {
        "name": "genre",
        "type": "uint8",
        "internalType": "enum GamingGrantPlatform.Genre"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "tuple[]",
        "internalType": "struct GamingGrantPlatform.Game[]",
        "components": [
          { "name": "name", "type": "string", "internalType": "string" },
          { "name": "details", "type": "string", "internalType": "string" },
          {
            "name": "developer",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "voteCount",
            "type": "uint256",
            "internalType": "uint256"
          },
          { "name": "funding", "type": "uint256", "internalType": "uint256" },
          { "name": "gameURI", "type": "string", "internalType": "string" },
          { "name": "imageURI", "type": "string", "internalType": "string" },
          { "name": "videoURI", "type": "string", "internalType": "string" },
          {
            "name": "genre",
            "type": "uint8",
            "internalType": "enum GamingGrantPlatform.Genre"
          },
          { "name": "grantId", "type": "uint256", "internalType": "uint256" }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getAllGamesOfGrant",
    "inputs": [
      { "name": "grantId", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [
      {
        "name": "",
        "type": "tuple[]",
        "internalType": "struct GamingGrantPlatform.Game[]",
        "components": [
          { "name": "name", "type": "string", "internalType": "string" },
          { "name": "details", "type": "string", "internalType": "string" },
          {
            "name": "developer",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "voteCount",
            "type": "uint256",
            "internalType": "uint256"
          },
          { "name": "funding", "type": "uint256", "internalType": "uint256" },
          { "name": "gameURI", "type": "string", "internalType": "string" },
          { "name": "imageURI", "type": "string", "internalType": "string" },
          { "name": "videoURI", "type": "string", "internalType": "string" },
          {
            "name": "genre",
            "type": "uint8",
            "internalType": "enum GamingGrantPlatform.Genre"
          },
          { "name": "grantId", "type": "uint256", "internalType": "uint256" }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getAllGrants",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "tuple[]",
        "internalType": "struct GamingGrantPlatform.Grant[]",
        "components": [
          { "name": "name", "type": "string", "internalType": "string" },
          {
            "name": "totalAmount",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "startTime",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "duration",
            "type": "uint256",
            "internalType": "uint256"
          },
          { "name": "finalized", "type": "bool", "internalType": "bool" },
          {
            "name": "games",
            "type": "uint256[]",
            "internalType": "uint256[]"
          },
          {
            "name": "totalVotes",
            "type": "uint256",
            "internalType": "uint256"
          },
          { "name": "creator", "type": "address", "internalType": "address" },
          { "name": "grantURI", "type": "string", "internalType": "string" }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getGame",
    "inputs": [
      { "name": "gameId", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [
      {
        "name": "",
        "type": "tuple",
        "internalType": "struct GamingGrantPlatform.Game",
        "components": [
          { "name": "name", "type": "string", "internalType": "string" },
          { "name": "details", "type": "string", "internalType": "string" },
          {
            "name": "developer",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "voteCount",
            "type": "uint256",
            "internalType": "uint256"
          },
          { "name": "funding", "type": "uint256", "internalType": "uint256" },
          { "name": "gameURI", "type": "string", "internalType": "string" },
          { "name": "imageURI", "type": "string", "internalType": "string" },
          { "name": "videoURI", "type": "string", "internalType": "string" },
          {
            "name": "genre",
            "type": "uint8",
            "internalType": "enum GamingGrantPlatform.Genre"
          },
          { "name": "grantId", "type": "uint256", "internalType": "uint256" }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getGrant",
    "inputs": [
      { "name": "grantId", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [
      {
        "name": "",
        "type": "tuple",
        "internalType": "struct GamingGrantPlatform.Grant",
        "components": [
          { "name": "name", "type": "string", "internalType": "string" },
          {
            "name": "totalAmount",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "startTime",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "duration",
            "type": "uint256",
            "internalType": "uint256"
          },
          { "name": "finalized", "type": "bool", "internalType": "bool" },
          {
            "name": "games",
            "type": "uint256[]",
            "internalType": "uint256[]"
          },
          {
            "name": "totalVotes",
            "type": "uint256",
            "internalType": "uint256"
          },
          { "name": "creator", "type": "address", "internalType": "address" },
          { "name": "grantURI", "type": "string", "internalType": "string" }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getTotalVotes",
    "inputs": [
      { "name": "grantId", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getVoteCount",
    "inputs": [
      { "name": "gameId", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "submitGame",
    "inputs": [
      { "name": "grantId", "type": "uint256", "internalType": "uint256" },
      { "name": "gameName", "type": "string", "internalType": "string" },
      { "name": "gameDetails", "type": "string", "internalType": "string" },
      { "name": "gameURI", "type": "string", "internalType": "string" },
      { "name": "imageURI", "type": "string", "internalType": "string" },
      { "name": "videoURI", "type": "string", "internalType": "string" },
      {
        "name": "genre",
        "type": "uint8",
        "internalType": "enum GamingGrantPlatform.Genre"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "vote",
    "inputs": [
      { "name": "gameId", "type": "uint256", "internalType": "uint256" },
      { "name": "grantId", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [],
    "stateMutability": "payable"
  },
  {
    "type": "event",
    "name": "GameSubmitted",
    "inputs": [
      {
        "name": "grantId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "gameId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "developer",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "gameURI",
        "type": "string",
        "indexed": false,
        "internalType": "string"
      },
      {
        "name": "imageURI",
        "type": "string",
        "indexed": false,
        "internalType": "string"
      },
      {
        "name": "videoURI",
        "type": "string",
        "indexed": false,
        "internalType": "string"
      },
      {
        "name": "genre",
        "type": "uint8",
        "indexed": false,
        "internalType": "enum GamingGrantPlatform.Genre"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "GrantCreated",
    "inputs": [
      {
        "name": "grantId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "name",
        "type": "string",
        "indexed": false,
        "internalType": "string"
      },
      {
        "name": "totalAmount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "startTime",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "duration",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "grantURI",
        "type": "string",
        "indexed": false,
        "internalType": "string"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "GrantFinalized",
    "inputs": [
      {
        "name": "grantId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "totalVotes",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "totalAmountDistributed",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "Voted",
    "inputs": [
      {
        "name": "gameId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "voter",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "amount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  { "type": "error", "name": "GameAlreadySubmitted", "inputs": [] },
  { "type": "error", "name": "GrantDurationOver", "inputs": [] },
  { "type": "error", "name": "InvalidGrant", "inputs": [] },
  { "type": "error", "name": "NotEnoughFunds", "inputs": [] },
  { "type": "error", "name": "NotGrantCreator", "inputs": [] },
  { "type": "error", "name": "VotingNotOpen", "inputs": [] }
];
    export default abi