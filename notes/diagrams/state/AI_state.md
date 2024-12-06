```mermaid
stateDiagram-v2
state "AI Agent States" as AIState {
    state "Chat Processing" as ChatState {
        Idle --> Processing : User Input
        Processing --> Responding : Generate Response
Responding --> Idle : Display Response
}
}
```
