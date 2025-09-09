import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FigmaService, type FigmaAuthOptions } from "./services/figma.js";
import type { SimplifiedDesign } from "./services/simplify-node-response.js";
import { createImageDownloadDebugCollector, formatDebugInfoForUser } from "./utils/debug-info.js";
import yaml from "js-yaml";
import { Logger } from "./utils/logger.js";
import { saveFigmaData } from "./utils/common.js";

const serverInfo = {
  name: "Figma MCP Server",
  version: process.env.NPM_PACKAGE_VERSION ?? "unknown",
};

type CreateServerOptions = {
  isHTTP?: boolean;
  outputFormat?: "yaml" | "json";
};

function createServer(
  authOptions: FigmaAuthOptions,
  { isHTTP = false, outputFormat = "yaml" }: CreateServerOptions = {},
) {
  const server = new McpServer(serverInfo);
  // const figmaService = new FigmaService(figmaApiKey);
  const figmaService = new FigmaService(authOptions);
  registerTools(server, figmaService, outputFormat);

  Logger.isHTTP = isHTTP;

  return server;
}

function registerTools(
  server: McpServer,
  figmaService: FigmaService,
  outputFormat: "yaml" | "json",
): void {
  // Tool to get file information
  server.tool(
    "get_figma_data",
    "When the nodeId cannot be obtained, obtain the layout information about the entire Figma file",
    {
      fileKey: z
        .string()
        .describe(
          "The key of the Figma file to fetch, often found in a provided URL like figma.com/(file|design)/<fileKey>/...",
        ),
      nodeId: z
        .string()
        .optional()
        .describe(
          "The ID of the node to fetch, often found as URL parameter node-id=<nodeId>, always use if provided",
        ),
      savePath: z
        .string()
        .optional()
        .describe(
          "The absolute path to the directory where images are stored in the project. If the directory does not exist, it will be created. The format of this path should respect the directory format of the operating system you are running on. Don't use any special character escaping in the path name either."
        ),
      depth: z
        .number()
        .optional()
        .describe(
          "OPTIONAL. Do NOT use unless explicitly requested by the user. Controls how many levels deep to traverse the node tree,",
        ),
    },
    async ({ fileKey, nodeId, savePath, depth }) => {
      try {
        Logger.log(
          `Fetching ${
            depth ? `${depth} layers deep` : "all layers"
          } of ${nodeId ? `node ${nodeId} from file` : `full file`} ${fileKey}`,
        );

        let file: SimplifiedDesign;
        if (nodeId) {
          file = await figmaService.getNode(fileKey, nodeId, depth);
        } else {
          file = await figmaService.getFile(fileKey, depth);
        }

        Logger.log(`Successfully fetched file: ${file.name}`);
        const { nodes, globalVars, ...metadata } = file;

        const result = {
          metadata,
          nodes,
          globalVars,
        };

        Logger.log(`Generating ${outputFormat.toUpperCase()} result from file`);
        const formattedResult =
          outputFormat === "json" ? JSON.stringify(result, null, 2) : yaml.dump(result);

        // Save to file if savePath is provided
        let savedFilePath: string | undefined;
        if (savePath) {
          try {
            Logger.log(`Saving Figma data to: ${savePath}`);
            savedFilePath = await saveFigmaData(result, savePath, fileKey, nodeId);
            Logger.log(`Successfully saved Figma data to: ${savedFilePath}`);
          } catch (saveError) {
            const saveErrorMessage = saveError instanceof Error ? saveError.message : String(saveError);
            Logger.error(`Failed to save Figma data: ${saveErrorMessage}`);
            // Continue with the response even if saving fails
          }
        }

        Logger.log("Sending result to client");
        const responseText = savedFilePath
          ? `${formattedResult}\n\n--- FILE SAVED ---\nData saved to: ${savedFilePath}`
          : formattedResult;

        return {
          content: [{ type: "text", text: responseText }],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : JSON.stringify(error);
        Logger.error(`Error fetching file ${fileKey}:`, message);

        // If there was a save path specified but we failed, mention it in the error
        const errorText = savePath
          ? `Error fetching file: ${message}. Note: Data could not be saved to ${savePath} due to the fetch error.`
          : `Error fetching file: ${message}`;

        return {
          isError: true,
          content: [{ type: "text", text: errorText }],
        };
      }
    },
  );

  // TODO: Clean up all image download related code, particularly getImages in Figma service
  // Tool to download images
  server.tool(
    "download_figma_images",
    "Download SVG and PNG images used in a Figma file based on the IDs of image or icon nodes",
    {
      fileKey: z.string().describe("The key of the Figma file containing the node"),
      nodes: z
        .object({
          nodeId: z
            .string()
            .describe("The ID of the Figma image node to fetch, formatted as 1234:5678"),
          imageRef: z
            .string()
            .optional()
            .describe(
              "If a node has an imageRef fill, you must include this variable. Leave blank when downloading Vector SVG images.",
            ),
          fileName: z.string().describe("The local name for saving the fetched file"),
        })
        .array()
        .describe("The nodes to fetch as images"),
      pngScale: z
        .number()
        .positive()
        .optional()
        .default(2)
        .describe(
          "Export scale for PNG images. Optional, defaults to 3 if not specified. Affects PNG images only.",
        ),
      localPath: z
        .string()
        .describe(
          "The absolute path to the directory where images are stored in the project. If the directory does not exist, it will be created. The format of this path should respect the directory format of the operating system you are running on. Don't use any special character escaping in the path name either.",
        ),
      svgOptions: z
        .object({
          outlineText: z
            .boolean()
            .optional()
            .default(true)
            .describe("Whether to outline text in SVG exports. Default is true."),
          includeId: z
            .boolean()
            .optional()
            .default(false)
            .describe("Whether to include IDs in SVG exports. Default is false."),
          simplifyStroke: z
            .boolean()
            .optional()
            .default(true)
            .describe("Whether to simplify strokes in SVG exports. Default is true."),
        })
        .optional()
        .default({})
        .describe("Options for SVG export"),
      useAbsoluteBounds: z
        .boolean()
        .optional()
        .default(false)
        .describe("Whether to use absolute bounds for image exports. When true, includes only the element's exact boundary without extra padding. Default is false."),
    },
    async ({ fileKey, nodes, localPath, svgOptions, pngScale, useAbsoluteBounds }) => {
      try {
        const debugCollector = createImageDownloadDebugCollector();
        
        Logger.log(`Image download tool called with ${nodes.length} nodes for file ${fileKey}`);
        debugCollector.setTotalNodes(nodes.length);
        
        // Separate nodes into image fills and render requests
        const imageFills = nodes.filter(({ imageRef }) => !!imageRef) as {
          nodeId: string;
          imageRef: string;
          fileName: string;
        }[];
        const renderRequests = nodes
          .filter(({ imageRef }) => !imageRef)
          .map(({ nodeId, fileName }) => ({
            nodeId,
            fileName,
            fileType: fileName.endsWith(".svg") ? ("svg" as const) : ("png" as const),
          }));

        const pngRequests = renderRequests.filter(r => r.fileType === "png");
        const svgRequests = renderRequests.filter(r => r.fileType === "svg");
        
        debugCollector.setNodeCounts(pngRequests.length, svgRequests.length, imageFills.length);

        Logger.log(`Breakdown: ${imageFills.length} image fills, ${renderRequests.length} render requests`);
        
        if (imageFills.length > 0) {
          Logger.log(`Image fill nodes: ${imageFills.map(f => `${f.nodeId}(${f.imageRef})`).join(", ")}`);
        }
        if (renderRequests.length > 0) {
          Logger.log(`Render request nodes: ${renderRequests.map(r => `${r.nodeId}(${r.fileType})`).join(", ")}`);
        }

        // Log filtering decisions
        const excludedNodes = nodes.filter(({ imageRef }) => imageRef === "");
        if (excludedNodes.length > 0) {
          Logger.log(`Nodes excluded due to empty imageRef: ${excludedNodes.map(n => n.nodeId).join(", ")}`);
          excludedNodes.forEach(node => debugCollector.addExcludedNode(node.nodeId));
        }

        const fillDownloads = figmaService.getImageFills(fileKey, imageFills, localPath, debugCollector);
        const renderDownloads = figmaService.getImages(
          fileKey,
          renderRequests,
          localPath,
          pngScale,
          svgOptions,
          useAbsoluteBounds,
          debugCollector,
        );

        const downloads = await Promise.all([fillDownloads, renderDownloads]).then(([f, r]) => [
          ...f,
          ...r,
        ]);

        // Count successful downloads (non-empty strings)
        const successfulDownloads = downloads.filter(d => d && d.length > 0);
        const failedDownloads = downloads.filter(d => !d || d.length === 0);
        
        debugCollector.setSuccessfulDownloads(successfulDownloads.length);
        Logger.log(`Download results: ${successfulDownloads.length} successful, ${failedDownloads.length} failed`);

        // Get structured debug information
        const debugInfo = debugCollector.getDebugInfo();
        const userFriendlyDebugInfo = formatDebugInfoForUser(debugInfo);

        // Provide detailed debugging information when no images are downloaded
        if (successfulDownloads.length === 0) {
          debugCollector.logDebugSummary();
          
          return {
            content: [
              {
                type: "text",
                text: `Success, 0 images downloaded.\n\n${userFriendlyDebugInfo}`,
              },
            ],
          };
        }

        // If any download fails, return false
        const saveSuccess = !downloads.find((success) => !success);
        const resultText = saveSuccess
          ? `Success, ${successfulDownloads.length} images downloaded: ${successfulDownloads.join(", ")}`
          : `Partial success, ${successfulDownloads.length} of ${downloads.length} images downloaded: ${successfulDownloads.join(", ")}`;
          
        // Include debug info for partial failures or when explicitly requested
        const shouldIncludeDebugInfo = !saveSuccess || successfulDownloads.length < nodes.length;
        const finalText = shouldIncludeDebugInfo 
          ? `${resultText}\n\n${userFriendlyDebugInfo}`
          : resultText;
          
        return {
          content: [
            {
              type: "text",
              text: finalText,
            },
          ],
        };
      } catch (error) {
        Logger.error(`Error downloading images from file ${fileKey}:`, error);
        return {
          isError: true,
          content: [{ type: "text", text: `Error downloading images: ${error}` }],
        };
      }
    },
  );
}

export { createServer };
