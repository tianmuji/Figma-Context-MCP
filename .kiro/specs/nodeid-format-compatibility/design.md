# Design Document

## Overview

This design implements nodeId format compatibility for the Figma MCP server by creating a centralized normalization utility that converts dash-formatted nodeIds to colon format. The solution ensures consistent nodeId handling across all MCP tools while maintaining backward compatibility and providing clear error handling.

## Architecture

The solution follows a utility-first approach with centralized normalization logic:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   MCP Tools     │───▶│  NodeId Utils    │───▶│  Figma Service  │
│ (get_figma_data,│    │ (normalization)  │    │   (API calls)   │
│download_images) │    └──────────────────┘    └─────────────────┘
└─────────────────┘
```

### Key Design Principles

1. **Single Responsibility**: One utility function handles all nodeId normalization
2. **Fail-Fast**: Invalid formats are caught early with clear error messages
3. **Logging**: All conversions are logged for debugging and monitoring
4. **Non-Breaking**: Existing colon format continues to work unchanged

## Components and Interfaces

### NodeId Normalization Utility

**Location**: `src/utils/nodeid.ts`

```typescript
export interface NodeIdValidationResult {
  isValid: boolean;
  normalizedId?: string;
  originalId: string;
  wasConverted: boolean;
  error?: string;
}

export function normalizeNodeId(nodeId: string): NodeIdValidationResult;
export function validateNodeIdFormat(nodeId: string): boolean;
```

### MCP Tool Integration Points

**Modified Files**:
- `src/mcp.ts` - Update both MCP tools to use normalization
- `src/services/figma.ts` - Ensure internal usage is normalized

### Validation Rules

1. **Valid Formats**:
   - Colon format: `1234:5678` (unchanged)
   - Dash format: `1234-5678` (converted to `1234:5678`)

2. **Invalid Formats**:
   - Empty or null values
   - Non-alphanumeric characters (except colon/dash)
   - Multiple separators
   - Missing separator

## Data Models

### NodeId Validation Result

```typescript
interface NodeIdValidationResult {
  isValid: boolean;           // Whether the nodeId is valid
  normalizedId?: string;      // The normalized nodeId (colon format)
  originalId: string;         // The original input nodeId
  wasConverted: boolean;      // Whether conversion occurred
  error?: string;            // Error message if invalid
}
```

### Error Response Format

```typescript
interface NodeIdError {
  code: 'INVALID_NODEID_FORMAT';
  message: string;
  originalValue: string;
  expectedFormat: string;
}
```

## Error Handling

### Error Categories

1. **Format Errors**: Invalid characters or patterns
2. **Conversion Errors**: Unexpected issues during normalization
3. **Validation Errors**: Missing or malformed nodeId values

### Error Messages

- Invalid characters: `"NodeId contains invalid characters. Expected format: '1234:5678' or '1234-5678', got: '{originalValue}'"`
- Missing separator: `"NodeId missing separator. Expected format: '1234:5678' or '1234-5678', got: '{originalValue}'"`
- Empty value: `"NodeId cannot be empty or null"`

### Error Handling Strategy

1. **Early Validation**: Validate at MCP tool entry points
2. **Graceful Degradation**: Log errors but don't crash the system
3. **Clear Messaging**: Provide actionable error messages to users
4. **Fallback Behavior**: For optional nodeId parameters, handle gracefully

## Testing Strategy

### Unit Tests

**File**: `src/tests/nodeid-utils.test.ts`

Test categories:
1. **Format Conversion Tests**
   - Dash to colon conversion
   - Colon format passthrough
   - Edge cases (multiple separators, mixed formats)

2. **Validation Tests**
   - Valid format detection
   - Invalid format rejection
   - Error message accuracy

3. **Integration Tests**
   - MCP tool integration
   - Figma service integration
   - End-to-end format handling

### Test Cases

```typescript
describe('NodeId Normalization', () => {
  // Conversion tests
  test('converts dash format to colon format')
  test('preserves colon format unchanged')
  test('handles mixed format with warning')
  
  // Validation tests
  test('validates correct formats')
  test('rejects invalid characters')
  test('rejects empty values')
  
  // Edge cases
  test('handles multiple dashes correctly')
  test('handles multiple colons correctly')
  test('handles whitespace trimming')
});
```

### Integration Testing

1. **MCP Tool Testing**: Verify both tools accept both formats
2. **Figma API Testing**: Ensure normalized nodeIds work with Figma API
3. **Logging Testing**: Verify conversion logging works correctly

## Implementation Details

### Normalization Algorithm

```typescript
function normalizeNodeId(nodeId: string): NodeIdValidationResult {
  // 1. Trim whitespace
  // 2. Check for empty/null
  // 3. Validate character set
  // 4. Check for separator presence
  // 5. Convert first dash to colon
  // 6. Log conversion if occurred
  // 7. Return result
}
```

### Integration Points

1. **MCP Tools**: Call normalization before processing
2. **Figma Service**: Ensure all internal nodeId usage is normalized
3. **Debug Logging**: Include original and normalized values in logs
4. **Error Responses**: Use consistent error format across tools

### Performance Considerations

- Normalization is O(1) operation with minimal overhead
- Regex patterns are compiled once and reused
- Logging is conditional to avoid performance impact in production

### Backward Compatibility

- Existing colon format nodeIds continue to work unchanged
- No breaking changes to existing API contracts
- Optional parameters remain optional with same behavior