---
"figma-context-mcp": patch
---

Enhanced Figma data processing and image download debugging

- **New Properties Support**: Added support for `strokeAlign` and `clipsContent` properties from Figma nodes
  - `strokeAlign` property is now extracted and included in stroke styles (supports "INSIDE", "OUTSIDE", "CENTER")
  - `clipsContent` property is now extracted and included in layout styles for frame nodes
- **Enhanced Image Download Debugging**: Significantly improved debugging information for image download operations
  - Added comprehensive logging throughout the image download pipeline
  - Structured debug information collection with detailed failure reasons
  - Enhanced error messages when downloads return "Success, 0 images downloaded"
  - Detailed breakdown of node processing (PNG/SVG/image fills)
- **Improved Developer Experience**: Better error diagnostics and transparent processing information
- **Backward Compatibility**: All existing functionality remains unchanged
