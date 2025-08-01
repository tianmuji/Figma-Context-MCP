import { normalizeNodeId, validateNodeIdFormat, createNodeIdError } from "../utils/nodeid.js";
import type { NodeIdValidationResult, NodeIdError } from "../utils/nodeid.js";

// Mock the Logger to capture log calls
jest.mock("../utils/logger.js", () => ({
  Logger: {
    log: jest.fn(),
  },
}));

import { Logger } from "../utils/logger.js";

describe("NodeId Normalization", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe("validateNodeIdFormat", () => {
    describe("valid formats", () => {
      it("should validate colon format", () => {
        expect(validateNodeIdFormat("1234:5678")).toBe(true);
        expect(validateNodeIdFormat("abc123:def456")).toBe(true);
        expect(validateNodeIdFormat("A1B2:C3D4")).toBe(true);
      });

      it("should validate dash format", () => {
        expect(validateNodeIdFormat("1234-5678")).toBe(true);
        expect(validateNodeIdFormat("abc123-def456")).toBe(true);
        expect(validateNodeIdFormat("A1B2-C3D4")).toBe(true);
      });

      it("should handle whitespace by trimming", () => {
        expect(validateNodeIdFormat("  1234:5678  ")).toBe(true);
        expect(validateNodeIdFormat("\t1234-5678\n")).toBe(true);
      });
    });

    describe("invalid formats", () => {
      it("should reject empty or null values", () => {
        expect(validateNodeIdFormat("")).toBe(false);
        expect(validateNodeIdFormat("   ")).toBe(false);
        expect(validateNodeIdFormat(null as any)).toBe(false);
        expect(validateNodeIdFormat(undefined as any)).toBe(false);
      });

      it("should reject non-string values", () => {
        expect(validateNodeIdFormat(123 as any)).toBe(false);
        expect(validateNodeIdFormat({} as any)).toBe(false);
        expect(validateNodeIdFormat([] as any)).toBe(false);
      });

      it("should reject invalid characters", () => {
        expect(validateNodeIdFormat("1234@5678")).toBe(false);
        expect(validateNodeIdFormat("1234#5678")).toBe(false);
        expect(validateNodeIdFormat("1234$5678")).toBe(false);
        expect(validateNodeIdFormat("1234%5678")).toBe(false);
      });

      it("should reject missing separators", () => {
        expect(validateNodeIdFormat("12345678")).toBe(false);
        expect(validateNodeIdFormat("abcdefgh")).toBe(false);
      });

      it("should reject multiple separators of same type", () => {
        expect(validateNodeIdFormat("1234:5678:9012")).toBe(false);
        expect(validateNodeIdFormat("1234-5678-9012")).toBe(false);
      });

      it("should reject mixed separators", () => {
        expect(validateNodeIdFormat("1234:5678-9012")).toBe(false);
        expect(validateNodeIdFormat("1234-5678:9012")).toBe(false);
      });
    });
  });

  describe("normalizeNodeId", () => {
    describe("successful conversions", () => {
      it("should convert dash format to colon format", () => {
        const result = normalizeNodeId("1234-5678");
        
        expect(result.isValid).toBe(true);
        expect(result.normalizedId).toBe("1234:5678");
        expect(result.originalId).toBe("1234-5678");
        expect(result.wasConverted).toBe(true);
        expect(result.error).toBeUndefined();
        expect(Logger.log).toHaveBeenCalledWith(
          "NodeId converted from dash to colon format: '1234-5678' -> '1234:5678'"
        );
      });

      it("should preserve colon format unchanged", () => {
        const result = normalizeNodeId("1234:5678");
        
        expect(result.isValid).toBe(true);
        expect(result.normalizedId).toBe("1234:5678");
        expect(result.originalId).toBe("1234:5678");
        expect(result.wasConverted).toBe(false);
        expect(result.error).toBeUndefined();
        expect(Logger.log).not.toHaveBeenCalled();
      });

      it("should handle alphanumeric nodeIds", () => {
        const result = normalizeNodeId("abc123-def456");
        
        expect(result.isValid).toBe(true);
        expect(result.normalizedId).toBe("abc123:def456");
        expect(result.wasConverted).toBe(true);
      });

      it("should trim whitespace before processing", () => {
        const result = normalizeNodeId("  1234-5678  ");
        
        expect(result.isValid).toBe(true);
        expect(result.normalizedId).toBe("1234:5678");
        expect(result.originalId).toBe("  1234-5678  ");
        expect(result.wasConverted).toBe(true);
      });
    });

    describe("edge cases", () => {
      it("should handle multiple dashes by converting only the first", () => {
        const result = normalizeNodeId("1234-5678-9012");
        
        expect(result.isValid).toBe(true);
        expect(result.normalizedId).toBe("1234:5678-9012");
        expect(result.wasConverted).toBe(true);
        expect(Logger.log).toHaveBeenCalledWith(
          "NodeId converted from dash to colon format: '1234-5678-9012' -> '1234:5678-9012'"
        );
      });

      it("should handle mixed format by prioritizing colon format", () => {
        const result = normalizeNodeId("1234:5678-9012");
        
        expect(result.isValid).toBe(true);
        expect(result.normalizedId).toBe("1234:5678-9012");
        expect(result.wasConverted).toBe(false);
        expect(Logger.log).toHaveBeenCalledWith(
          "NodeId contains both dash and colon separators, prioritizing colon format: '1234:5678-9012'"
        );
      });

      it("should handle valid mixed format with colon priority", () => {
        // This would be a case where the colon format part is valid
        const result = normalizeNodeId("1234:5678");
        
        expect(result.isValid).toBe(true);
        expect(result.normalizedId).toBe("1234:5678");
        expect(result.wasConverted).toBe(false);
      });
    });

    describe("error handling", () => {
      it("should handle empty nodeId", () => {
        const result = normalizeNodeId("");
        
        expect(result.isValid).toBe(false);
        expect(result.originalId).toBe("");
        expect(result.wasConverted).toBe(false);
        expect(result.error).toBe("NodeId cannot be empty or null");
        expect(Logger.log).toHaveBeenCalledWith("NodeId validation failed: NodeId cannot be empty or null");
      });

      it("should handle null nodeId", () => {
        const result = normalizeNodeId(null as any);
        
        expect(result.isValid).toBe(false);
        expect(result.originalId).toBe("");
        expect(result.wasConverted).toBe(false);
        expect(result.error).toBe("NodeId cannot be empty or null");
      });

      it("should handle undefined nodeId", () => {
        const result = normalizeNodeId(undefined as any);
        
        expect(result.isValid).toBe(false);
        expect(result.originalId).toBe("");
        expect(result.wasConverted).toBe(false);
        expect(result.error).toBe("NodeId cannot be empty or null");
      });

      it("should handle non-string nodeId", () => {
        const result = normalizeNodeId(123 as any);
        
        expect(result.isValid).toBe(false);
        expect(result.originalId).toBe(123);
        expect(result.wasConverted).toBe(false);
        expect(result.error).toBe("NodeId cannot be empty or null");
      });

      it("should handle whitespace-only nodeId", () => {
        const result = normalizeNodeId("   ");
        
        expect(result.isValid).toBe(false);
        expect(result.originalId).toBe("   ");
        expect(result.wasConverted).toBe(false);
        expect(result.error).toBe("NodeId cannot be empty or null");
      });

      it("should handle invalid characters", () => {
        const result = normalizeNodeId("1234@5678");
        
        expect(result.isValid).toBe(false);
        expect(result.originalId).toBe("1234@5678");
        expect(result.wasConverted).toBe(false);
        expect(result.error).toBe("NodeId contains invalid characters. Expected format: '1234:5678' or '1234-5678', got: '1234@5678'");
        expect(Logger.log).toHaveBeenCalledWith("NodeId validation failed: NodeId contains invalid characters. Expected format: '1234:5678' or '1234-5678', got: '1234@5678'");
      });

      it("should handle missing separator", () => {
        const result = normalizeNodeId("12345678");
        
        expect(result.isValid).toBe(false);
        expect(result.originalId).toBe("12345678");
        expect(result.wasConverted).toBe(false);
        expect(result.error).toBe("NodeId missing separator. Expected format: '1234:5678' or '1234-5678', got: '12345678'");
        expect(Logger.log).toHaveBeenCalledWith("NodeId validation failed: NodeId missing separator. Expected format: '1234:5678' or '1234-5678', got: '12345678'");
      });

      it("should handle invalid format after all checks", () => {
        // This tests the final fallback error case
        const result = normalizeNodeId("1234:5678:9012");
        
        expect(result.isValid).toBe(false);
        expect(result.originalId).toBe("1234:5678:9012");
        expect(result.wasConverted).toBe(false);
        expect(result.error).toBe("NodeId format is invalid. Expected format: '1234:5678' or '1234-5678', got: '1234:5678:9012'");
      });
    });

    describe("logging behavior", () => {
      it("should log conversions", () => {
        normalizeNodeId("1234-5678");
        
        expect(Logger.log).toHaveBeenCalledWith(
          "NodeId converted from dash to colon format: '1234-5678' -> '1234:5678'"
        );
      });

      it("should log validation failures", () => {
        normalizeNodeId("invalid@nodeId");
        
        expect(Logger.log).toHaveBeenCalledWith(
          "NodeId validation failed: NodeId contains invalid characters. Expected format: '1234:5678' or '1234-5678', got: 'invalid@nodeId'"
        );
      });

      it("should log mixed format warnings", () => {
        normalizeNodeId("1234:5678-9012");
        
        expect(Logger.log).toHaveBeenCalledWith(
          "NodeId contains both dash and colon separators, prioritizing colon format: '1234:5678-9012'"
        );
      });

      it("should not log for valid colon format", () => {
        normalizeNodeId("1234:5678");
        
        expect(Logger.log).not.toHaveBeenCalled();
      });
    });
  });

  describe("createNodeIdError", () => {
    it("should create standardized error object", () => {
      const error = createNodeIdError("invalid-value", "Test error message");
      
      expect(error.code).toBe("INVALID_NODEID_FORMAT");
      expect(error.message).toBe("Test error message");
      expect(error.originalValue).toBe("invalid-value");
      expect(error.expectedFormat).toBe("Expected format: '1234:5678' or '1234-5678'");
    });

    it("should handle empty values", () => {
      const error = createNodeIdError("", "Empty nodeId error");
      
      expect(error.code).toBe("INVALID_NODEID_FORMAT");
      expect(error.message).toBe("Empty nodeId error");
      expect(error.originalValue).toBe("");
      expect(error.expectedFormat).toBe("Expected format: '1234:5678' or '1234-5678'");
    });
  });

  describe("integration scenarios", () => {
    it("should handle real-world nodeId examples", () => {
      // Test with realistic Figma nodeId values
      const testCases = [
        { input: "2836-1478", expected: "2836:1478", shouldConvert: true },
        { input: "2836:1478", expected: "2836:1478", shouldConvert: false },
        { input: "I2836-1478", expected: "I2836:1478", shouldConvert: true },
        { input: "I2836:1478", expected: "I2836:1478", shouldConvert: false },
        { input: "123ABC-456DEF", expected: "123ABC:456DEF", shouldConvert: true },
      ];

      testCases.forEach(({ input, expected, shouldConvert }) => {
        const result = normalizeNodeId(input);
        
        expect(result.isValid).toBe(true);
        expect(result.normalizedId).toBe(expected);
        expect(result.wasConverted).toBe(shouldConvert);
      });
    });

    it("should handle batch processing scenarios", () => {
      const nodeIds = ["1234-5678", "2345:6789", "3456-7890"];
      const results = nodeIds.map(normalizeNodeId);
      
      expect(results[0].normalizedId).toBe("1234:5678");
      expect(results[0].wasConverted).toBe(true);
      
      expect(results[1].normalizedId).toBe("2345:6789");
      expect(results[1].wasConverted).toBe(false);
      
      expect(results[2].normalizedId).toBe("3456:7890");
      expect(results[2].wasConverted).toBe(true);
      
      // Should have logged 2 conversions
      expect(Logger.log).toHaveBeenCalledTimes(2);
    });

    it("should maintain consistency across multiple calls", () => {
      const nodeId = "1234-5678";
      
      const result1 = normalizeNodeId(nodeId);
      const result2 = normalizeNodeId(nodeId);
      
      expect(result1).toEqual(result2);
      expect(result1.normalizedId).toBe("1234:5678");
      expect(result2.normalizedId).toBe("1234:5678");
    });
  });

  describe("performance and edge cases", () => {
    it("should handle very long nodeIds", () => {
      const longNodeId = "a".repeat(100) + "-" + "b".repeat(100);
      const result = normalizeNodeId(longNodeId);
      
      expect(result.isValid).toBe(true);
      expect(result.normalizedId).toBe("a".repeat(100) + ":" + "b".repeat(100));
      expect(result.wasConverted).toBe(true);
    });

    it("should handle single character segments", () => {
      const result = normalizeNodeId("a-b");
      
      expect(result.isValid).toBe(true);
      expect(result.normalizedId).toBe("a:b");
      expect(result.wasConverted).toBe(true);
    });

    it("should handle numeric-only nodeIds", () => {
      const result = normalizeNodeId("123-456");
      
      expect(result.isValid).toBe(true);
      expect(result.normalizedId).toBe("123:456");
      expect(result.wasConverted).toBe(true);
    });

    it("should handle mixed case nodeIds", () => {
      const result = normalizeNodeId("AbC123-dEf456");
      
      expect(result.isValid).toBe(true);
      expect(result.normalizedId).toBe("AbC123:dEf456");
      expect(result.wasConverted).toBe(true);
    });
  });
});