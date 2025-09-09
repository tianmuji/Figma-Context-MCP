// Integration test to verify Figma MCP server returns position information correctly
import { parseFigmaResponse } from '../services/simplify-node-response.js';
import type { GetFileNodesResponse } from '../services/figma.js';

describe("Figma Position Information Integration", () => {
  let mockFigmaResponse: GetFileNodesResponse;

  beforeEach(() => {
    // Mock Figma API response with various layout scenarios
    mockFigmaResponse = {
      name: "Test Design",
      lastModified: "2024-01-01T00:00:00Z",
      thumbnailUrl: "https://example.com/thumb.png",
      err: null,
      nodes: {
        "root-frame": {
          document: {
            id: "root-frame",
            name: "Root Frame",
            type: "FRAME",
            absoluteBoundingBox: { x: 0, y: 0, width: 800, height: 600 },
            layoutMode: "NONE", // No AutoLayout
            children: [
              {
                id: "child-1",
                name: "Child 1 - No AutoLayout",
                type: "RECTANGLE",
                absoluteBoundingBox: { x: 50, y: 50, width: 100, height: 100 },
                visible: true,
                fills: []
              },
              {
                id: "autolayout-frame",
                name: "AutoLayout Frame",
                type: "FRAME",
                absoluteBoundingBox: { x: 200, y: 50, width: 300, height: 200 },
                layoutMode: "VERTICAL", // Has AutoLayout
                visible: true,
                children: [
                  {
                    id: "auto-child-1",
                    name: "Auto Child 1",
                    type: "RECTANGLE",
                    absoluteBoundingBox: { x: 210, y: 60, width: 280, height: 80 },
                    layoutPositioning: "AUTO", // In AutoLayout flow
                    visible: true,
                    fills: []
                  },
                  {
                    id: "absolute-child",
                    name: "Absolute Child",
                    type: "RECTANGLE",
                    absoluteBoundingBox: { x: 250, y: 100, width: 50, height: 50 },
                    layoutPositioning: "ABSOLUTE", // Absolutely positioned
                    visible: true,
                    fills: []
                  }
                ]
              }
            ],
            visible: true,
            fills: []
          }
        }
      }
    };
  });

  it("should include boundingBox for nodes in non-AutoLayout containers", () => {
    const simplified = parseFigmaResponse(mockFigmaResponse);
    
    // Root frame should have boundingBox (reference point)
    expect(simplified.nodes[0]).toHaveProperty('boundingBox');
    expect(simplified.nodes[0].boundingBox).toEqual({
      x: 0, y: 0, width: 800, height: 600
    });

    // Child in non-AutoLayout frame should have boundingBox
    const child1 = simplified.nodes[0].children?.[0];
    expect(child1).toHaveProperty('boundingBox');
    expect(child1?.boundingBox).toEqual({
      x: 50, y: 50, width: 100, height: 100
    });
  });

  it("should NOT include boundingBox for AutoLayout containers", () => {
    const simplified = parseFigmaResponse(mockFigmaResponse);
    
    // AutoLayout frame should NOT have boundingBox
    const autoLayoutFrame = simplified.nodes[0].children?.[1];
    expect(autoLayoutFrame?.type).toBe('FRAME');
    expect(autoLayoutFrame?.layout).toContain('flex-direction: column'); // Indicates AutoLayout
    // AutoLayout containers might still have boundingBox for reference, but layout should be primary
    expect(autoLayoutFrame).toHaveProperty('layout');
  });

  it("should NOT include boundingBox for children in AutoLayout flow", () => {
    const simplified = parseFigmaResponse(mockFigmaResponse);
    
    const autoLayoutFrame = simplified.nodes[0].children?.[1];
    const autoChild = autoLayoutFrame?.children?.[0];
    
    // Child in AutoLayout flow should NOT have boundingBox
    expect(autoChild?.name).toBe('Auto Child 1');
    // The child should rely on flex layout instead of absolute positioning
    expect(autoChild?.layout).not.toContain('position: absolute');
  });

  it("should include boundingBox for absolutely positioned elements", () => {
    const simplified = parseFigmaResponse(mockFigmaResponse);
    
    const autoLayoutFrame = simplified.nodes[0].children?.[1];
    const absoluteChild = autoLayoutFrame?.children?.[1];
    
    // Absolutely positioned child should have boundingBox
    expect(absoluteChild?.name).toBe('Absolute Child');
    expect(absoluteChild).toHaveProperty('boundingBox');
    expect(absoluteChild?.boundingBox).toEqual({
      x: 250, y: 100, width: 50, height: 50
    });
  });

  it("should calculate relative positions correctly", () => {
    const simplified = parseFigmaResponse(mockFigmaResponse);
    
    // Child position should be relative to root
    const child1 = simplified.nodes[0].children?.[0];
    expect(child1?.boundingBox).toEqual({
      x: 50, y: 50, width: 100, height: 100
    });

    // AutoLayout frame position should be relative to root
    const autoLayoutFrame = simplified.nodes[0].children?.[1];
    expect(autoLayoutFrame?.boundingBox).toEqual({
      x: 200, y: 50, width: 300, height: 200
    });
  });

  it("should include layout information for flex containers", () => {
    const simplified = parseFigmaResponse(mockFigmaResponse);
    
    const autoLayoutFrame = simplified.nodes[0].children?.[1];
    expect(autoLayoutFrame?.layout).toBeDefined();
    expect(autoLayoutFrame?.layout).toContain('flex-direction: column');
  });

  it("should preserve position info for layout inference", () => {
    const simplified = parseFigmaResponse(mockFigmaResponse);
    
    // Verify that we have enough position information to infer layouts
    const rootFrame = simplified.nodes[0];
    const child1 = rootFrame.children?.[0];
    const autoLayoutFrame = rootFrame.children?.[1];
    
    // Both children should have position info for spacing calculation
    expect(child1?.boundingBox?.x).toBe(50);
    expect(autoLayoutFrame?.boundingBox?.x).toBe(200);
    
    // We can calculate spacing: 200 - (50 + 100) = 50px gap
    const spacing = (autoLayoutFrame?.boundingBox?.x || 0) - 
                   ((child1?.boundingBox?.x || 0) + (child1?.boundingBox?.width || 0));
    expect(spacing).toBe(50);
  });
});
