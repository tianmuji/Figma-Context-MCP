import { Logger } from "./logger.js";

export interface ImageDownloadDebugInfo {
  totalNodesRequested: number;
  pngNodesCount: number;
  svgNodesCount: number;
  imageFillsCount: number;
  renderRequestsCount: number;
  apiResponseStatus: string;
  successfulDownloads: number;
  failedDownloads: Array<{
    nodeId: string;
    fileName: string;
    reason: string;
  }>;
  processingDetails: {
    validImageRefs: string[];
    invalidImageRefs: string[];
    excludedNodes: string[];
  };
}

export class ImageDownloadDebugCollector {
  private debugInfo: ImageDownloadDebugInfo;

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
    this.logWithContext(`Total nodes requested: ${count}`);
  }

  setNodeCounts(pngCount: number, svgCount: number, imageFillsCount: number): void {
    this.debugInfo.pngNodesCount = pngCount;
    this.debugInfo.svgNodesCount = svgCount;
    this.debugInfo.imageFillsCount = imageFillsCount;
    this.debugInfo.renderRequestsCount = pngCount + svgCount;
    
    this.logWithContext(`Node breakdown - PNG: ${pngCount}, SVG: ${svgCount}, Image fills: ${imageFillsCount}`);
  }

  setApiResponseStatus(status: string): void {
    this.debugInfo.apiResponseStatus = status;
    this.logWithContext(`API response status: ${status}`);
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
    this.logWithContext(`Failed download: ${nodeId} (${fileName}) - ${reason}`);
  }

  setSuccessfulDownloads(count: number): void {
    this.debugInfo.successfulDownloads = count;
    this.logWithContext(`Successful downloads: ${count}`);
  }

  getDebugInfo(): ImageDownloadDebugInfo {
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
      info.failedDownloads.forEach((failure, index) => {
        const isLast = index === info.failedDownloads.length - 1;
        const prefix = isLast ? "   └─" : "   ├─";
        summary += `${prefix} ${failure.nodeId} (${failure.fileName}): ${failure.reason}\n`;
      });
    } else {
      summary += `└─ No failed downloads\n`;
    }
    
    return summary;
  }

  logDebugSummary(): void {
    const summary = this.generateDebugSummary();
    Logger.log(summary);
  }

  private logWithContext(message: string): void {
    Logger.log(`[ImageDownloadDebug] ${message}`);
  }
}

export function createImageDownloadDebugCollector(): ImageDownloadDebugCollector {
  return new ImageDownloadDebugCollector();
}

// Helper function to format debug information for user-facing output
export function formatDebugInfoForUser(debugInfo: ImageDownloadDebugInfo): string {
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
    debugInfo.failedDownloads.forEach(failure => {
      output += `  - ${failure.nodeId}: ${failure.reason}\n`;
    });
  }
  
  return output;
}