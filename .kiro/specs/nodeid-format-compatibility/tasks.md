# Implementation Plan

- [x] 1. Create NodeId normalization utility module
  - Create `src/utils/nodeid.ts` with core normalization functions
  - Implement `normalizeNodeId` function with validation and conversion logic
  - Implement `validateNodeIdFormat` helper function for format checking
  - Add comprehensive error handling with clear error messages
  - Include logging for all conversions and validation failures
  - _Requirements: 1.1, 1.2, 1.3, 3.1, 3.2, 3.3, 4.1, 4.2, 4.3_

- [x] 2. Write comprehensive unit tests for NodeId utilities
  - Create `src/tests/nodeid-utils.test.ts` with full test coverage
  - Write tests for dash-to-colon conversion functionality
  - Write tests for colon format passthrough behavior
  - Write tests for invalid format detection and error handling
  - Write tests for edge cases (multiple separators, empty values, whitespace)
  - Write tests for logging behavior during conversions
  - _Requirements: 1.1, 1.2, 1.3, 3.1, 3.2, 3.3, 4.1, 4.2, 4.3_

- [ ] 3. Integrate NodeId normalization into get_figma_data MCP tool
  - Modify `src/mcp.ts` to import and use NodeId normalization utility
  - Add nodeId normalization call before processing in get_figma_data tool
  - Update error handling to return clear nodeId format errors to users
  - Add logging for nodeId conversions in the MCP tool context
  - _Requirements: 2.1, 1.1, 1.2, 1.3, 3.1, 3.2_

- [ ] 4. Integrate NodeId normalization into download_figma_images MCP tool
  - Modify `src/mcp.ts` to apply normalization to all nodeId entries in download_figma_images
  - Update the nodes array processing to normalize each nodeId before processing
  - Ensure error handling covers nodeId format issues for batch operations
  - Add logging for nodeId conversions in batch download context
  - _Requirements: 2.2, 1.1, 1.2, 1.3, 3.1, 3.2_

- [ ] 5. Update Figma service to ensure internal nodeId consistency
  - Modify `src/services/figma.ts` to use normalized nodeIds in all internal operations
  - Update `getNode` method to validate nodeId format before API calls
  - Ensure all nodeId logging uses normalized format for consistency
  - Add validation at service entry points to catch format issues early
  - _Requirements: 2.3, 1.1, 1.2, 1.3, 3.1_

- [ ] 6. Write integration tests for MCP tool nodeId handling
  - Create integration tests in existing test files for both MCP tools
  - Test get_figma_data tool with both dash and colon format nodeIds
  - Test download_figma_images tool with mixed format nodeId arrays
  - Verify error responses for invalid nodeId formats in both tools
  - Test logging output for nodeId conversions in integration scenarios
  - _Requirements: 2.1, 2.2, 1.1, 1.2, 3.1, 3.2_

- [ ] 7. Add end-to-end validation and error handling tests
  - Write tests that verify complete flow from MCP input to Figma API calls
  - Test error propagation from nodeId validation through to user responses
  - Verify that normalized nodeIds work correctly with actual Figma API endpoints
  - Test edge cases in real-world scenarios (empty arrays, mixed formats)
  - Ensure logging captures all conversion events in end-to-end flows
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 4.1, 4.2, 4.3_