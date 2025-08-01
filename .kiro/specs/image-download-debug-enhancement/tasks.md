# Implementation Plan

- [x] 1. Enhance ImageDownloadDebugInfo interface and types
  - Add downloadUrls field to ImageDownloadDebugInfo interface
  - Create DownloadUrlInfo type definition
  - Add URL-related type definitions for format and status enums
  - _Requirements: 1.1, 2.2_

- [x] 2. Implement URL tracking methods in ImageDownloadDebugCollector
  - Add addDownloadUrl method to store URL information
  - Add getDownloadUrls method to retrieve stored URLs
  - Implement URL storage logic with proper data validation
  - _Requirements: 1.1, 1.2, 2.1_

- [x] 3. Create URL truncation utility function
  - Implement truncateUrl function with configurable options
  - Add logic to handle various URL formats and edge cases
  - Create tests for URL truncation functionality
  - _Requirements: 2.3_

- [x] 4. Integrate URL capture in FigmaService.getImages method
  - Add URL capture logic when processing API responses
  - Store URLs with appropriate status (success/failed/attempted)
  - Handle cases where URLs are missing from API response
  - _Requirements: 1.1, 1.3, 2.1_

- [x] 5. Integrate URL capture in FigmaService.getImageFills method
  - Add URL capture for image fill processing
  - Store image fill URLs with proper format identification
  - Handle invalid imageRef scenarios with URL tracking
  - _Requirements: 1.1, 1.4, 2.1_

- [x] 6. Update downloadFigmaImage function to report URL status
  - Modify function to accept debug collector parameter
  - Update URL status based on download success/failure
  - Maintain backward compatibility for existing callers
  - _Requirements: 1.2, 1.3, 3.3_

- [x] 7. Enhance formatDebugInfoForUser function with URL display
  - Add "Download URLs" section to debug output
  - Implement URL grouping by format type (PNG, SVG, IMAGE_FILL)
  - Apply URL truncation for better readability
  - Handle cases where no URLs are available
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 8. Update generateDebugSummary method with URL information
  - Add URL section to detailed debug summary
  - Include URL statistics in summary output
  - Maintain existing summary structure and format
  - _Requirements: 2.1, 3.1, 3.2_

- [ ] 9. Write comprehensive unit tests for URL tracking functionality
  - Test addDownloadUrl method with various scenarios
  - Test URL retrieval and formatting methods
  - Test URL truncation utility with edge cases
  - Test backward compatibility of existing debug methods
  - _Requirements: 1.1, 1.2, 2.2, 3.3_

- [ ] 10. Write integration tests for end-to-end URL tracking
  - Test URL capture during actual download process
  - Test URL display in final debug output with mixed scenarios
  - Test integration with existing MCP tool workflow
  - Verify backward compatibility with existing tools
  - _Requirements: 1.1, 1.2, 1.3, 3.1, 3.2, 3.4_