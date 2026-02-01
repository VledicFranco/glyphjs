# Graph Example

```ui:graph
type: dag
nodes:
  - id: a
    label: Node A
  - id: b
    label: Node B
  - id: c
    label: Node C
edges:
  - from: a
    to: b
    label: connects
  - from: b
    to: c
layout: top-down
```
