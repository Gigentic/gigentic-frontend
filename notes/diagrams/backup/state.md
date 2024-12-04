````mermaid
graph TD
    subgraph "Proposed Architecture"
        subgraph "Initial Access Components"
            WC[WalletConnection]
            NS[NetworkSelector]
            CC[ClusterChecker]
        end

        subgraph "Service Discovery Components"
            SD[ServiceDiscovery]
            AI[AISearchInterface]
            CA[ChatAgent]
            SV[ServiceViewer]
        end

        subgraph "Transaction Components"
            EM[EscrowManagement]
            PM[PaymentManager]
            SC[ServiceCompletion]
        end

        subgraph "Review Components"
            RV[ReviewManager]
            RT[RatingInterface]
            RP[ReviewPresenter]
        end

        subgraph "Custom Hooks"
            UW[useWallet]
            UC[useCluster]
            US[useServiceRegistry]
            UE[useEscrowAccounts]
            UR[useReviews]
        end

        subgraph "Cache Layer"
            RQ[React Query Cache]
        end

        subgraph "Blockchain Queries"
            subgraph "Network Queries"
                NQ1[getClusterNodes]
                NQ2[getVersion]
                NQ3[getHealth]
            end

            subgraph "Service Queries"
                SQ1[program.account.service.all]
                SQ2[program.account.service.fetch]
                SQ3[program.account.serviceRegistry.fetch]
            end

            subgraph "Transaction Queries"
                TQ1[program.account.escrow.all]
                TQ2[program.account.escrow.fetch]
                TQ3[getTransaction]
            end

            subgraph "Review Queries"
                RQ1[program.account.review.all]
                RQ2[program.account.review.fetch]
            end
        end

        %% Hook to Cache Relationships
        UW --> RQ
        UC --> RQ
        US --> RQ
        UE --> RQ
        UR --> RQ

        %% Cache to Components
        RQ --> WC
        RQ --> NS
        RQ --> CC
        RQ --> SD
        RQ --> AI
        RQ --> CA
        RQ --> SV
        RQ --> EM
        RQ --> PM
        RQ --> SC
        RQ --> RV
        RQ --> RT
        RQ --> RP

        %% Query Relationships
        UC --> NQ1
        UC --> NQ2
        UC --> NQ3
        US --> SQ1
        US --> SQ2
        US --> SQ3
        UE --> TQ1
        UE --> TQ2
        UE --> TQ3
        UR --> RQ1
        UR --> RQ2
    end

    %% Add styles
    classDef components fill:#f9f,stroke:#333,stroke-width:2px;
    classDef hooks fill:#bbf,stroke:#333,stroke-width:2px;
    classDef cache fill:#bfb,stroke:#333,stroke-width:2px;
    classDef queries fill:#ffb,stroke:#333,stroke-width:2px;

    class WC,NS,CC,SD,AI,CA,SV,EM,PM,SC,RV,RT,RP components;
    class UW,UC,US,UE,UR hooks;
    class RQ cache;
    class NQ1,NQ2,NQ3,SQ1,SQ2,SQ3,TQ1,TQ2,TQ3,RQ1,RQ2 queries;```
````
