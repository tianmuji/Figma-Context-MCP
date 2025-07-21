import { createServer } from "../mcp.js";
import { config } from "dotenv";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { CallToolResultSchema } from "@modelcontextprotocol/sdk/types.js";
import yaml from "js-yaml";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

config();

describe("Figma MCP Server Tests", () => {
  let server: McpServer;
  let client: Client;
  let figmaApiKey: string;
  let figmaFileKey: string;

  beforeAll(async () => {
    figmaApiKey = process.env.FIGMA_API_KEY || "";
    if (!figmaApiKey) {
      throw new Error("FIGMA_API_KEY is not set in environment variables");
    }

    figmaFileKey = process.env.FIGMA_FILE_KEY || "";
    if (!figmaFileKey) {
      throw new Error("FIGMA_FILE_KEY is not set in environment variables");
    }

    server = createServer({
      figmaApiKey,
      figmaOAuthToken: "",
      useOAuth: false,
    });

    client = new Client(
      {
        name: "figma-test-client",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      },
    );

    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

    await Promise.all([client.connect(clientTransport), server.connect(serverTransport)]);
  });

  afterAll(async () => {
    await client.close();
  });

  describe("Get Figma Data", () => {
    it("should be able to get Figma file data", async () => {
      const args: any = {
        fileKey: figmaFileKey,
      };

      const result = await client.request(
        {
          method: "tools/call",
          params: {
            name: "get_figma_data",
            arguments: args,
          },
        },
        CallToolResultSchema,
      );

      const content = result.content[0].text as string;
      const parsed = yaml.load(content);

      expect(parsed).toBeDefined();
    }, 60000);

    it("should be able to get Figma file data with savePath", async () => {
      const fs = await import("fs");
      const path = await import("path");
      const os = await import("os");

      // Create a temporary directory for testing
      const tempDir = path.join(os.tmpdir(), "figma-test-" + Date.now());

      const args: any = {
        fileKey: figmaFileKey,
        savePath: tempDir,
      };

      const result = await client.request(
        {
          method: "tools/call",
          params: {
            name: "get_figma_data",
            arguments: args,
          },
        },
        CallToolResultSchema,
      );

      const content = result.content[0].text as string;

      // Should contain the saved file path information
      expect(content).toContain("--- FILE SAVED ---");
      expect(content).toContain("Data saved to:");
      expect(content).toContain(tempDir);

      // Verify the file was actually created
      const files = fs.readdirSync(tempDir);
      expect(files.length).toBe(1);
      expect(files[0]).toMatch(/^figma-.*\.json$/);

      // Verify the file contains valid JSON
      const savedFilePath = path.join(tempDir, files[0]);
      const savedContent = fs.readFileSync(savedFilePath, 'utf8');
      const parsedSavedContent = JSON.parse(savedContent);
      expect(parsedSavedContent).toBeDefined();
      expect(parsedSavedContent.metadata).toBeDefined();
      expect(parsedSavedContent.nodes).toBeDefined();

      // Clean up
      fs.rmSync(tempDir, { recursive: true, force: true });
    }, 60000);
  });
});
