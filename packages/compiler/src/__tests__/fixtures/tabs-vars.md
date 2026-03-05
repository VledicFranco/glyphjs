---
vars:
  greeting: Hello
  product: GlyphJS
---

# Tabs with Variables

````ui:tabs
tabs:
  - label: "{{greeting}} Tab"
    content: |
      Welcome to {{product}}.

      ```ui:callout
      type: info
      content: "Built with {{product}}."
      ```
  - label: Plain
    content: |
      No variables here.
````
