import fs from "fs";
import { parseFigmaResponse, type SimplifiedDesign } from "./simplify-node-response.js";
import type {
  GetImagesResponse,
  GetFileResponse,
  GetFileNodesResponse,
  GetImageFillsResponse,
} from "@figma/rest-api-spec";
import { downloadFigmaImage } from "~/utils/common.js";
import { Logger } from "~/utils/logger.js";
import { fetchWithRetry } from "~/utils/fetch-with-retry.js";
import { createImageDownloadDebugCollector, type ImageDownloadDebugCollector } from "~/utils/debug-info.js";
import yaml from "js-yaml";

export type FigmaAuthOptions = {
  figmaApiKey: string;
  figmaOAuthToken: string;
  useOAuth: boolean;
};

type FetchImageParams = {
  /**
   * The Node in Figma that will either be rendered or have its background image downloaded
   */
  nodeId: string;
  /**
   * The local file name to save the image
   */
  fileName: string;
  /**
   * The file mimetype for the image
   */
  fileType: "png" | "svg";
};

type FetchImageFillParams = Omit<FetchImageParams, "fileType"> & {
  /**
   * Required to grab the background image when an image is used as a fill
   */
  imageRef: string;
};

export class FigmaService {
  private readonly apiKey: string;
  private readonly oauthToken: string;
  private readonly useOAuth: boolean;
  private readonly baseUrl = "https://api.figma.com/v1";

  constructor({ figmaApiKey, figmaOAuthToken, useOAuth }: FigmaAuthOptions) {
    this.apiKey = figmaApiKey || "";
    this.oauthToken = figmaOAuthToken || "";
    this.useOAuth = !!useOAuth && !!this.oauthToken;
  }

  private async request<T>(endpoint: string): Promise<T> {
    try {
      Logger.log(`Calling ${this.baseUrl}${endpoint}`);

      // Set auth headers based on authentication method
      const headers: Record<string, string> = {};

      if (this.useOAuth) {
        // Use OAuth token with Authorization: Bearer header
        Logger.log("Using OAuth Bearer token for authentication");
        headers["Authorization"] = `Bearer ${this.oauthToken}`;
      } else {
        // Use Personal Access Token with X-Figma-Token header
        Logger.log("Using Personal Access Token for authentication");
        headers["X-Figma-Token"] = this.apiKey;
      }

      return await fetchWithRetry<T>(`${this.baseUrl}${endpoint}`, {
        headers,
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to make request to Figma API: ${error.message}`);
      }
      throw new Error(`Failed to make request to Figma API: ${error}`);
    }
  }

  async getImageFills(
    fileKey: string,
    nodes: FetchImageFillParams[],
    localPath: string,
    debugCollector?: ImageDownloadDebugCollector,
  ): Promise<string[]> {
    const debug = debugCollector || createImageDownloadDebugCollector();
    
    Logger.log(`Starting image fills download process for file ${fileKey}`);
    debug.setTotalNodes(nodes.length);
    debug.setNodeCounts(0, 0, nodes.length);
    
    if (nodes.length === 0) {
      Logger.log("No image fill nodes to process, returning empty array");
      return [];
    }

    // Log all imageRef values being requested
    const imageRefs = nodes.map(({ imageRef }) => imageRef);
    Logger.log(`Image references to fetch: ${imageRefs.join(", ")}`);

    let promises: Promise<string>[] = [];
    const endpoint = `/files/${fileKey}/images`;
    Logger.log(`Calling Figma API endpoint: ${this.baseUrl}${endpoint}`);
    
    const file = await this.request<GetImageFillsResponse>(endpoint);
    const { images = {} } = file.meta;
    
    Logger.log(`Image fills API response received with ${Object.keys(images).length} image URLs`);
    debug.setApiResponseStatus(`Image fills API responded with ${Object.keys(images).length} URLs`);
    
    // Log which imageRefs have valid URLs and which don't
    const validImageRefs: string[] = [];
    const invalidImageRefs: string[] = [];
    
    imageRefs.forEach(ref => {
      if (images[ref]) {
        validImageRefs.push(ref);
        debug.addValidImageRef(ref);
      } else {
        invalidImageRefs.push(ref);
        debug.addInvalidImageRef(ref);
      }
    });
    
    if (validImageRefs.length > 0) {
      Logger.log(`Valid image references found: ${validImageRefs.join(", ")}`);
    }
    if (invalidImageRefs.length > 0) {
      Logger.log(`Invalid/missing image references: ${invalidImageRefs.join(", ")}`);
    }

    promises = nodes.map(async ({ imageRef, fileName }) => {
      const imageUrl = images[imageRef];
      if (!imageUrl) {
        Logger.log(`No image URL found for imageRef ${imageRef} (${fileName})`);
        debug.addFailedDownload("unknown", fileName, `Invalid imageRef: ${imageRef}`);
        // Capture failed URL attempt for image fill
        debug.addDownloadUrl(imageRef, fileName, 'IMAGE_FILL', null, 'failed');
        return "";
      }
      Logger.log(`Queuing image fill download: ${imageRef} -> ${fileName}`);
      // Capture URL for image fill
      debug.addDownloadUrl(imageRef, fileName, 'IMAGE_FILL', imageUrl, 'attempted');
      return downloadFigmaImage(fileName, localPath, imageUrl, debug, imageRef, 'IMAGE_FILL');
    });
    
    Logger.log(`Attempting to download ${validImageRefs.length} image fills out of ${nodes.length} requested`);
    
    const results = await Promise.all(promises);
    const successfulDownloads = results.filter(r => r && r.length > 0);
    debug.setSuccessfulDownloads(successfulDownloads.length);

    if (!debugCollector) {
      debug.logDebugSummary();
    }
    
    return results;
  }

  async getImages(
    fileKey: string,
    nodes: FetchImageParams[],
    localPath: string,
    pngScale: number,
    svgOptions: {
      outlineText: boolean;
      includeId: boolean;
      simplifyStroke: boolean;
    },
    useAbsoluteBounds: boolean = false,
    debugCollector?: ImageDownloadDebugCollector,
  ): Promise<string[]> {
    const debug = debugCollector || createImageDownloadDebugCollector();
    
    Logger.log(`Starting image download process for file ${fileKey}`);
    debug.setTotalNodes(nodes.length);
    
    const pngNodes = nodes.filter(({ fileType }) => fileType === "png");
    const svgNodes = nodes.filter(({ fileType }) => fileType === "svg");
    const pngIds = pngNodes.map(({ nodeId }) => nodeId);
    const svgIds = svgNodes.map(({ nodeId }) => nodeId);
    
    debug.setNodeCounts(pngNodes.length, svgNodes.length, 0);
    
    Logger.log(`PNG nodes count: ${pngNodes.length} (IDs: ${pngIds.join(", ") || "none"})`);
    Logger.log(`SVG nodes count: ${svgNodes.length} (IDs: ${svgIds.join(", ") || "none"})`);

    const pngEndpoint = `/images/${fileKey}?ids=${pngIds.join(",")}&format=png&scale=${pngScale}&use_absolute_bounds=${useAbsoluteBounds}`;
    const pngFiles =
      pngIds.length > 0
        ? this.request<GetImagesResponse>(pngEndpoint).then(({ images = {} }) => {
            Logger.log(`PNG API response received for ${pngIds.length} nodes`);
            
            // Capture URLs for PNG nodes
            pngNodes.forEach(node => {
              const imageUrl = images[node.nodeId];
              if (imageUrl) {
                debug.addDownloadUrl(node.nodeId, node.fileName, 'PNG', imageUrl, 'attempted');
              } else {
                debug.addDownloadUrl(node.nodeId, node.fileName, 'PNG', null, 'failed');
              }
            });
            
            const emptyUrls = pngIds.filter(id => !images[id]);
            if (emptyUrls.length > 0) {
              Logger.log(`PNG nodes with empty/missing URLs: ${emptyUrls.join(", ")}`);
              emptyUrls.forEach(nodeId => {
                const node = pngNodes.find(n => n.nodeId === nodeId);
                if (node) {
                  debug.addFailedDownload(nodeId, node.fileName, "Empty/missing URL from Figma API");
                }
              });
            }
            debug.setApiResponseStatus(`PNG API responded with ${Object.keys(images).length} URLs`);
            return images;
          })
        : ({} as GetImagesResponse["images"]);

    const svgParams = [
      `ids=${svgIds.join(",")}`,
      "format=svg",
      `svg_outline_text=${svgOptions.outlineText}`,
      `svg_include_id=${svgOptions.includeId}`,
      `svg_simplify_stroke=${svgOptions.simplifyStroke}`,
      `use_absolute_bounds=${useAbsoluteBounds}`,
    ].join("&");
    const svgEndpoint = `/images/${fileKey}?${svgParams}`;

    const svgFiles =
      svgIds.length > 0
        ? this.request<GetImagesResponse>(svgEndpoint).then(({ images = {} }) => {
            Logger.log(`SVG API response received for ${svgIds.length} nodes`);
            
            // Capture URLs for SVG nodes
            svgNodes.forEach(node => {
              const imageUrl = images[node.nodeId];
              if (imageUrl) {
                debug.addDownloadUrl(node.nodeId, node.fileName, 'SVG', imageUrl, 'attempted');
              } else {
                debug.addDownloadUrl(node.nodeId, node.fileName, 'SVG', null, 'failed');
              }
            });
            
            const emptyUrls = svgIds.filter(id => !images[id]);
            if (emptyUrls.length > 0) {
              Logger.log(`SVG nodes with empty/missing URLs: ${emptyUrls.join(", ")}`);
              emptyUrls.forEach(nodeId => {
                const node = svgNodes.find(n => n.nodeId === nodeId);
                if (node) {
                  debug.addFailedDownload(nodeId, node.fileName, "Empty/missing URL from Figma API");
                }
              });
            }
            const currentStatus = debug.getDebugInfo().apiResponseStatus;
            debug.setApiResponseStatus(`${currentStatus}, SVG API responded with ${Object.keys(images).length} URLs`);
            return images;
          })
        : ({} as GetImagesResponse["images"]);

    Logger.log(`Making API requests - PNG endpoint: ${pngIds.length > 0 ? pngEndpoint : "none"}`);
    Logger.log(`Making API requests - SVG endpoint: ${svgIds.length > 0 ? svgEndpoint : "none"}`);

    const files = await Promise.all([pngFiles, svgFiles]).then(([f, l]) => ({ ...f, ...l }));

    Logger.log(`Combined API response contains ${Object.keys(files).length} image URLs`);

    const downloads = nodes
      .map(({ nodeId, fileName, fileType }) => {
        const imageUrl = files[nodeId];
        if (imageUrl) {
          Logger.log(`Queuing download for node ${nodeId} -> ${fileName}`);
          const format = fileType === 'png' ? 'PNG' : 'SVG';
          return downloadFigmaImage(fileName, localPath, imageUrl, debug, nodeId, format);
        } else {
          Logger.log(`No image URL found for node ${nodeId} (${fileName})`);
          debug.addFailedDownload(nodeId, fileName, "No image URL found in API response");
        }
        return false;
      })
      .filter((url) => !!url);

    Logger.log(`Attempting to download ${downloads.length} images out of ${nodes.length} requested`);

    const results = await Promise.all(downloads);
    const successfulDownloads = results.filter((r): r is string => typeof r === 'string' && r.length > 0);
    debug.setSuccessfulDownloads(successfulDownloads.length);

    if (!debugCollector) {
      debug.logDebugSummary();
    }

    return successfulDownloads;
  }

  async getFile(fileKey: string, depth?: number | null): Promise<SimplifiedDesign> {
    try {
      const endpoint = `/files/${fileKey}${depth ? `?depth=${depth}` : ""}`;
      Logger.log(`Retrieving Figma file: ${fileKey} (depth: ${depth ?? "default"})`);
      const response = await this.request<GetFileResponse>(endpoint);
      Logger.log("Got response");
      const simplifiedResponse = parseFigmaResponse(response);
      writeLogs("figma-raw.yml", response);
      writeLogs("figma-simplified.yml", simplifiedResponse);
      return simplifiedResponse;
    } catch (e) {
      console.error("Failed to get file:", e);
      throw e;
    }
  }

  async getNode(fileKey: string, nodeId: string, depth?: number | null): Promise<SimplifiedDesign> {
    const endpoint = `/files/${fileKey}/nodes?ids=${nodeId}${depth ? `&depth=${depth}` : ""}`;
    const response = await this.request<GetFileNodesResponse>(endpoint);
    Logger.log("Got response from getNode, now parsing.");
    writeLogs("figma-raw.yml", response);
    const simplifiedResponse = parseFigmaResponse(response);
    writeLogs("figma-simplified.yml", simplifiedResponse);
    return simplifiedResponse;
  }
}

function writeLogs(name: string, value: any) {
  try {
    if (process.env.NODE_ENV !== "development") return;

    const logsDir = "logs";

    try {
      fs.accessSync(process.cwd(), fs.constants.W_OK);
    } catch (error) {
      Logger.log("Failed to write logs:", error);
      return;
    }

    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir);
    }
    fs.writeFileSync(`${logsDir}/${name}`, yaml.dump(value));
  } catch (error) {
    console.debug("Failed to write logs:", error);
  }
}
