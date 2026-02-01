# References Example

```ui:graph
glyph-id: network-graph
type: dag
nodes:
  - id: x
    label: X
edges: []
refs:
  - target: data-table
    type: depends-on
```

```ui:callout
glyph-id: data-table
type: tip
content: This is the data table callout.
refs:
  - target: network-graph
    type: navigates-to
    label: Back to graph
```
