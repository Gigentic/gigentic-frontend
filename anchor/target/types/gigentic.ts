/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/gigentic.json`.
 */
export type Gigentic = {
  "address": "3E8qHURSLd6P1cWR5Bwbekvn9P9cwN637dhjNRsVwuCH",
  "metadata": {
    "name": "gigentic",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "agentToConsumerRating",
      "discriminator": [
        76,
        242,
        9,
        100,
        82,
        123,
        175,
        129
      ],
      "accounts": [
        {
          "name": "signer",
          "docs": [
            "The account of the user deploying and paying for the initialization.",
            "Marked as `mut` because it will be charged for rent."
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "service",
          "writable": true
        },
        {
          "name": "review",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  118,
                  105,
                  101,
                  119,
                  95,
                  115,
                  101,
                  114,
                  118,
                  105,
                  99,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "service"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "rating",
          "type": "u8"
        },
        {
          "name": "review",
          "type": "string"
        }
      ]
    },
    {
      "name": "consumerToAgentRating",
      "discriminator": [
        20,
        65,
        222,
        1,
        186,
        152,
        255,
        154
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "service",
          "writable": true
        },
        {
          "name": "review",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  118,
                  105,
                  101,
                  119,
                  95,
                  115,
                  101,
                  114,
                  118,
                  105,
                  99,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "service"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "rating",
          "type": "u8"
        },
        {
          "name": "review",
          "type": "string"
        }
      ]
    },
    {
      "name": "initializeService",
      "discriminator": [
        201,
        217,
        126,
        168,
        40,
        110,
        122,
        89
      ],
      "accounts": [
        {
          "name": "provider",
          "writable": true,
          "signer": true
        },
        {
          "name": "serviceRegistry",
          "writable": true
        },
        {
          "name": "service",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  101,
                  114,
                  118,
                  105,
                  99,
                  101
                ]
              },
              {
                "kind": "arg",
                "path": "uniqueId"
              },
              {
                "kind": "account",
                "path": "provider"
              }
            ]
          }
        },
        {
          "name": "mint"
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "uniqueId",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "price",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initializeServiceRegistry",
      "discriminator": [
        84,
        8,
        210,
        235,
        241,
        25,
        15,
        155
      ],
      "accounts": [
        {
          "name": "initializer",
          "docs": [
            "The account of the user deploying and paying for the initialization.",
            "Marked as `mut` because it will be charged for rent."
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "serviceRegistry",
          "docs": [
            "The ServiceRegistry account to be initialized.",
            "`account(zero)` means this account should be created and initialized with zeroes.",
            "It ensures the account is new and prevents double initialization."
          ],
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "feeAccount",
          "type": "pubkey"
        },
        {
          "name": "feePercentage",
          "type": "u8"
        }
      ]
    },
    {
      "name": "payService",
      "discriminator": [
        181,
        29,
        236,
        80,
        246,
        226,
        34,
        174
      ],
      "accounts": [
        {
          "name": "buyer",
          "writable": true,
          "signer": true
        },
        {
          "name": "service",
          "writable": true
        },
        {
          "name": "serviceRegistry",
          "writable": true
        },
        {
          "name": "escrow",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
                ]
              },
              {
                "kind": "account",
                "path": "service"
              }
            ]
          }
        },
        {
          "name": "review",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  118,
                  105,
                  101,
                  119,
                  95,
                  115,
                  101,
                  114,
                  118,
                  105,
                  99,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "service"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "signService",
      "discriminator": [
        170,
        73,
        190,
        114,
        213,
        177,
        176,
        218
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "service",
          "writable": true
        },
        {
          "name": "escrow",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
                ]
              },
              {
                "kind": "account",
                "path": "service"
              }
            ]
          }
        },
        {
          "name": "serviceProvider",
          "docs": [
            "CHECK : SAFE"
          ],
          "writable": true
        },
        {
          "name": "feeAccount",
          "docs": [
            "CHECK : SAFE"
          ],
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "escrow",
      "discriminator": [
        31,
        213,
        123,
        187,
        186,
        22,
        218,
        155
      ]
    },
    {
      "name": "review",
      "discriminator": [
        124,
        63,
        203,
        215,
        226,
        30,
        222,
        15
      ]
    },
    {
      "name": "service",
      "discriminator": [
        144,
        62,
        76,
        129,
        167,
        36,
        151,
        250
      ]
    },
    {
      "name": "serviceRegistry",
      "discriminator": [
        105,
        133,
        96,
        79,
        207,
        176,
        202,
        71
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "descriptionTooLong",
      "msg": "Description is too long"
    },
    {
      "code": 6001,
      "name": "serviceAlreadyInitialized",
      "msg": "Service already initialized"
    },
    {
      "code": 6002,
      "name": "overflow",
      "msg": "overflow"
    },
    {
      "code": 6003,
      "name": "reviewError",
      "msg": "reviewError"
    },
    {
      "code": 6004,
      "name": "noServicesRegistered",
      "msg": "No services registered"
    },
    {
      "code": 6005,
      "name": "invalidAmount",
      "msg": "Provide Amount Greater than 0"
    },
    {
      "code": 6006,
      "name": "unauthorizedAccess",
      "msg": "Unauthorized access"
    },
    {
      "code": 6007,
      "name": "invalidState",
      "msg": "The contract is in an invalid state for the requested operation."
    },
    {
      "code": 6008,
      "name": "transferFailed",
      "msg": "Fund transfer failed."
    },
    {
      "code": 6009,
      "name": "invalidRating",
      "msg": "Invalid rating. Rating must be between 0 and 5."
    }
  ],
  "types": [
    {
      "name": "escrow",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "buyer",
            "type": "pubkey"
          },
          {
            "name": "serviceProvider",
            "type": "pubkey"
          },
          {
            "name": "feePercentage",
            "type": "u8"
          },
          {
            "name": "expectedAmount",
            "type": "u64"
          },
          {
            "name": "feeAccount",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "review",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "agentToConsumerRating",
            "type": "u8"
          },
          {
            "name": "consumerToAgentRating",
            "type": "u8"
          },
          {
            "name": "consumer",
            "type": "pubkey"
          },
          {
            "name": "serviceProvider",
            "type": "pubkey"
          },
          {
            "name": "agentToCustomerReview",
            "type": "string"
          },
          {
            "name": "customerToAgentReview",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "service",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "provider",
            "type": "pubkey"
          },
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "price",
            "type": "u64"
          },
          {
            "name": "reviews",
            "type": {
              "vec": "pubkey"
            }
          }
        ]
      }
    },
    {
      "name": "serviceRegistry",
      "docs": [
        "`ServiceRegistry` is an account that maintains a list of public keys for all registered services.",
        "It acts as a central directory for tracking and accessing service accounts within the program."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "serviceAccountAddresses",
            "type": {
              "vec": "pubkey"
            }
          },
          {
            "name": "feeAccount",
            "type": "pubkey"
          },
          {
            "name": "feePercentage",
            "type": "u8"
          }
        ]
      }
    }
  ]
};
