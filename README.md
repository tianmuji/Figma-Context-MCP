# figma-context-mcp

A Model Context Protocol (MCP) server that provides seamless integration with Figma's design API, featuring smart position information processing and layout inference capabilities. This tool enables AI assistants to understand and work with your Figma design files with enhanced spatial awareness.

[![npm version](https://img.shields.io/npm/v/figma-context-mcp.svg)](https://www.npmjs.com/package/figma-context-mcp)
[![npm downloads](https://img.shields.io/npm/dm/figma-context-mcp.svg)](https://www.npmjs.com/package/figma-context-mcp)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/tianmuji/Figma-Context-MCP/blob/main/LICENSE)

## Project Overview

`figma-context-mcp` is an enhanced Figma MCP server that goes beyond basic design file access. It features intelligent position information processing that helps AI assistants understand spatial relationships, layout structures, and design hierarchies within Figma files. The server automatically processes absolute positioning data to infer logical layout relationships, making design-to-code workflows more accurate and efficient.

### Key Features

- 🎨 **Smart Position Processing**: Automatically processes absolute positioning to infer flex layouts and spatial relationships
- 🧠 **Layout Inference**: Converts Figma's absolute positioning into logical layout structures for better code generation
- 🔍 **Enhanced Design Analysis**: Deep understanding of component hierarchies and design systems
- 🚀 **Multiple CLI Commands**: Three convenient command aliases for different use cases
- 🛡️ **Secure Integration**: Uses official Figma API with personal access tokens
- 📱 **MCP Compatible**: Works with Claude Desktop, Cursor, and other MCP-compatible tools

## Installation

### Prerequisites

- Node.js 16 or higher
- npm or yarn package manager
- A Figma account with API access

### Global Installation

```bash
npm install -g figma-context-mcp
```

## Quick Start Guide

### 1. Obtain a Figma API Key

1. Visit your [Figma Account Settings](https://www.figma.com/settings)
2. Scroll to the "Personal access tokens" section
3. Click "Create new token"
4. Provide a descriptive name for your token
5. Copy the generated token (keep it secure!)

### 2. Basic Usage

The tool provides three CLI command aliases for your convenience:

```bash
# Standard command
figma-developer-mcp --figma-api-key=YOUR_FIGMA_API_KEY --stdio

# Short alias
figma-mcp --figma-api-key=YOUR_FIGMA_API_KEY --stdio

# Personal alias
yujie-figma-mcp --figma-api-key=YOUR_FIGMA_API_KEY --stdio
```

### 3. MCP Client Configuration

#### Claude Desktop Configuration

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "figma-context": {
      "command": "figma-context-mcp",
      "args": ["--figma-api-key=YOUR_FIGMA_API_KEY", "--stdio"]
    }
  }
}
```

#### Cursor IDE Configuration

Add to your Cursor MCP settings:

```json
{
  "mcpServers": {
    "figma-context": {
      "command": "figma-mcp",
      "args": ["--figma-api-key=YOUR_FIGMA_API_KEY", "--stdio"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

#### Other MCP Clients

For other MCP-compatible tools, use any of the three available commands with the same argument structure.

## Usage Examples

### Design Analysis with Smart Positioning

```
"Analyze the layout structure of this Figma design, focusing on the spatial relationships between elements:"
https://www.figma.com/file/abc123/my-design
```

### Component-Based Code Generation

```
"Generate React components from this Figma design, using the inferred layout structure:"
https://www.figma.com/design/abc123/component-library?node-id=123-456
```

### Design System Extraction

```
"Extract design tokens and component patterns from this Figma file, including spacing and layout information:"
https://www.figma.com/file/abc123/design-system
```

### Layout Structure Analysis

```
"Help me understand how the elements in this Figma frame are positioned relative to each other:"
https://www.figma.com/file/abc123/layout-example?node-id=789-012
```

## Advanced Features

### Smart Position Information Processing

The server automatically:
- Processes absolute positioning data from Figma
- Infers logical parent-child relationships
- Converts absolute coordinates to relative positioning
- Suggests appropriate CSS layout methods (flexbox, grid)
- Maintains spatial context for better code generation

### Layout Inference Capabilities

- **AutoLayout Detection**: Recognizes Figma's AutoLayout and preserves flex properties
- **Absolute Position Handling**: Converts absolute positioning to logical layout structures
- **Spacing Analysis**: Calculates gaps, margins, and padding from position data
- **Hierarchy Understanding**: Builds component trees based on spatial relationships

## Troubleshooting

### Common Issues

**Invalid API Token**
- Verify your Figma API token is correct
- Ensure the token has necessary permissions for the files you're accessing

**File Access Denied**
- Check that the Figma file is accessible with your account
- Verify file sharing permissions if it's a team file

**Command Not Found**
- Ensure the package is installed globally: `npm list -g figma-context-mcp`
- Try reinstalling: `npm uninstall -g figma-context-mcp && npm install -g figma-context-mcp`

**MCP Connection Issues**
- Restart your MCP client after configuration changes
- Verify the JSON configuration syntax is correct
- Check that the command path is accessible

### Getting Help

- [GitHub Issues](https://github.com/tianmuji/Figma-Context-MCP/issues)
- [MCP Documentation](https://modelcontextprotocol.io/)
- Check for updates: `npm update -g figma-context-mcp`

## Development

### Building from Source

```bash
git clone https://github.com/tianmuji/Figma-Context-MCP.git
cd Figma-Context-MCP
npm install
npm run build
```

### Running Tests

```bash
npm test
```

### Local Development

```bash
npm run dev
```

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**yujie_wu**

## Attribution

This project is a fork of the original [Figma-Context-MCP](https://github.com/GLips/Figma-Context-MCP) by GLips. We extend our gratitude to the original author for creating the foundation that made this enhanced version possible. This fork adds smart position information processing, layout inference capabilities, and additional CLI command options while maintaining compatibility with the original MCP protocol implementation.
