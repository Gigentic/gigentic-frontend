graph TD
subgraph "Initial Access Layer"
WC[WalletConnection]
NS[NetworkSelector]
CC[ClusterChecker]
end

    subgraph "Service Discovery Layer"
        SD[ServiceDiscovery]
        AI[AISearchInterface]
        CA[ChatAgent]
        SV[ServiceViewer]
    end

    subgraph "Transaction Layer"
        EM[EscrowManagement]
        PM[PaymentManager]
        SC[ServiceCompletion]
    end

    subgraph "Review Layer"
        RV[ReviewManager]
        RT[RatingInterface]
        RP[ReviewPresenter]
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

    %% Network Query Relationships
    CC --> NQ1
    CC --> NQ2
    NS --> NQ3

    %% Service Query Relationships
    SD --> SQ1
    SV --> SQ2
    AI --> SQ3
    CA --> SQ2

    %% Transaction Query Relationships
    EM --> TQ1
    PM --> TQ2
    SC --> TQ3
    PM --> TQ3

    %% Review Query Relationships
    RV --> RQ1
    RP --> RQ2
    RT --> RQ1

    %% Cross-layer Dependencies
    WC --> SQ1
    WC --> TQ1
    SD --> TQ2
    EM --> SQ2
    PM --> SQ3

    %% Add styles
    classDef initial fill:#f9f,stroke:#333,stroke-width:2px;
    classDef discovery fill:#bbf,stroke:#333,stroke-width:2px;
    classDef transaction fill:#bfb,stroke:#333,stroke-width:2px;
    classDef review fill:#ffb,stroke:#333,stroke-width:2px;
    classDef queries fill:#ffb,stroke:#333,stroke-width:2px;

    class WC,NS,CC initial;
    class SD,AI,CA,SV discovery;
    class EM,PM,SC transaction;
    class RV,RT,RP review;
    class NQ1,NQ2,NQ3,SQ1,SQ2,SQ3,TQ1,TQ2,TQ3,RQ1,RQ2 queries;
