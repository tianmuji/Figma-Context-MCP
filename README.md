# Figma Context MCP

> Forked from [GLips/Figma-Context-MCP](https://github.com/GLips/Figma-Context-MCP)

A Model Context Protocol (MCP) server that enhances Figma design integration by adding element position information to API responses. This enables AI assistants to better understand spatial relationships and convert designs to code more accurately by inferring logical layouts from absolute positioning.

[![npm version](https://img.shields.io/npm/v/figma-context-mcp.svg)](https://www.npmjs.com/package/figma-context-mcp)
[![npm downloads](https://img.shields.io/npm/dm/figma-context-mcp.svg)](https://www.npmjs.com/package/figma-context-mcp)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/tianmuji/Figma-Context-MCP/blob/main/LICENSE)

## Key Enhancement

**Position Information for Better Layout Inference**

This fork's primary enhancement adds element position data (x, y coordinates, width, height) to API responses for nodes that don't use Figma's AutoLayout feature. This enables AI assistants to:

- Infer logical layout relationships from absolute positioning
- Better understand spatial hierarchies and component structures
- Generate more accurate design-to-code conversions
- Maintain full backward compatibility with the original MCP server

## Features

- � **Position Data Enhancement** - Adds x, y, width, height for non-AutoLayout elements
- 🧠 **Layout Inference** - Helps AI understand spatial relationships from absolute positioning
- 🔄 **Full Compatibility** - Maintains all original functionality and integrations
- 🚀 **Multiple CLI Commands** - Three convenient command aliases
- 🛡️ **Secure Integration** - Uses official Figma API with personal access tokens
- 📱 **MCP Compatible** - Works with Claude Desktop, Cursor, and other MCP tools

## Quick Start

Get up and running in 3 simple steps:

### Step 1: Get Your Figma API Token

1. Visit [Figma Account Settings](https://www.figma.com/settings)
2. Scroll to "Personal access tokens"
3. Click "Create new token", name it (e.g., "MCP Server"), and copy the token

### Step 2: Configure Your AI Assistant

See the [Integration](#integration) section below for detailed setup instructions for your specific AI assistant (Cursor IDE, VS Code, etc.).

### ✅ Verify It's Working

1. Open your AI assistant (Cursor, VS Code, etc.)
2. Try this example:
   ```
   "Analyze the layout structure of this Figma design:"
   https://www.figma.com/community/file/1234567890/example-design
   ```
3. Your AI should access and analyze the Figma file with position information!

**Troubleshooting:** If it doesn't work, check the [Troubleshooting](#troubleshooting) section below.

## How It Works

**Prerequisites:** Node.js 20+ and a Figma account with API access

**No Installation Required:**
- Uses `npx figma-context-mcp` - downloads automatically when needed
- No global packages to manage
- Always uses the latest version
- Works immediately without setup steps

## Integration

### Cursor IDE

Configure in Cursor settings (`Cmd/Ctrl + ,` → Extensions → MCP Servers):

**Configuration:**
```json
{
  "mcpServers": {
    "figma-context": {
      "command": "npx",
      "args": ["figma-context-mcp", "--figma-api-key=${FIGMA_API_KEY}", "--stdio"]
    }
  }
}
```

**Test:** Use Cursor's AI chat to analyze a Figma design URL.

### VS Code (with Continue Extension)

Install the Continue extension and configure `~/.continue/config.json`:

```json
{
  "models": [...],
  "mcpServers": {
    "figma-context": {
      "command": "npx",
      "args": ["figma-context-mcp", "--figma-api-key=${FIGMA_API_KEY}", "--stdio"]
    }
  }
}
```

### Other MCP Tools

```json
{
  "mcpServers": {
    "figma-context": {
      "command": "npx",
      "args": ["figma-context-mcp", "--figma-api-key=${FIGMA_API_KEY}", "--stdio"]
    }
  }
}
```

## Usage Examples

**Design Analysis:**
```
"Analyze the layout structure of this Figma design:"
https://www.figma.com/file/abc123/my-design
```

**Component Generation:**
```
"Generate React components from this Figma design:"
https://www.figma.com/design/abc123/component-library?node-id=123-456
```

**Design System Extraction:**
```
"Extract design tokens from this Figma file:"
https://www.figma.com/file/abc123/design-system
```

## How Position Enhancement Works

### Position Data for Non-AutoLayout Elements
- **What's Added**: x, y coordinates (relative to root), width, and height
- **When Applied**: Only for elements that don't use Figma's AutoLayout feature
- **Purpose**: Enables AI to infer logical layout relationships from absolute positioning
- **Compatibility**: Fully backward compatible with original MCP server responses

### Benefits for AI Assistants
- **Better Layout Understanding**: AI can analyze spatial relationships between elements
- **Improved Code Generation**: More accurate conversion from design to responsive layouts
- **Hierarchy Inference**: Builds logical component trees from positioning data
- **AutoLayout Preservation**: Maintains Figma's native layout properties where they exist

## Troubleshooting

**Common Issues:**

- **MCP server failed to start:** Test manually with `npx figma-context-mcp --figma-api-key=YOUR_TOKEN --stdio`
- **Invalid API token:** Test your token with `curl -H "X-FIGMA-TOKEN: YOUR_TOKEN" https://api.figma.com/v1/me`
- **Configuration errors:** Validate JSON syntax and restart your AI client
- **Environment variables not working:** Test with explicit token first, then debug environment setup

**Getting Help:**
- [GitHub Issues](https://github.com/tianmuji/Figma-Context-MCP/issues)
- [MCP Documentation](https://modelcontextprotocol.io/)
- [Figma API Docs](https://www.figma.com/developers/api)

## Development

**Building from Source:**
```bash
git clone https://github.com/tianmuji/Figma-Context-MCP.git
cd Figma-Context-MCP
npm install && npm run build
```
**Running Tests:**
```bash
npm test
```

**Updates:**
```bash
npm update -g figma-context-mcp
```

## Contributing

Contributions are welcome! Please submit issues and pull requests.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Author

**yujie_wu**

## Attribution

This project is a fork of [GLips/Figma-Context-MCP](https://github.com/GLips/Figma-Context-MCP). The primary enhancement is the addition of element position information (x, y coordinates, width, height) for non-AutoLayout nodes, enabling better layout inference for AI assistants while maintaining full compatibility with the original MCP server functionality.
