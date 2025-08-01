# Requirements Document

## Introduction

This feature addresses the nodeId format compatibility issue in the Figma MCP server. Currently, the system expects nodeId in colon format (e.g., "2836:1478"), but Figma URLs sometimes contain nodeId in dash format (e.g., "2836-1478") which needs to be converted to colon format for proper API usage and link generation.

## Requirements

### Requirement 1

**User Story:** As a developer using the Figma MCP server, I want to provide nodeId in either colon or dash format, so that I don't have to manually convert formats when copying from different sources.

#### Acceptance Criteria

1. WHEN a user provides nodeId in dash format (e.g., "2836-1478") THEN the system SHALL automatically convert it to colon format (e.g., "2836:1478")
2. WHEN a user provides nodeId in colon format (e.g., "2836:1478") THEN the system SHALL use it as-is without modification
3. WHEN nodeId conversion occurs THEN the system SHALL log the conversion for debugging purposes

### Requirement 2

**User Story:** As a developer, I want the nodeId format conversion to work consistently across all MCP tools, so that I have a uniform experience regardless of which tool I'm using.

#### Acceptance Criteria

1. WHEN nodeId is provided to the get_figma_data tool THEN the system SHALL apply format normalization
2. WHEN nodeId is provided to the download_figma_images tool THEN the system SHALL apply format normalization to all node entries
3. WHEN nodeId is used internally in the Figma service THEN the system SHALL ensure it's in the correct colon format

### Requirement 3

**User Story:** As a developer, I want clear error messages when nodeId format is invalid, so that I can quickly identify and fix format issues.

#### Acceptance Criteria

1. WHEN nodeId contains invalid characters (not alphanumeric, colon, or dash) THEN the system SHALL return a clear error message
2. WHEN nodeId doesn't match expected patterns THEN the system SHALL provide guidance on correct format
3. WHEN nodeId conversion fails THEN the system SHALL log the original value and the reason for failure

### Requirement 4

**User Story:** As a developer, I want the system to handle edge cases in nodeId format gracefully, so that the system remains robust with various input formats.

#### Acceptance Criteria

1. WHEN nodeId is empty or null THEN the system SHALL handle it according to existing logic without crashing
2. WHEN nodeId contains multiple dashes or colons THEN the system SHALL only convert the first dash to colon
3. WHEN nodeId is already in mixed format (contains both dash and colon) THEN the system SHALL prioritize colon format and log a warning