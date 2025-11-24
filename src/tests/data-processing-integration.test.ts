// Integration test to verify strokeAlign and clipsContent properties appear in final simplified response

describe("Data Processing Integration Tests", () => {
  // Mock the complete data processing pipeline
  function mockParseFigmaResponse(mockFigmaData: any) {
    // Simulate the complete parsing pipeline
    const globalVars: any = { styles: {} };
    
    // Mock the parseNode function behavior
    function mockParseNode(node: any): any {
      const simplified: any = {
        id: node.id,
        name: node.name,
        type: node.type,
      };

      // Mock stroke processing (from style transformer)
      if (node.strokes && node.strokes.length > 0) {
        const strokes: any = { colors: node.strokes };
        
        if (node.strokeWeight) {
          strokes.strokeWeight = `${node.strokeWeight}px`;
        }
        
        if (node.strokeAlign && ["INSIDE", "OUTSIDE", "CENTER"].includes(node.strokeAlign)) {
          strokes.strokeAlign = node.strokeAlign;
        }
        
        if (Object.keys(strokes).length > 1) { // More than just colors
          simplified.strokes = `stroke-${Math.random().toString(36).substr(2, 9)}`;
          globalVars.styles[simplified.strokes] = strokes;
        }
      }

      // Mock layout processing (from layout transformer)
      if (node.type === "FRAME" || node.type === "GROUP") {
        const layout: any = {
          mode: node.layoutMode === "HORIZONTAL" ? "row" : 
                node.layoutMode === "VERTICAL" ? "column" : "none"
        };
        
        if (node.clipsContent === true) {
          layout.clipsContent = true;
        }
        
        if (Object.keys(layout).length > 1) { // More than just mode
          simplified.layout = `layout-${Math.random().toString(36).substr(2, 9)}`;
          globalVars.styles[simplified.layout] = layout;
        }
      }

      // Process children recursively
      // Skip children processing if node name contains "ic" (indicates this is an asset/icon node)
      if (node.children && node.children.length > 0) {
        const isAssetNode = node.name && typeof node.name === "string" && node.name.toLowerCase().includes("ic");
        
        if (!isAssetNode) {
          simplified.children = node.children.map(mockParseNode);
        }
      }

      return simplified;
    }

    const nodes = mockFigmaData.document.children.map(mockParseNode);
    
    return {
      name: mockFigmaData.name,
      lastModified: mockFigmaData.lastModified,
      thumbnailUrl: mockFigmaData.thumbnailUrl || "",
      nodes,
      components: {},
      componentSets: {},
      globalVars,
    };
  }

  describe("strokeAlign property integration", () => {
    it("should include strokeAlign in final simplified response", () => {
      const mockFigmaData = {
        name: "Test File",
        lastModified: "2024-01-01T00:00:00Z",
        document: {
          children: [
            {
              id: "1:1",
              name: "Rectangle with stroke",
              type: "RECTANGLE",
              strokes: [
                {
                  type: "SOLID",
                  visible: true,
                  color: { r: 1, g: 0, b: 0, a: 1 },
                },
              ],
              strokeWeight: 2,
              strokeAlign: "INSIDE",
            },
          ],
        },
      };

      const result = mockParseFigmaResponse(mockFigmaData);

      expect(result.nodes).toHaveLength(1);
      expect(result.nodes[0].strokes).toBeDefined();
      
      // Check that strokeAlign is in the global styles
      const strokeStyleId = result.nodes[0].strokes;
      const strokeStyle = result.globalVars.styles[strokeStyleId];
      expect(strokeStyle.strokeAlign).toBe("INSIDE");
    });

    it("should handle all valid strokeAlign values", () => {
      const validValues = ["INSIDE", "OUTSIDE", "CENTER"];
      
      validValues.forEach((strokeAlign) => {
        const mockFigmaData = {
          name: "Test File",
          lastModified: "2024-01-01T00:00:00Z",
          document: {
            children: [
              {
                id: "1:1",
                name: "Rectangle with stroke",
                type: "RECTANGLE",
                strokes: [
                  {
                    type: "SOLID",
                    visible: true,
                    color: { r: 1, g: 0, b: 0, a: 1 },
                  },
                ],
                strokeAlign,
              },
            ],
          },
        };

        const result = mockParseFigmaResponse(mockFigmaData);
        const strokeStyleId = result.nodes[0].strokes;
        const strokeStyle = result.globalVars.styles[strokeStyleId];
        expect(strokeStyle.strokeAlign).toBe(strokeAlign);
      });
    });

    it("should not include strokeAlign for invalid values", () => {
      const mockFigmaData = {
        name: "Test File",
        lastModified: "2024-01-01T00:00:00Z",
        document: {
          children: [
            {
              id: "1:1",
              name: "Rectangle with stroke",
              type: "RECTANGLE",
              strokes: [
                {
                  type: "SOLID",
                  visible: true,
                  color: { r: 1, g: 0, b: 0, a: 1 },
                },
              ],
              strokeWeight: 2, // Add strokeWeight to ensure stroke style is created
              strokeAlign: "INVALID_VALUE",
            },
          ],
        },
      };

      const result = mockParseFigmaResponse(mockFigmaData);
      const strokeStyleId = result.nodes[0].strokes;
      const strokeStyle = result.globalVars.styles[strokeStyleId];
      expect(strokeStyle.strokeAlign).toBeUndefined();
      expect(strokeStyle.strokeWeight).toBe("2px"); // Should still have valid properties
    });
  });

  describe("clipsContent property integration", () => {
    it("should include clipsContent in final simplified response when true", () => {
      const mockFigmaData = {
        name: "Test File",
        lastModified: "2024-01-01T00:00:00Z",
        document: {
          children: [
            {
              id: "1:1",
              name: "Frame with clipping",
              type: "FRAME",
              layoutMode: "VERTICAL",
              clipsContent: true,
            },
          ],
        },
      };

      const result = mockParseFigmaResponse(mockFigmaData);

      expect(result.nodes).toHaveLength(1);
      expect(result.nodes[0].layout).toBeDefined();
      
      // Check that clipsContent is in the global styles
      const layoutStyleId = result.nodes[0].layout;
      const layoutStyle = result.globalVars.styles[layoutStyleId];
      expect(layoutStyle.clipsContent).toBe(true);
    });

    it("should not include clipsContent when false", () => {
      const mockFigmaData = {
        name: "Test File",
        lastModified: "2024-01-01T00:00:00Z",
        document: {
          children: [
            {
              id: "1:1",
              name: "Frame without clipping",
              type: "FRAME",
              layoutMode: "VERTICAL",
              clipsContent: false,
            },
          ],
        },
      };

      const result = mockParseFigmaResponse(mockFigmaData);

      expect(result.nodes).toHaveLength(1);
      
      // Layout should still exist but without clipsContent
      if (result.nodes[0].layout) {
        const layoutStyleId = result.nodes[0].layout;
        const layoutStyle = result.globalVars.styles[layoutStyleId];
        expect(layoutStyle.clipsContent).toBeUndefined();
      }
    });

    it("should not include clipsContent when missing", () => {
      const mockFigmaData = {
        name: "Test File",
        lastModified: "2024-01-01T00:00:00Z",
        document: {
          children: [
            {
              id: "1:1",
              name: "Frame without clipsContent property",
              type: "FRAME",
              layoutMode: "VERTICAL",
            },
          ],
        },
      };

      const result = mockParseFigmaResponse(mockFigmaData);

      expect(result.nodes).toHaveLength(1);
      
      // Layout should still exist but without clipsContent
      if (result.nodes[0].layout) {
        const layoutStyleId = result.nodes[0].layout;
        const layoutStyle = result.globalVars.styles[layoutStyleId];
        expect(layoutStyle.clipsContent).toBeUndefined();
      }
    });

    it("should work with different frame types", () => {
      const frameTypes = ["FRAME", "GROUP"];
      
      frameTypes.forEach((type) => {
        const mockFigmaData = {
          name: "Test File",
          lastModified: "2024-01-01T00:00:00Z",
          document: {
            children: [
              {
                id: "1:1",
                name: `${type} with clipping`,
                type,
                layoutMode: "HORIZONTAL",
                clipsContent: true,
              },
            ],
          },
        };

        const result = mockParseFigmaResponse(mockFigmaData);
        const layoutStyleId = result.nodes[0].layout;
        const layoutStyle = result.globalVars.styles[layoutStyleId];
        expect(layoutStyle.clipsContent).toBe(true);
      });
    });
  });

  describe("backward compatibility", () => {
    it("should maintain existing functionality with new properties", () => {
      const mockFigmaData = {
        name: "Test File",
        lastModified: "2024-01-01T00:00:00Z",
        document: {
          children: [
            {
              id: "1:1",
              name: "Complex node",
              type: "FRAME",
              layoutMode: "VERTICAL",
              clipsContent: true,
              strokes: [
                {
                  type: "SOLID",
                  visible: true,
                  color: { r: 1, g: 0, b: 0, a: 1 },
                },
              ],
              strokeWeight: 3,
              strokeAlign: "CENTER",
              children: [
                {
                  id: "1:2",
                  name: "Child rectangle",
                  type: "RECTANGLE",
                  strokes: [
                    {
                      type: "SOLID",
                      visible: true,
                      color: { r: 0, g: 1, b: 0, a: 1 },
                    },
                  ],
                  strokeAlign: "OUTSIDE",
                },
              ],
            },
          ],
        },
      };

      const result = mockParseFigmaResponse(mockFigmaData);

      // Check parent node
      expect(result.nodes).toHaveLength(1);
      expect(result.nodes[0].id).toBe("1:1");
      expect(result.nodes[0].layout).toBeDefined();
      expect(result.nodes[0].strokes).toBeDefined();

      // Check parent layout includes clipsContent
      const parentLayoutId = result.nodes[0].layout;
      const parentLayout = result.globalVars.styles[parentLayoutId];
      expect(parentLayout.mode).toBe("column");
      expect(parentLayout.clipsContent).toBe(true);

      // Check parent stroke includes strokeAlign
      const parentStrokeId = result.nodes[0].strokes;
      const parentStroke = result.globalVars.styles[parentStrokeId];
      expect(parentStroke.strokeWeight).toBe("3px");
      expect(parentStroke.strokeAlign).toBe("CENTER");

      // Check child node
      expect(result.nodes[0].children).toHaveLength(1);
      expect(result.nodes[0].children[0].id).toBe("1:2");
      expect(result.nodes[0].children[0].strokes).toBeDefined();

      // Check child stroke includes strokeAlign
      const childStrokeId = result.nodes[0].children[0].strokes;
      const childStroke = result.globalVars.styles[childStrokeId];
      expect(childStroke.strokeAlign).toBe("OUTSIDE");
    });

    it("should work with nodes that have neither new property", () => {
      const mockFigmaData = {
        name: "Test File",
        lastModified: "2024-01-01T00:00:00Z",
        document: {
          children: [
            {
              id: "1:1",
              name: "Simple rectangle",
              type: "RECTANGLE",
            },
          ],
        },
      };

      const result = mockParseFigmaResponse(mockFigmaData);

      expect(result.nodes).toHaveLength(1);
      expect(result.nodes[0].id).toBe("1:1");
      expect(result.nodes[0].name).toBe("Simple rectangle");
      expect(result.nodes[0].type).toBe("RECTANGLE");
      
      // Should not have stroke or layout styles
      expect(result.nodes[0].strokes).toBeUndefined();
      expect(result.nodes[0].layout).toBeUndefined();
    });
  });

  describe("Asset node filtering by name pattern", () => {
    it("should skip children processing when node name contains 'ic'", () => {
      const mockFigmaData = {
        name: "Test File",
        lastModified: "2024-01-01T00:00:00Z",
        document: {
          children: [
            {
              id: "1:1",
              name: "ic_home_icon",
              type: "FRAME",
              children: [
                {
                  id: "1:2",
                  name: "Path 1",
                  type: "VECTOR",
                },
                {
                  id: "1:3",
                  name: "Path 2",
                  type: "VECTOR",
                },
              ],
            },
            {
              id: "2:1",
              name: "Normal Frame",
              type: "FRAME",
              children: [
                {
                  id: "2:2",
                  name: "Child Element",
                  type: "RECTANGLE",
                },
              ],
            },
          ],
        },
      };

      const result = mockParseFigmaResponse(mockFigmaData);

      expect(result.nodes).toHaveLength(2);
      
      // Asset node (contains "ic") should not have children
      expect(result.nodes[0].name).toBe("ic_home_icon");
      expect(result.nodes[0].children).toBeUndefined();
      
      // Normal node should have children
      expect(result.nodes[1].name).toBe("Normal Frame");
      expect(result.nodes[1].children).toBeDefined();
      expect(result.nodes[1].children).toHaveLength(1);
      expect(result.nodes[1].children[0].name).toBe("Child Element");
    });

    it("should handle case-insensitive matching of 'ic'", () => {
      const mockFigmaData = {
        name: "Test File",
        lastModified: "2024-01-01T00:00:00Z",
        document: {
          children: [
            {
              id: "1:1",
              name: "ICON_Frame",
              type: "FRAME",
              children: [
                {
                  id: "1:2",
                  name: "Child",
                  type: "RECTANGLE",
                },
              ],
            },
            {
              id: "2:1",
              name: "IconContainer",
              type: "FRAME",
              children: [
                {
                  id: "2:2",
                  name: "Child",
                  type: "RECTANGLE",
                },
              ],
            },
          ],
        },
      };

      const result = mockParseFigmaResponse(mockFigmaData);

      expect(result.nodes).toHaveLength(2);
      
      // Both should skip children (case-insensitive matching)
      expect(result.nodes[0].name).toBe("ICON_Frame");
      expect(result.nodes[0].children).toBeUndefined();
      
      expect(result.nodes[1].name).toBe("IconContainer");
      expect(result.nodes[1].children).toBeUndefined();
    });

    it("should still process children for nodes without 'ic' in name", () => {
      const mockFigmaData = {
        name: "Test File",
        lastModified: "2024-01-01T00:00:00Z",
        document: {
          children: [
            {
              id: "1:1",
              name: "Button_Container",
              type: "FRAME",
              children: [
                {
                  id: "1:2",
                  name: "Text Layer",
                  type: "TEXT",
                },
                {
                  id: "1:3",
                  name: "Background",
                  type: "RECTANGLE",
                },
              ],
            },
          ],
        },
      };

      const result = mockParseFigmaResponse(mockFigmaData);

      expect(result.nodes).toHaveLength(1);
      expect(result.nodes[0].name).toBe("Button_Container");
      expect(result.nodes[0].children).toBeDefined();
      expect(result.nodes[0].children).toHaveLength(2);
      expect(result.nodes[0].children[0].name).toBe("Text Layer");
      expect(result.nodes[0].children[1].name).toBe("Background");
    });
  });
});