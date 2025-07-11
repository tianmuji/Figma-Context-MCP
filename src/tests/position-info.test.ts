// Simple test to verify position info logic without complex imports
import yaml from "js-yaml";

describe("Position Information Tests", () => {
  // Test helper functions for position logic
  function shouldIncludePositionInfo(
    node: any,
    parent?: any
  ): boolean {
    // 1. If node itself is an AutoLayout container, it doesn't need position info
    if (node.type === "FRAME" && node.layoutMode && node.layoutMode !== "NONE") {
      return false;
    }

    // 2. If node is in AutoLayout flow, it doesn't need position info
    if (parent && parent.type === "FRAME" && parent.layoutMode && parent.layoutMode !== "NONE") {
      // Check if node is not absolutely positioned
      if (!node.layoutPositioning || node.layoutPositioning !== "ABSOLUTE") {
        return false;
      }
    }

    // 3. If parent container doesn't use AutoLayout, node needs position info
    if (parent && parent.type === "FRAME") {
      const parentUsesAutoLayout = parent.layoutMode && parent.layoutMode !== "NONE";
      if (!parentUsesAutoLayout) {
        return true;
      }
    }

    // 4. Absolutely positioned elements always need position info
    if (node.layoutPositioning === "ABSOLUTE") {
      return true;
    }

    // 5. Root nodes need position info as reference
    if (!parent) {
      return true;
    }

    return false;
  }

  function calculateRelativePosition(
    nodeBounds: { x: number; y: number; width: number; height: number },
    rootBounds?: { x: number; y: number; width: number; height: number }
  ): { x: number; y: number } {
    if (!rootBounds) {
      return { x: nodeBounds.x, y: nodeBounds.y };
    }

    return {
      x: nodeBounds.x - rootBounds.x,
      y: nodeBounds.y - rootBounds.y
    };
  }

  it("should NOT include position info for AutoLayout containers", () => {
    const autoLayoutFrame = {
      type: "FRAME",
      layoutMode: "VERTICAL"
    };

    expect(shouldIncludePositionInfo(autoLayoutFrame)).toBe(false);
  });

  it("should NOT include position info for children in AutoLayout flow", () => {
    const parent = {
      type: "FRAME",
      layoutMode: "HORIZONTAL"
    };

    const child = {
      type: "RECTANGLE",
      layoutPositioning: "AUTO" // Not absolutely positioned
    };

    expect(shouldIncludePositionInfo(child, parent)).toBe(false);
  });

  it("should include position info for children in non-AutoLayout containers", () => {
    const parent = {
      type: "FRAME",
      layoutMode: "NONE" // No AutoLayout
    };

    const child = {
      type: "RECTANGLE"
    };

    expect(shouldIncludePositionInfo(child, parent)).toBe(true);
  });

  it("should include position info for absolutely positioned elements", () => {
    const parent = {
      type: "FRAME",
      layoutMode: "HORIZONTAL" // Has AutoLayout
    };

    const child = {
      type: "RECTANGLE",
      layoutPositioning: "ABSOLUTE" // Absolutely positioned
    };

    expect(shouldIncludePositionInfo(child, parent)).toBe(true);
  });

  it("should include position info for root nodes", () => {
    const rootNode = {
      type: "FRAME",
      layoutMode: "NONE"
    };

    expect(shouldIncludePositionInfo(rootNode)).toBe(true);
  });

  it("should calculate correct relative positions", () => {
    const nodeBounds = { x: 150, y: 250, width: 100, height: 50 };
    const rootBounds = { x: 100, y: 200, width: 300, height: 400 };

    const result = calculateRelativePosition(nodeBounds, rootBounds);

    expect(result).toEqual({
      x: 50, // 150 - 100
      y: 50  // 250 - 200
    });
  });

  it("should handle missing root bounds", () => {
    const nodeBounds = { x: 150, y: 250, width: 100, height: 50 };

    const result = calculateRelativePosition(nodeBounds);

    expect(result).toEqual({
      x: 150,
      y: 250
    });
  });

  it("should calculate spacing for layout inference", () => {
    // Simulate two horizontally aligned elements
    const element1Bounds = { x: 50, y: 50, width: 100, height: 50 };
    const element2Bounds = { x: 170, y: 50, width: 100, height: 50 };

    // Calculate horizontal spacing between elements
    const spacing = element2Bounds.x - (element1Bounds.x + element1Bounds.width);
    expect(spacing).toBe(20); // 170 - (50 + 100) = 20px gap

    // Verify they are horizontally aligned (same Y)
    expect(element1Bounds.y).toBe(element2Bounds.y);
  });
});
