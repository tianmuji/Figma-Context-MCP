# Design Document

## Overview

This design addresses two key improvements to the Figma MCP server:

1. **Enhanced Data Processing**: Add support for `strokeAlign` and `clipsContent` properties in the Figma data transformation pipeline
2. **Improved Image Download Debugging**: Add comprehensive logging and debugging information for image download operations to help diagnose "Success, 0 images downloaded" scenarios

The solution involves modifications to the data transformation layer and the image download service with enhanced logging capabilities.

## Architecture

### Current Architecture
- **FigmaService**: Handles API communication with Figma
- **Transformers**: Process raw Figma data into simplified structures
  - `style.ts`: Handles stroke and fill processing
  - `layout.ts`: Handles layout and positioning
  - `effects.ts`: Handles visual effects
- **simplify-node-response.ts**: Orchestrates the transformation pipeline
- **MCP Server**: Exposes tools including image download functionality

### Proposed Changes
- **Style Transformer Enhancement**: Extend stroke processing to include `strokeAlign`
- **Layout Transformer Enhancement**: Add `clipsContent` processing
- **Image Download Service Enhancement**: Add comprehensive logging throughout the download pipeline
- **Logger Enhancement**: Add structured logging for debugging image download issues

## Components and Interfaces

### 1. Enhanced Style Processing

**Location**: `src/transformers/style.ts`

**Current Interface**:
```typescript
export type SimplifiedStroke = {
  colors: SimplifiedFill[];
  strokeWeight?: string;
  strokeDashes?: number[];
  strokeWeights?: string;
};
```

**Enhanced Interface**:
```typescript
export type SimplifiedStroke = {
  colors: SimplifiedFill[];
  strokeWeight?: string;
  strokeDashes?: number[];
  strokeWeights?: string;
  strokeAlign?: "INSIDE" | "OUTSIDE" | "CENTER"; // New property
};
```

### 2. Enhanced Layout Processing

**Location**: `src/transformers/layout.ts`

**Current Interface**: `SimplifiedLayout`

**Enhanced Interface**:
```typescript
export interface SimplifiedLayout {
  // ... existing properties
  clipsContent?: boolean; // New property
}
```

### 3. Enhanced Image Download Debugging

**Location**: `src/services/figma.ts`

**Enhanced Methods**:
- `getImages()`: Add detailed logging for node processing, filtering, and API responses
- `getImageFills()`: Add logging for image fill processing and URL validation

**New Debug Information Structure**:
```typescript
interface ImageDownloadDebugInfo {
  totalNodesRequested: number;
  pngNodesCount: number;
  svgNodesCount: number;
  imageFillsCount: number;
  apiResponseStatus: string;
  failedDownloads: Array<{
    nodeId: string;
    fileName: string;
    reason: string;
  }>;
}
```

## Data Models

### Enhanced Figma Node Processing

The system will process additional properties from the raw Figma API response:

1. **strokeAlign**: Available on nodes with stroke properties
   - Values: "INSIDE", "OUTSIDE", "CENTER"
   - Default handling: Only include if present and not default value

2. **clipsContent**: Available on frame-like nodes
   - Values: boolean
   - Default handling: Only include if true (since false is typical default)

### Image Download Debug Data

Enhanced logging will capture:
- Node filtering decisions
- API request/response details
- Individual download success/failure reasons
- Missing or invalid imageRef properties
- Empty URL responses from Figma API

## Error Handling

### Data Processing Errors
- **Missing Properties**: Gracefully handle missing `strokeAlign` or `clipsContent` properties
- **Invalid Values**: Validate property values and log warnings for unexpected values
- **Backward Compatibility**: Ensure existing functionality remains unchanged

### Image Download Errors
- **Enhanced Error Messages**: Provide specific reasons for download failures
- **Structured Logging**: Use consistent log format for easier debugging
- **Graceful Degradation**: Continue processing other images when individual downloads fail
- **API Error Handling**: Capture and log Figma API error responses

## Testing Strategy

### Unit Tests
1. **Style Transformer Tests**
   - Test `strokeAlign` property processing with various values
   - Test backward compatibility with existing stroke processing
   - Test handling of missing `strokeAlign` property

2. **Layout Transformer Tests**
   - Test `clipsContent` property processing
   - Test integration with existing layout processing
   - Test handling of missing `clipsContent` property

3. **Image Download Tests**
   - Mock Figma API responses to test various failure scenarios
   - Test logging output for different error conditions
   - Test handling of empty node lists and invalid imageRef values

### Integration Tests
1. **End-to-End Data Processing**
   - Test complete pipeline with real Figma data containing new properties
   - Verify output format and structure

2. **Image Download Debugging**
   - Test image download tool with various node configurations
   - Verify debug information is properly logged and returned

### Manual Testing
1. **Real Figma Files**: Test with actual Figma files containing `strokeAlign` and `clipsContent` properties
2. **Debug Scenarios**: Manually trigger various image download failure scenarios to verify logging

## Implementation Notes

### Property Processing Priority
- Process `strokeAlign` in the style transformer alongside existing stroke properties
- Process `clipsContent` in the layout transformer as it relates to overflow behavior
- Maintain existing property processing order to ensure compatibility

### Logging Strategy
- Use existing Logger utility for consistency
- Add structured log entries with consistent format
- Include relevant context (fileKey, nodeId, etc.) in all log messages
- Use appropriate log levels (debug, info, warn, error)

### Performance Considerations
- Additional property processing should have minimal performance impact
- Enhanced logging should be efficient and not significantly slow down operations
- Consider log level configuration to control verbosity in production