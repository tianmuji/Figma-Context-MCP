---
"figma-context-mcp": minor
---

Add nodeId format compatibility utility

- Add normalizeNodeId utility to handle dash/colon format conversion
- Support automatic conversion from dash format (2836-1478) to colon format (2836:1478)  
- Add comprehensive error handling and validation
- Include extensive unit tests with 37 test cases
- Handle edge cases like multiple separators and mixed formats
- Add logging for all conversions and validation failures