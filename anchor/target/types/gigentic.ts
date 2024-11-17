/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/gigentic.json`.
 */
export type Gigentic = {
  address: 'J2UENgBQrdJFy2NcFbBsxyHHdi4CZVuBg5FXmbYxfu4';
  metadata: {
    name: 'gigentic';
    version: '0.1.0';
    spec: '0.1.0';
    description: 'Created with Anchor';
  };
  instructions: [
  address: '2xtwCiDhiQ9vuTFpR3wECJaHyvtE7L9pBPbNHdnsk1YS';
  metadata: {
    name: 'gigentic';
    version: '0.1.0';
    spec: '0.1.0';
    description: 'Created with Anchor';
  };
  instructions: [
    {
      name: 'agentToConsumerRating';
      discriminator: [76, 242, 9, 100, 82, 123, 175, 129];
      accounts: [
      name: 'customerToProviderRating';
      discriminator: [188, 220, 123, 11, 148, 57, 198, 128];
      accounts: [
        {
          name: 'signer';
          docs: [
            'The account of the user deploying and paying for the initialization.',
            'Marked as `mut` because it will be charged for rent.',
          ];
          writable: true;
          signer: true;
          name: 'signer';
          writable: true;
          signer: true;
        },
        {
          "name": "review",
          "writable": true
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
      name: 'consumerToAgentRating';
      discriminator: [20, 65, 222, 1, 186, 152, 255, 154];
      accounts: [
      name: 'initializeService';
      discriminator: [201, 217, 126, 168, 40, 110, 122, 89];
      accounts: [
        {
          name: 'signer';
          writable: true;
          signer: true;
          name: 'provider';
          writable: true;
          signer: true;
        },
        {
          name: 'review';
          writable: true;
          name: 'serviceRegistry';
          writable: true;
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
          name: 'provider';
          writable: true;
          signer: true;
          name: 'service';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [115, 101, 114, 118, 105, 99, 101];
              },
              {
                kind: 'arg';
                path: 'uniqueId';
              },
              {
                kind: 'account';
                path: 'provider';
              },
            ];
          };
        },
        {
          name: 'serviceRegistry';
          writable: true;
          name: 'mint';
        },
        {
          name: 'tokenProgram';
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
          name: 'serviceProviderTokenAccount';
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'uniqueId';
          type: 'string';
        },
        {
          name: 'description';
          type: 'string';
        },
        {
          name: 'price';
          type: 'u64';
        },
      ];
    },
    {
      name: 'initializeServiceRegistry';
      discriminator: [84, 8, 210, 235, 241, 25, 15, 155];
      accounts: [
        {
          name: 'initializer';
          docs: [
            'The account of the user deploying and paying for the initialization.',
            'Marked as `mut` because it will be charged for rent.',
          ];
          writable: true;
          signer: true;
        },
        {
          name: 'serviceRegistry';
          docs: [
            'The ServiceRegistry account to be initialized.',
            '`account(zero)` means this account should be created and initialized with zeroes.',
            'It ensures the account is new and prevents double initialization.',
          ];
          writable: true;
        },
        {
          "name": "serviceAuthority",
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
                  101,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121,
                ];
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'feeAccount';
          type: 'pubkey';
        },
        {
          name: 'feePercentage';
          type: 'u8';
        },
      ];
    },
    {
      name: 'payService';
      discriminator: [181, 29, 236, 80, 246, 226, 34, 174];
      accounts: [
        {
          name: 'customer';
          writable: true;
          signer: true;
        },
        {
          name: 'service';
          writable: true;
        },
        {
          name: 'serviceRegistry';
          writable: true;
        },
        {
          name: 'escrow';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [101, 115, 99, 114, 111, 119];
              },
              {
                "kind": "account",
                "path": "service"
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
          name: 'description';
          type: 'string';
                kind: 'account';
                path: 'service';
              },
              {
                kind: 'account';
                path: 'service.provider';
                account: 'service';
              },
              {
                kind: 'account';
                path: 'customer';
              },
            ];
          };
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
          name: 'serviceRegistry';
          docs: [
            'The ServiceRegistry account to be initialized.',
            '`account(zero)` means this account should be created and initialized with zeroes.',
            'It ensures the account is new and prevents double initialization.',
          ];
          writable: true;
          name: 'review';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [114, 101, 118, 105, 101, 119];
              },
              {
                kind: 'arg';
                path: 'reviewId';
              },
              {
                kind: 'account';
                path: 'service';
              },
            ];
          };
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
          "name": "feeTokenAccount",
          "type": "pubkey"
        },
        {
          name: 'feePercentage';
          type: 'u8';
        },
      ];
          name: 'reviewId';
          type: 'string';
        },
      ];
    },
    {
      name: 'payService';
      discriminator: [181, 29, 236, 80, 246, 226, 34, 174];
      accounts: [
      name: 'providerToCustomerRating';
      discriminator: [107, 198, 87, 138, 229, 212, 60, 70];
      accounts: [
        {
          name: 'buyer';
          writable: true;
          signer: true;
          name: 'signer';
          writable: true;
          signer: true;
        },
        {
          name: 'service';
          writable: true;
          name: 'review';
          writable: true;
        },
        {
          name: 'serviceRegistry';
          writable: true;
          name: 'serviceRegistry';
          docs: ['The service registry account.'];
          writable: true;
        },
        {
          name: 'escrow';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [101, 115, 99, 114, 111, 119];
          name: 'escrow';
          docs: [
            'The escrow account, initialized with a specific space and seeds.',
          ];
          writable: true;
          pda: {
            seeds: [
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
              },
              {
                "kind": "account",
                "path": "service.provider",
                "account": "service"
              },
              {
                "kind": "account",
                "path": "buyer"
              }
            ]
          }
        },
        {
          name: 'review';
          writable: true;
          pda: {
            seeds: [
          name: 'buyerTokenAccount';
          docs: [
            'The source token account from which tokens will be transferred.',
          ];
          writable: true;
        },
        {
          name: 'review';
          docs: ['The review account.'];
          writable: true;
          pda: {
            seeds: [
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
                "kind": "arg",
                "path": "reviewNo"
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
          "name": "reviewNo",
          "type": "string"
        }
      ]
    },
    {
      "name": "payServiceSpl",
      "discriminator": [
        170,
        1,
        4,
        226,
        23,
        248,
        125,
        227
      ],
      "accounts": [
        {
          "name": "buyer",
          "docs": [
            "The buyer who will sign the transaction."
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "service",
          "docs": [
            "The service account."
          ],
          "writable": true
        },
        {
          "name": "serviceRegistry",
          "docs": [
            "The service registry account."
          ],
          "writable": true
        },
        {
          "name": "escrow",
          "docs": [
            "The escrow account, initialized with a specific space and seeds."
          ],
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
              },
              {
                "kind": "account",
                "path": "service.provider",
                "account": "service"
              },
              {
                kind: 'account';
                path: 'buyer';
              },
            ];
          };
                kind: 'account';
                path: 'service';
              },
            ];
          };
        },
        {
          name: 'mint';
          docs: ['The mint account.'];
        },
        {
          "name": "buyerTokenAccount",
          "writable": true
        },
        {
          "name": "mint",
          "docs": [
            "The mint account."
          ]
        },
        {
          name: 'escrowTokenAccount';
          docs: [
            'The token account for the escrow, initialized with the mint and authority.',
          ];
          writable: true;
          pda: {
            seeds: [
          name: 'escrowTokenAccount';
          docs: ['Token account for escrow (only for SPL tokens)'];
          writable: true;
          pda: {
            seeds: [
              {
                "kind": "const",
                "value": [
                  101,
                  115,
                  99,
                  114,
                  111,
                  119,
                  45,
                  116,
                  111,
                  107,
                  101,
                  110,
                  45,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "escrow"
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
                "kind": "arg",
                "path": "reviewNo"
              },
              {
                "kind": "account",
                "path": "service"
              }
            ]
          }
        },
        {
          name: 'tokenProgram';
          docs: ['The token program.'];
          address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
                kind: 'account';
                path: 'escrow';
              },
            ];
          };
        },
        {
          name: 'tokenProgram';
          docs: ['The token program.'];
          address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
        },
        {
          name: 'rent';
          docs: ['The rent sysvar.'];
          address: 'SysvarRent111111111111111111111111111111111';
        },
        {
          "name": "systemProgram",
          "docs": [
            "The system program."
          ],
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "reviewNo",
          "type": "string"
        }
      ]
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
              },
              {
                "kind": "account",
                "path": "service.provider",
                "account": "service"
              },
              {
                "kind": "account",
                "path": "signer"
              }
            ]
          }
        },
        {
          name: 'serviceProvider';
          docs: ['CHECK : This is a account info, not an account'];
          writable: true;
          name: 'serviceProvider';
          docs: ['CHECK : This is an account info, not an account'];
          writable: true;
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
    },
    {
      "name": "signServiceSpl",
      "discriminator": [
        31,
        15,
        93,
        60,
        8,
        175,
        224,
        119
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "service"
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
              },
              {
                "kind": "account",
                "path": "service.provider",
                "account": "service"
              },
              {
                "kind": "account",
                "path": "signer"
              }
            ]
          }
        },
        {
          "name": "serviceProvider",
          "writable": true
        },
        {
          "name": "feeTokenAccount",
          "writable": true
        },
        {
          "name": "serviceProviderTokenAccount",
          "writable": true
        },
        {
          "name": "mint"
        },
        {
          "name": "escrowTokenAccount",
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
                  119,
                  45,
                  116,
                  111,
                  107,
                  101,
                  110,
                  45,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "escrow"
              }
            ]
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
      ];
      args: [];
    },
  ];
  accounts: [
    {
      name: 'escrow';
      discriminator: [31, 213, 123, 187, 186, 22, 218, 155];
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
      ];
      args: [];
    },
  ];
  accounts: [
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
      "name": "serviceAuthority",
      "discriminator": [
        199,
        242,
        58,
        222,
        53,
        161,
        60,
        220
      ]
    },
    {
      name: 'serviceRegistry';
      discriminator: [105, 133, 96, 79, 207, 176, 202, 71];
    },
  ];
  errors: [
      name: 'serviceRegistry';
      discriminator: [105, 133, 96, 79, 207, 176, 202, 71];
    },
  ];
  errors: [
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
    },
    {
      "code": 6010,
      "name": "noReviews",
      "msg": "No reviews found"
    }
  ],
  "types": [
    {
      "name": "escrow",
      "type": {
        "kind": "struct",
        "fields": [
          {
            name: 'buyer';
            type: 'pubkey';
            name: 'customer';
            type: 'pubkey';
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
          },
          {
            "name": "feeTokenAccount",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "serviceProviderTokenAccount",
            "type": {
              "option": "pubkey"
            }
          },
          {
            name: 'escrowTokenAccount';
            type: {
              option: 'pubkey';
            };
          },
        ];
      };
        ];
      };
    },
    {
      "name": "review",
      "type": {
        "kind": "struct",
        "fields": [
          {
            name: 'reviewNo';
            type: 'string';
            name: 'reviewId';
            type: 'string';
          },
          {
            name: 'agentToConsumerRating';
            type: 'u8';
            name: 'providerToCustomerRating';
            type: 'u8';
          },
          {
            name: 'consumerToAgentRating';
            type: 'u8';
            name: 'customerToProviderRating';
            type: 'u8';
          },
          {
            name: 'consumer';
            type: 'pubkey';
            name: 'customer';
            type: 'pubkey';
          },
          {
            "name": "serviceProvider",
            "type": "pubkey"
          },
          {
            name: 'agentToCustomerReview';
            type: 'string';
            name: 'providerToCustomerReview';
            type: 'string';
          },
          {
            name: 'customerToAgentReview';
            type: 'string';
          },
        ];
      };
            name: 'customerToProviderReview';
            type: 'string';
          },
        ];
      };
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
          },
          {
            name: 'serviceProviderTokenAccount';
            type: 'pubkey';
          },
        ];
      };
        ];
      };
    },
    {
      "name": "serviceAuthority",
      "type": {
        "kind": "struct",
        "fields": []
      }
    },
    {
      name: 'serviceRegistry';
      docs: [
        '`ServiceRegistry` is an account that maintains a list of public keys for all registered services.',
        'It acts as a central directory for tracking and accessing service accounts within the program.',
      ];
      type: {
        kind: 'struct';
        fields: [
      name: 'serviceRegistry';
      docs: [
        '`ServiceRegistry` is an account that maintains a list of public keys for all registered services.',
        'It acts as a central directory for tracking and accessing service accounts within the program.',
      ];
      type: {
        kind: 'struct';
        fields: [
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
          },
          {
            name: 'feeTokenAccount';
            type: 'pubkey';
          },
        ];
      };
    },
  ];
        ];
      };
    },
  ];
};
