import { Logger } from "./logger.js";

// Type definitions for URL tracking
export type ImageFormat = 'PNG' | 'SVG' | 'IMAGE_FILL';
export type DownloadStatus = 'success' | 'failed' | 'attempted';

export interface DownloadUrlInfo {
  nodeId: string;
  fileName: string;
  format: ImageFormat;
  url: string | null;
  status: DownloadStatus;
}

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
  downloadUrls: DownloadUrlInfo[];
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
      downloadUrls: [],
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

  addDownloadUrl(nodeId: string, fileName: string, format: ImageFormat, url: string | null, status: DownloadStatus): void {
    // Validate input parameters
    if (!nodeId || !fileName) {
      this.logWithContext(`Warning: Invalid parameters for addDownloadUrl - nodeId: ${nodeId}, fileName: ${fileName}`);
      return;
    }

    // Check if URL entry already exists for this node and update it, otherwise add new entry
    const existingIndex = this.debugInfo.downloadUrls.findIndex(
      entry => entry.nodeId === nodeId && entry.fileName === fileName && entry.format === format
    );

    const urlInfo: DownloadUrlInfo = {
      nodeId,
      fileName,
      format,
      url,
      status
    };

    if (existingIndex >= 0) {
      // Update existing entry
      this.debugInfo.downloadUrls[existingIndex] = urlInfo;
      this.logWithContext(`Updated URL info for ${nodeId} (${fileName}): ${status} - ${url ? 'URL available' : 'No URL'}`);
    } else {
      // Add new entry
      this.debugInfo.downloadUrls.push(urlInfo);
      this.logWithContext(`Added URL info for ${nodeId} (${fileName}): ${status} - ${url ? 'URL available' : 'No URL'}`);
    }
  }

  getDownloadUrls(): DownloadUrlInfo[] {
    return [...this.debugInfo.downloadUrls];
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
    
    // Add URL statistics
    if (info.downloadUrls && info.downloadUrls.length > 0) {
      const urlStats = info.downloadUrls.reduce((acc, url) => {
        acc.total++;
        acc[url.status]++;
        acc.byFormat[url.format] = (acc.byFormat[url.format] || 0) + 1;
        return acc;
      }, {
        total: 0,
        success: 0,
        failed: 0,
        attempted: 0,
        byFormat: {} as Record<ImageFormat, number>
      });

      summary += `├─ URL tracking:\n`;
      summary += `│  ├─ Total URLs tracked: ${urlStats.total}\n`;
      summary += `│  ├─ Successful: ${urlStats.success}\n`;
      summary += `│  ├─ Failed: ${urlStats.failed}\n`;
      summary += `│  ├─ Attempted: ${urlStats.attempted}\n`;
      summary += `│  └─ By format: PNG(${urlStats.byFormat.PNG || 0}), SVG(${urlStats.byFormat.SVG || 0}), IMAGE_FILL(${urlStats.byFormat.IMAGE_FILL || 0})\n`;
    }
    
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

// URL truncation utility
export interface UrlDisplayOptions {
  maxLength: number;
  showDomain: boolean;
  truncateIndicator: string;
}

export function truncateUrl(url: string, options: UrlDisplayOptions = {
  maxLength: 80,
  showDomain: true,
  truncateIndicator: ' [truncated]'
}): string {
  if (!url || url.length <= options.maxLength) {
    return url;
  }

  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    
    if (options.showDomain && domain) {
      // Calculate available space for path after domain and protocol
      const protocolAndDomain = `${urlObj.protocol}//${domain}`;
      const availableSpace = options.maxLength - protocolAndDomain.length - options.truncateIndicator.length;
      
      if (availableSpace > 10) { // Ensure we have reasonable space for path
        const pathAndQuery = urlObj.pathname + urlObj.search + urlObj.hash;
        const truncatedPath = pathAndQuery.length > availableSpace 
          ? pathAndQuery.substring(0, availableSpace - 3) + '...'
          : pathAndQuery;
        
        return `${protocolAndDomain}${truncatedPath}${options.truncateIndicator}`;
      }
    }
    
    // Fallback: simple truncation from the beginning
    const truncatedLength = options.maxLength - options.truncateIndicator.length;
    return url.substring(0, truncatedLength) + options.truncateIndicator;
    
  } catch (error) {
    // If URL parsing fails, do simple truncation
    const truncatedLength = options.maxLength - options.truncateIndicator.length;
    return url.substring(0, truncatedLength) + options.truncateIndicator;
  }
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

  // Add Download URLs section
  if (debugInfo.downloadUrls && debugInfo.downloadUrls.length > 0) {
    output += `\nDownload URLs:\n`;
    
    // Group URLs by format
    const urlsByFormat = debugInfo.downloadUrls.reduce((acc, urlInfo) => {
      if (!acc[urlInfo.format]) {
        acc[urlInfo.format] = [];
      }
      acc[urlInfo.format].push(urlInfo);
      return acc;
    }, {} as Record<ImageFormat, DownloadUrlInfo[]>);

    // Display URLs grouped by format
    const formatOrder: ImageFormat[] = ['PNG', 'SVG', 'IMAGE_FILL'];
    const formatLabels = {
      'PNG': 'PNG Images',
      'SVG': 'SVG Images', 
      'IMAGE_FILL': 'Image Fills'
    };

    formatOrder.forEach(format => {
      const urls = urlsByFormat[format];
      if (urls && urls.length > 0) {
        output += `• ${formatLabels[format]}:\n`;
        urls.forEach(urlInfo => {
          const displayUrl = urlInfo.url 
            ? truncateUrl(urlInfo.url, { maxLength: 80, showDomain: true, truncateIndicator: ' [truncated]' })
            : 'No URL available';
          const statusIndicator = urlInfo.status === 'success' ? '✓' : 
                                 urlInfo.status === 'failed' ? '✗' : '○';
          output += `  ${statusIndicator} ${urlInfo.nodeId} (${urlInfo.fileName}): ${displayUrl}\n`;
        });
      }
    });
  }
  
  return output;
}