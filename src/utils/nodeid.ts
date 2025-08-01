import { Logger } from "./logger.js";

/**
 * Result of nodeId validation and normalization
 */
export interface NodeIdValidationResult {
  isValid: boolean;
  normalizedId?: string;
  originalId: string;
  wasConverted: boolean;
  error?: string;
}

/**
 * Error information for nodeId format issues
 */
export interface NodeIdError {
  code: 'INVALID_NODEID_FORMAT';
  message: string;
  originalValue: string;
  expectedFormat: string;
}

/**
 * Regular expression patterns for nodeId validation
 */
const NODEID_PATTERNS = {
  // Valid colon format: alphanumeric:alphanumeric
  COLON_FORMAT: /^[a-zA-Z0-9]+:[a-zA-Z0-9]+$/,
  // Valid dash format: alphanumeric-alphanumeric  
  DASH_FORMAT: /^[a-zA-Z0-9]+-[a-zA-Z0-9]+$/,
  // Valid characters (alphanumeric, colon, dash)
  VALID_CHARS: /^[a-zA-Z0-9:-]+$/,
  // Has separator (colon or dash)
  HAS_SEPARATOR: /[:-]/,
  // Multiple dashes format: alphanumeric-alphanumeric-... (for normalization)
  MULTIPLE_DASHES: /^[a-zA-Z0-9]+-[a-zA-Z0-9-]+$/
};

/**
 * Validates if a nodeId string matches expected format patterns
 * @param nodeId - The nodeId string to validate
 * @returns True if the nodeId format is valid (colon or dash format)
 */
export function validateNodeIdFormat(nodeId: string): boolean {
  if (!nodeId || typeof nodeId !== 'string') {
    return false;
  }

  const trimmed = nodeId.trim();
  return NODEID_PATTERNS.COLON_FORMAT.test(trimmed) || NODEID_PATTERNS.DASH_FORMAT.test(trimmed);
}

/**
 * Normalizes a nodeId to colon format, converting from dash format if needed
 * @param nodeId - The nodeId string to normalize
 * @returns NodeIdValidationResult with validation status and normalized value
 */
export function normalizeNodeId(nodeId: string): NodeIdValidationResult {
  const originalId = nodeId;

  // Handle empty or null values
  if (!nodeId || typeof nodeId !== 'string') {
    const error = "NodeId cannot be empty or null";
    Logger.log(`NodeId validation failed: ${error}`);
    return {
      isValid: false,
      originalId: originalId || '',
      wasConverted: false,
      error
    };
  }

  // Trim whitespace
  const trimmed = nodeId.trim();
  
  // Check for empty after trimming
  if (!trimmed) {
    const error = "NodeId cannot be empty or null";
    Logger.log(`NodeId validation failed: ${error}`);
    return {
      isValid: false,
      originalId,
      wasConverted: false,
      error
    };
  }

  // Check for valid characters only
  if (!NODEID_PATTERNS.VALID_CHARS.test(trimmed)) {
    const error = `NodeId contains invalid characters. Expected format: '1234:5678' or '1234-5678', got: '${trimmed}'`;
    Logger.log(`NodeId validation failed: ${error}`);
    return {
      isValid: false,
      originalId,
      wasConverted: false,
      error
    };
  }

  // Check for separator presence
  if (!NODEID_PATTERNS.HAS_SEPARATOR.test(trimmed)) {
    const error = `NodeId missing separator. Expected format: '1234:5678' or '1234-5678', got: '${trimmed}'`;
    Logger.log(`NodeId validation failed: ${error}`);
    return {
      isValid: false,
      originalId,
      wasConverted: false,
      error
    };
  }

  // Handle mixed format (both dash and colon) - prioritize colon format
  if (trimmed.includes(':') && trimmed.includes('-')) {
    Logger.log(`NodeId contains both dash and colon separators, prioritizing colon format: '${trimmed}'`);
    
    // For mixed format, we accept it as-is since it already has a colon
    // This handles cases like "1234:5678-9012" where the colon part is valid
    const colonIndex = trimmed.indexOf(':');
    const beforeColon = trimmed.substring(0, colonIndex);
    const afterColon = trimmed.substring(colonIndex + 1);
    
    // Check if the parts around the colon are valid (alphanumeric)
    if (/^[a-zA-Z0-9]+$/.test(beforeColon) && /^[a-zA-Z0-9-]+$/.test(afterColon)) {
      return {
        isValid: true,
        normalizedId: trimmed,
        originalId,
        wasConverted: false
      };
    } else {
      const error = `NodeId has mixed format but is not valid. Expected format: '1234:5678' or '1234-5678', got: '${trimmed}'`;
      Logger.log(`NodeId validation failed: ${error}`);
      return {
        isValid: false,
        originalId,
        wasConverted: false,
        error
      };
    }
  }

  // Check if already in colon format
  if (NODEID_PATTERNS.COLON_FORMAT.test(trimmed)) {
    return {
      isValid: true,
      normalizedId: trimmed,
      originalId,
      wasConverted: false
    };
  }

  // Check if in dash format and convert
  if (NODEID_PATTERNS.DASH_FORMAT.test(trimmed)) {
    // Convert first dash to colon (handles multiple dashes by only converting the first)
    const normalized = trimmed.replace('-', ':');
    Logger.log(`NodeId converted from dash to colon format: '${trimmed}' -> '${normalized}'`);
    
    return {
      isValid: true,
      normalizedId: normalized,
      originalId,
      wasConverted: true
    };
  }

  // Check if it has multiple dashes (edge case handling)
  if (NODEID_PATTERNS.MULTIPLE_DASHES.test(trimmed)) {
    // Convert first dash to colon (handles multiple dashes by only converting the first)
    const normalized = trimmed.replace('-', ':');
    Logger.log(`NodeId converted from dash to colon format: '${trimmed}' -> '${normalized}'`);
    
    return {
      isValid: true,
      normalizedId: normalized,
      originalId,
      wasConverted: true
    };
  }

  // If we get here, the format is invalid
  const error = `NodeId format is invalid. Expected format: '1234:5678' or '1234-5678', got: '${trimmed}'`;
  Logger.log(`NodeId validation failed: ${error}`);
  return {
    isValid: false,
    originalId,
    wasConverted: false,
    error
  };
}

/**
 * Creates a standardized NodeIdError object for consistent error handling
 * @param originalValue - The original nodeId value that caused the error
 * @param message - The error message
 * @returns NodeIdError object
 */
export function createNodeIdError(originalValue: string, message: string): NodeIdError {
  return {
    code: 'INVALID_NODEID_FORMAT',
    message,
    originalValue,
    expectedFormat: 'Expected format: \'1234:5678\' or \'1234-5678\''
  };
}