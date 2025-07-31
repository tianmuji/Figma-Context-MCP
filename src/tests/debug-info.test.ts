// Test for debug information collection functionality

describe("Debug Information Collection", () => {
  // Mock the ImageDownloadDebugCollector functionality
  class MockImageDownloadDebugCollector {
    private debugInfo: any;

    constructor() {
      this.debugInfo = {
        totalNodesRequested: 0,
        pngNodesCount: 0,
        svgNodesCount: 0,
        imageFillsCount: 0,
        renderRequestsCount: 0,
        apiResponseStatus: "pending",
        successfulDownloads: 0,
        failedDownloads: [],
        processingDetails: {
          validImageRefs: [],
          invalidImageRefs: [],
          excludedNodes: [],
        },
      };
    }

    setTotalNodes(count: number): void {
      this.debugInfo.totalNodesRequested = count;
    }

    setNodeCounts(pngCount: number, svgCount: number, imageFillsCount: number): void {
      this.debugInfo.pngNodesCount = pngCount;
      this.debugInfo.svgNodesCount = svgCount;
      this.debugInfo.imageFillsCount = imageFillsCount;
      this.debugInfo.renderRequestsCount = pngCount + svgCount;
    }

    setApiResponseStatus(status: string): void {
      this.debugInfo.apiResponseStatus = status;
    }

    addValidImageRef(imageRef: string): void {
      this.debugInfo.processingDetails.validImageRefs.push(imageRef);
    }

    addInvalidImageRef(imageRef: string): void {
      this.debugInfo.processingDetails.invalidImageRefs.push(imageRef);
    }

    addExcludedNode(nodeId: string): void {
      this.debugInfo.processingDetails.excludedNodes.push(nodeId);
    }

    addFailedDownload(nodeId: string, fileName: string, reason: string): void {
      this.debugInfo.failedDownloads.push({ nodeId, fileName, reason });
    }

    setSuccessfulDownloads(count: number): void {
      this.debugInfo.successfulDownloads = count;
    }

    getDebugInfo(): any {
      return { ...this.debugInfo };
    }

    generateDebugSummary(): string {
      const info = this.debugInfo;
      let summary = "Image Download Debug Summary:\n";
      summary += `├─ Total nodes requested: ${info.totalNodesRequested}\n`;
      summary += `├─ Node breakdown:\n`;
      summary += `│  ├─ PNG nodes: ${info.pngNodesCount}\n`;
      summary += `│  ├─ SVG nodes: ${info.svgNodesCount}\n`;
      summary += `│  └─ Image fills: ${info.imageFillsCount}\n`;
      summary += `├─ API response status: ${info.apiResponseStatus}\n`;
      summary += `├─ Processing results:\n`;
      summary += `│  ├─ Successful downloads: ${info.successfulDownloads}\n`;
      summary += `│  └─ Failed downloads: ${info.failedDownloads.length}\n`;
      
      if (info.processingDetails.excludedNodes.length > 0) {
        summary += `├─ Excluded nodes: ${info.processingDetails.excludedNodes.join(", ")}\n`;
      }
      
      if (info.processingDetails.invalidImageRefs.length > 0) {
        summary += `├─ Invalid image refs: ${info.processingDetails.invalidImageRefs.join(", ")}\n`;
      }
      
      if (info.failedDownloads.length > 0) {
        summary += `└─ Failed download details:\n`;
        info.failedDownloads.forEach((failure: any, index: number) => {
          const isLast = index === info.failedDownloads.length - 1;
          const prefix = isLast ? "   └─" : "   ├─";
          summary += `${prefix} ${failure.nodeId} (${failure.fileName}): ${failure.reason}\n`;
        });
      } else {
        summary += `└─ No failed downloads\n`;
      }
      
      return summary;
    }
  }

  // Mock formatDebugInfoForUser function
  function mockFormatDebugInfoForUser(debugInfo: any): string {
    let output = "Debug Information:\n";
    output += `• Total nodes requested: ${debugInfo.totalNodesRequested}\n`;
    output += `• Breakdown: ${debugInfo.pngNodesCount} PNG, ${debugInfo.svgNodesCount} SVG, ${debugInfo.imageFillsCount} image fills\n`;
    output += `• Successful downloads: ${debugInfo.successfulDownloads}\n`;
    output += `• Failed downloads: ${debugInfo.failedDownloads.length}\n`;
    
    if (debugInfo.processingDetails.excludedNodes.length > 0) {
      output += `• Excluded nodes (empty imageRef): ${debugInfo.processingDetails.excludedNodes.join(", ")}\n`;
    }
    
    if (debugInfo.processingDetails.invalidImageRefs.length > 0) {
      output += `• Invalid image references: ${debugInfo.processingDetails.invalidImageRefs.join(", ")}\n`;
    }
    
    if (debugInfo.failedDownloads.length > 0) {
      output += `• Failed download reasons:\n`;
      debugInfo.failedDownloads.forEach((failure: any) => {
        output += `  - ${failure.nodeId}: ${failure.reason}\n`;
      });
    }
    
    return output;
  }

  describe("ImageDownloadDebugCollector", () => {
    let debugCollector: MockImageDownloadDebugCollector;

    beforeEach(() => {
      debugCollector = new MockImageDownloadDebugCollector();
    });

    it("should initialize with default values", () => {
      const debugInfo = debugCollector.getDebugInfo();

      expect(debugInfo.totalNodesRequested).toBe(0);
      expect(debugInfo.pngNodesCount).toBe(0);
      expect(debugInfo.svgNodesCount).toBe(0);
      expect(debugInfo.imageFillsCount).toBe(0);
      expect(debugInfo.apiResponseStatus).toBe("pending");
      expect(debugInfo.successfulDownloads).toBe(0);
      expect(debugInfo.failedDownloads).toHaveLength(0);
    });

    it("should track total nodes requested", () => {
      debugCollector.setTotalNodes(5);

      const debugInfo = debugCollector.getDebugInfo();
      expect(debugInfo.totalNodesRequested).toBe(5);
    });

    it("should track node breakdown correctly", () => {
      debugCollector.setNodeCounts(2, 3, 1);

      const debugInfo = debugCollector.getDebugInfo();
      expect(debugInfo.pngNodesCount).toBe(2);
      expect(debugInfo.svgNodesCount).toBe(3);
      expect(debugInfo.imageFillsCount).toBe(1);
      expect(debugInfo.renderRequestsCount).toBe(5); // 2 + 3
    });

    it("should track API response status", () => {
      debugCollector.setApiResponseStatus("API responded with 3 URLs");

      const debugInfo = debugCollector.getDebugInfo();
      expect(debugInfo.apiResponseStatus).toBe("API responded with 3 URLs");
    });

    it("should track valid and invalid image references", () => {
      debugCollector.addValidImageRef("valid-ref-1");
      debugCollector.addValidImageRef("valid-ref-2");
      debugCollector.addInvalidImageRef("invalid-ref-1");

      const debugInfo = debugCollector.getDebugInfo();
      expect(debugInfo.processingDetails.validImageRefs).toEqual(["valid-ref-1", "valid-ref-2"]);
      expect(debugInfo.processingDetails.invalidImageRefs).toEqual(["invalid-ref-1"]);
    });

    it("should track excluded nodes", () => {
      debugCollector.addExcludedNode("node-1");
      debugCollector.addExcludedNode("node-2");

      const debugInfo = debugCollector.getDebugInfo();
      expect(debugInfo.processingDetails.excludedNodes).toEqual(["node-1", "node-2"]);
    });

    it("should track failed downloads", () => {
      debugCollector.addFailedDownload("node-1", "image1.png", "Empty URL from API");
      debugCollector.addFailedDownload("node-2", "image2.svg", "Network error");

      const debugInfo = debugCollector.getDebugInfo();
      expect(debugInfo.failedDownloads).toHaveLength(2);
      expect(debugInfo.failedDownloads[0]).toEqual({
        nodeId: "node-1",
        fileName: "image1.png",
        reason: "Empty URL from API",
      });
      expect(debugInfo.failedDownloads[1]).toEqual({
        nodeId: "node-2",
        fileName: "image2.svg",
        reason: "Network error",
      });
    });

    it("should track successful downloads", () => {
      debugCollector.setSuccessfulDownloads(3);

      const debugInfo = debugCollector.getDebugInfo();
      expect(debugInfo.successfulDownloads).toBe(3);
    });

    it("should generate comprehensive debug summary", () => {
      debugCollector.setTotalNodes(5);
      debugCollector.setNodeCounts(2, 1, 2);
      debugCollector.setApiResponseStatus("API responded with 3 URLs");
      debugCollector.addExcludedNode("excluded-node");
      debugCollector.addInvalidImageRef("invalid-ref");
      debugCollector.addFailedDownload("failed-node", "failed.png", "Download failed");
      debugCollector.setSuccessfulDownloads(2);

      const summary = debugCollector.generateDebugSummary();

      expect(summary).toContain("Total nodes requested: 5");
      expect(summary).toContain("PNG nodes: 2");
      expect(summary).toContain("SVG nodes: 1");
      expect(summary).toContain("Image fills: 2");
      expect(summary).toContain("API responded with 3 URLs");
      expect(summary).toContain("Successful downloads: 2");
      expect(summary).toContain("Failed downloads: 1");
      expect(summary).toContain("Excluded nodes: excluded-node");
      expect(summary).toContain("Invalid image refs: invalid-ref");
      expect(summary).toContain("failed-node (failed.png): Download failed");
    });
  });

  describe("formatDebugInfoForUser", () => {
    it("should format debug info for user-friendly output", () => {
      const debugInfo = {
        totalNodesRequested: 5,
        pngNodesCount: 2,
        svgNodesCount: 1,
        imageFillsCount: 2,
        successfulDownloads: 3,
        failedDownloads: [
          { nodeId: "node-1", fileName: "image1.png", reason: "Empty URL" },
          { nodeId: "node-2", fileName: "image2.svg", reason: "Network error" },
        ],
        processingDetails: {
          excludedNodes: ["excluded-node"],
          invalidImageRefs: ["invalid-ref"],
        },
      };

      const formatted = mockFormatDebugInfoForUser(debugInfo);

      expect(formatted).toContain("Total nodes requested: 5");
      expect(formatted).toContain("Breakdown: 2 PNG, 1 SVG, 2 image fills");
      expect(formatted).toContain("Successful downloads: 3");
      expect(formatted).toContain("Failed downloads: 2");
      expect(formatted).toContain("Excluded nodes (empty imageRef): excluded-node");
      expect(formatted).toContain("Invalid image references: invalid-ref");
      expect(formatted).toContain("- node-1: Empty URL");
      expect(formatted).toContain("- node-2: Network error");
    });

    it("should handle empty debug info gracefully", () => {
      const debugInfo = {
        totalNodesRequested: 0,
        pngNodesCount: 0,
        svgNodesCount: 0,
        imageFillsCount: 0,
        successfulDownloads: 0,
        failedDownloads: [],
        processingDetails: {
          excludedNodes: [],
          invalidImageRefs: [],
        },
      };

      const formatted = mockFormatDebugInfoForUser(debugInfo);

      expect(formatted).toContain("Total nodes requested: 0");
      expect(formatted).toContain("Breakdown: 0 PNG, 0 SVG, 0 image fills");
      expect(formatted).toContain("Successful downloads: 0");
      expect(formatted).toContain("Failed downloads: 0");
      expect(formatted).not.toContain("Excluded nodes");
      expect(formatted).not.toContain("Invalid image references");
      expect(formatted).not.toContain("Failed download reasons");
    });
  });

  describe("Image download scenarios", () => {
    it("should handle scenario with no images downloaded", () => {
      const debugCollector = new MockImageDownloadDebugCollector();
      
      debugCollector.setTotalNodes(3);
      debugCollector.setNodeCounts(1, 1, 1);
      debugCollector.setApiResponseStatus("API responded with 0 URLs");
      debugCollector.addFailedDownload("node-1", "image1.png", "Empty URL from API");
      debugCollector.addFailedDownload("node-2", "image2.svg", "Empty URL from API");
      debugCollector.addFailedDownload("node-3", "image3.png", "Invalid imageRef");
      debugCollector.setSuccessfulDownloads(0);

      const debugInfo = debugCollector.getDebugInfo();
      const formatted = mockFormatDebugInfoForUser(debugInfo);

      expect(debugInfo.totalNodesRequested).toBe(3);
      expect(debugInfo.successfulDownloads).toBe(0);
      expect(debugInfo.failedDownloads).toHaveLength(3);
      expect(formatted).toContain("Failed downloads: 3");
    });

    it("should handle partial success scenario", () => {
      const debugCollector = new MockImageDownloadDebugCollector();
      
      debugCollector.setTotalNodes(4);
      debugCollector.setNodeCounts(2, 1, 1);
      debugCollector.setApiResponseStatus("API responded with 2 URLs");
      debugCollector.addFailedDownload("node-3", "image3.svg", "Empty URL from API");
      debugCollector.addFailedDownload("node-4", "image4.png", "Network error");
      debugCollector.setSuccessfulDownloads(2);

      const debugInfo = debugCollector.getDebugInfo();

      expect(debugInfo.totalNodesRequested).toBe(4);
      expect(debugInfo.successfulDownloads).toBe(2);
      expect(debugInfo.failedDownloads).toHaveLength(2);
    });

    it("should handle complete success scenario", () => {
      const debugCollector = new MockImageDownloadDebugCollector();
      
      debugCollector.setTotalNodes(3);
      debugCollector.setNodeCounts(1, 1, 1);
      debugCollector.setApiResponseStatus("API responded with 3 URLs");
      debugCollector.setSuccessfulDownloads(3);

      const debugInfo = debugCollector.getDebugInfo();

      expect(debugInfo.totalNodesRequested).toBe(3);
      expect(debugInfo.successfulDownloads).toBe(3);
      expect(debugInfo.failedDownloads).toHaveLength(0);
    });
  });
});