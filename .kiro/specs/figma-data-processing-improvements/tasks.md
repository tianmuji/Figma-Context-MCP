# Implementation Plan

- [x] 1. Enhance style transformer to process strokeAlign property
  - Modify `buildSimplifiedStrokes` function in `src/transformers/style.ts` to extract and include `strokeAlign` property from Figma nodes
  - Update `SimplifiedStroke` type definition to include optional `strokeAlign` field
  - Add validation to ensure only valid strokeAlign values ("INSIDE", "OUTSIDE", "CENTER") are processed
  - Write unit tests to verify strokeAlign processing with various input values and missing property scenarios
  - _Requirements: 1.1, 1.3, 1.4_

- [x] 2. Enhance layout transformer to process clipsContent property
  - Modify `buildSimplifiedLayout` function in `src/transformers/layout.ts` to extract and include `clipsContent` property from Figma frame nodes
  - Update `SimplifiedLayout` interface to include optional `clipsContent` boolean field
  - Add logic to only include clipsContent when it's explicitly set to true (avoiding default false values)
  - Write unit tests to verify clipsContent processing and integration with existing layout processing
  - _Requirements: 1.2, 1.3, 1.4_

- [x] 3. Add comprehensive logging to image download node processing
  - Enhance `getImages` method in `src/services/figma.ts` to log the total number of nodes being processed
  - Add logging for PNG and SVG node filtering with counts and node IDs
  - Log the parameters being sent to Figma API for both PNG and SVG requests
  - Add logging for API response status and any empty or missing image URLs
  - _Requirements: 2.1, 2.2, 2.5_

- [x] 4. Add detailed logging to image fill processing
  - Enhance `getImageFills` method in `src/services/figma.ts` to log the number of image fill nodes being processed
  - Add logging for each imageRef validation and any missing or invalid imageRef properties
  - Log the Figma API endpoint being called and response status for image fills
  - Add specific error logging for nodes with missing imageRef or invalid image URLs
  - _Requirements: 2.1, 2.4, 2.5_

- [x] 5. Enhance image download tool debugging output
  - Modify the `download_figma_images` tool in `src/mcp.ts` to provide detailed debugging information when 0 images are downloaded
  - Add logging to show the breakdown of nodes being processed (image fills vs render requests)
  - Include information about filtering decisions and why specific nodes were included or excluded
  - Enhance error messages to include specific failure reasons for each problematic node
  - _Requirements: 2.3, 2.6_

- [x] 6. Add structured debug information collection
  - Create helper functions to collect and format debug information throughout the image download process
  - Implement consistent logging format with relevant context (fileKey, nodeId, fileName) for all image download operations
  - Add debug information aggregation to provide summary of what was attempted vs what succeeded
  - Ensure debug information is properly returned in tool responses for user visibility
  - _Requirements: 2.3, 2.6_

- [x] 7. Write comprehensive tests for enhanced data processing
  - Create unit tests for strokeAlign property processing in style transformer
  - Create unit tests for clipsContent property processing in layout transformer
  - Write integration tests to verify new properties appear correctly in the final simplified response
  - Add tests to ensure backward compatibility with existing functionality
  - _Requirements: 1.1, 1.2, 1.4_

- [x] 8. Write tests for enhanced image download debugging
  - Create unit tests for enhanced logging in getImages and getImageFills methods
  - Mock various failure scenarios to test debug information collection
  - Write integration tests for the image download tool with enhanced debugging
  - Test scenarios with empty node lists, invalid imageRef values, and API failures
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_