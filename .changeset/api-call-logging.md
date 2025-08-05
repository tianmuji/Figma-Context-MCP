---
"figma-context-mcp": patch
---

Add API call path logging for get_figma_data function

- **Enhanced Logging**: Added detailed API call path logging for get_figma_data function
  - Logs show complete API URLs being called (e.g., https://api.figma.com/v1/files/{fileKey})
  - Added logging for both getFile() and getNode() method calls
  - Improved debugging visibility for Figma API interactions
- **Developer Experience**: Better transparency into which Figma API endpoints are being accessed
- **Backward Compatibility**: All existing functionality remains unchanged 