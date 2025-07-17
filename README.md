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

### 3. Integration Methods

## Integration Methods

This section provides comprehensive integration instructions for various AI assistants and development environments.

### Claude Desktop Integration

Claude Desktop is one of the most popular MCP clients. Follow these platform-specific instructions:

#### macOS Setup

**Configuration File Location:**
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Step-by-step Setup:**

1. **Create or edit the configuration file:**
   ```bash
   mkdir -p ~/Library/Application\ Support/Claude
   nano ~/Library/Application\ Support/Claude/claude_desktop_config.json
   ```

2. **Add the MCP server configuration:**
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

3. **Alternative with environment variable (recommended):**
   ```json
   {
     "mcpServers": {
       "figma-context": {
         "command": "figma-context-mcp",
         "args": ["--figma-api-key=${FIGMA_API_KEY}", "--stdio"],
         "env": {
           "FIGMA_API_KEY": "your_actual_figma_token_here"
         }
       }
     }
   }
   ```

4. **Restart Claude Desktop** to load the new configuration.

#### Windows Setup

**Configuration File Location:**
```
%APPDATA%\Claude\claude_desktop_config.json
```

**Step-by-step Setup:**

1. **Navigate to the configuration directory:**
   ```cmd
   cd %APPDATA%\Claude
   ```

2. **Create or edit the configuration file:**
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

3. **Using PowerShell with environment variables:**
   ```powershell
   $env:FIGMA_API_KEY = "your_actual_figma_token_here"
   ```

4. **Configuration with environment variable:**
   ```json
   {
     "mcpServers": {
       "figma-context": {
         "command": "figma-context-mcp",
         "args": ["--figma-api-key=%FIGMA_API_KEY%", "--stdio"]
       }
     }
   }
   ```

5. **Restart Claude Desktop** to apply changes.

#### Verification for Claude Desktop

After configuration, test the integration:

1. Open Claude Desktop
2. Start a new conversation
3. Send a message like: "Can you help me analyze this Figma design?" with a Figma URL
4. Claude should be able to access and analyze the Figma file

### Cursor IDE Integration

Cursor IDE provides excellent MCP support for development workflows.

#### Prerequisites
- Cursor IDE installed
- Node.js 16+ installed
- figma-context-mcp package installed globally

#### Configuration Steps

1. **Open Cursor Settings:**
   - Press `Cmd/Ctrl + ,` to open settings
   - Navigate to "Extensions" → "MCP Servers"

2. **Add MCP Server Configuration:**
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

3. **Alternative Configuration with All CLI Commands:**
   ```json
   {
     "mcpServers": {
       "figma-standard": {
         "command": "figma-developer-mcp",
         "args": ["--figma-api-key=${FIGMA_API_KEY}", "--stdio"]
       },
       "figma-short": {
         "command": "figma-mcp",
         "args": ["--figma-api-key=${FIGMA_API_KEY}", "--stdio"]
       },
       "figma-personal": {
         "command": "yujie-figma-mcp",
         "args": ["--figma-api-key=${FIGMA_API_KEY}", "--stdio"]
       }
     }
   }
   ```

4. **Environment Variable Setup:**

   **macOS/Linux:**
   ```bash
   echo 'export FIGMA_API_KEY="your_figma_token_here"' >> ~/.bashrc
   source ~/.bashrc
   ```

   **Windows:**
   ```cmd
   setx FIGMA_API_KEY "your_figma_token_here"
   ```

5. **Restart Cursor IDE** to apply the configuration.

#### Verification for Cursor

1. Open a project in Cursor
2. Use the AI chat feature
3. Ask: "Analyze the layout structure of this Figma design: [Figma URL]"
4. The AI should be able to access and process the Figma file

### VS Code Integration

While VS Code doesn't natively support MCP, you can use it with compatible extensions.

#### Using Continue Extension

1. **Install the Continue extension** from the VS Code marketplace

2. **Configure Continue with MCP:**
   Create or edit `~/.continue/config.json`:
   ```json
   {
     "models": [...],
     "mcpServers": {
       "figma-context": {
         "command": "figma-context-mcp",
         "args": ["--figma-api-key=${FIGMA_API_KEY}", "--stdio"]
       }
     }
   }
   ```

3. **Set environment variable** as described in previous sections

4. **Restart VS Code** and the Continue extension

#### Using Codeium Extension

1. **Install Codeium extension**

2. **Configure MCP support** (if available in your Codeium version):
   ```json
   {
     "codeium.mcpServers": {
       "figma-context": {
         "command": "figma-mcp",
         "args": ["--figma-api-key=${FIGMA_API_KEY}", "--stdio"]
       }
     }
   }
   ```

### Other MCP-Compatible Tools

For other AI assistants that support the Model Context Protocol:

#### Generic Configuration Template

```json
{
  "mcpServers": {
    "figma-context": {
      "command": "figma-context-mcp",
      "args": ["--figma-api-key=YOUR_FIGMA_API_KEY", "--stdio"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

#### Command Options

Choose any of these three commands based on your preference:

1. **Standard command:**
   ```bash
   figma-developer-mcp --figma-api-key=YOUR_KEY --stdio
   ```

2. **Short alias:**
   ```bash
   figma-mcp --figma-api-key=YOUR_KEY --stdio
   ```

3. **Personal alias:**
   ```bash
   yujie-figma-mcp --figma-api-key=YOUR_KEY --stdio
   ```

#### Platform-Specific Considerations

- **Linux:** Use standard Unix paths and environment variables
- **macOS:** Ensure proper permissions for configuration directories
- **Windows:** Use Windows-style environment variable syntax (`%VAR%`)

### Development Environment Setup

For developers who want to contribute or customize the MCP server:

#### Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/tianmuji/Figma-Context-MCP.git
   cd Figma-Context-MCP
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build the project:**
   ```bash
   npm run build
   ```

4. **Configure for local development:**
   ```json
   {
     "mcpServers": {
       "figma-context-dev": {
         "command": "node",
         "args": [
           "/path/to/Figma-Context-MCP/dist/cli.js",
           "--figma-api-key=${FIGMA_API_KEY}",
           "--stdio"
         ],
         "env": {
           "NODE_ENV": "development"
         }
       }
     }
   }
   ```

5. **Run tests:**
   ```bash
   npm test
   ```

#### Development with Hot Reload

1. **Use nodemon for development:**
   ```bash
   npm install -g nodemon
   nodemon --watch src --exec "npm run build && node dist/cli.js --figma-api-key=$FIGMA_API_KEY --stdio"
   ```

2. **Configure MCP client for development:**
   ```json
   {
     "mcpServers": {
       "figma-context-dev": {
         "command": "nodemon",
         "args": [
           "--watch", "src",
           "--exec", "npm run build && node dist/cli.js --figma-api-key=${FIGMA_API_KEY} --stdio"
         ],
         "cwd": "/path/to/Figma-Context-MCP"
       }
     }
   }
   ```

### Environment Variable Configuration

For enhanced security, always use environment variables instead of hardcoding API tokens.

#### Setting Up Environment Variables

**macOS/Linux:**
```bash
# Add to ~/.bashrc, ~/.zshrc, or ~/.profile
export FIGMA_API_KEY="your_figma_token_here"

# Reload the shell configuration
source ~/.bashrc  # or ~/.zshrc
```

**Windows Command Prompt:**
```cmd
setx FIGMA_API_KEY "your_figma_token_here"
```

**Windows PowerShell:**
```powershell
[Environment]::SetEnvironmentVariable("FIGMA_API_KEY", "your_figma_token_here", "User")
```

#### Using Environment Variables in Configuration

**Standard syntax:**
```json
{
  "mcpServers": {
    "figma-context": {
      "command": "figma-context-mcp",
      "args": ["--figma-api-key=${FIGMA_API_KEY}", "--stdio"]
    }
  }
}
```

**With explicit environment section:**
```json
{
  "mcpServers": {
    "figma-context": {
      "command": "figma-context-mcp",
      "args": ["--figma-api-key=placeholder", "--stdio"],
      "env": {
        "FIGMA_API_KEY": "your_actual_token_here"
      }
    }
  }
}
```

### Docker Integration

For containerized deployments:

#### Dockerfile Example

```dockerfile
FROM node:18-alpine

# Install the MCP server globally
RUN npm install -g figma-context-mcp

# Set up environment
ENV FIGMA_API_KEY=""

# Expose the MCP server
EXPOSE 3000

# Start the MCP server
CMD ["figma-context-mcp", "--figma-api-key=${FIGMA_API_KEY}", "--stdio"]
```

#### Docker Compose Configuration

```yaml
version: '3.8'
services:
  figma-mcp:
    build: .
    environment:
      - FIGMA_API_KEY=${FIGMA_API_KEY}
    volumes:
      - ./config:/app/config
    restart: unless-stopped
```

#### Running with Docker

```bash
# Build the image
docker build -t figma-context-mcp .

# Run with environment variable
docker run -e FIGMA_API_KEY="your_token_here" figma-context-mcp

# Or with docker-compose
docker-compose up -d
```

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

### Integration Troubleshooting

This section covers common issues and solutions for each integration method.

#### Claude Desktop Issues

**Issue: "MCP server failed to start"**
```bash
# Check if the package is installed correctly
npm list -g figma-context-mcp

# Verify the command works manually
figma-context-mcp --figma-api-key=YOUR_TOKEN --stdio
```

**Issue: Configuration file not found**
```bash
# macOS - Create the directory if it doesn't exist
mkdir -p ~/Library/Application\ Support/Claude

# Windows - Check the exact path
echo %APPDATA%\Claude
```

**Issue: JSON syntax errors**
- Use a JSON validator to check your configuration
- Ensure all quotes are properly escaped
- Verify comma placement in JSON objects

**Solution: Test configuration manually**
```bash
# Test the MCP server directly
echo '{"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {"protocolVersion": "2024-11-05", "capabilities": {}, "clientInfo": {"name": "test", "version": "1.0.0"}}}' | figma-context-mcp --figma-api-key=YOUR_TOKEN --stdio
```

#### Cursor IDE Issues

**Issue: MCP server not recognized**
1. Ensure Cursor IDE supports MCP (check version requirements)
2. Verify the configuration is in the correct settings location
3. Restart Cursor completely (not just reload window)

**Issue: Environment variables not working**
```bash
# Verify environment variable is set
echo $FIGMA_API_KEY  # macOS/Linux
echo %FIGMA_API_KEY%  # Windows

# Test with explicit token first
"args": ["--figma-api-key=explicit_token_here", "--stdio"]
```

**Solution: Debug mode**
```json
{
  "mcpServers": {
    "figma-context": {
      "command": "figma-mcp",
      "args": ["--figma-api-key=${FIGMA_API_KEY}", "--stdio"],
      "env": {
        "NODE_ENV": "development",
        "DEBUG": "mcp:*"
      }
    }
  }
}
```

#### VS Code Integration Issues

**Issue: Extension not supporting MCP**
- Check if your VS Code extension version supports MCP
- Look for alternative extensions that support MCP protocol
- Consider using VS Code with external MCP clients

**Issue: Continue extension configuration**
```bash
# Check Continue configuration location
ls ~/.continue/config.json

# Verify Continue extension is active
code --list-extensions | grep continue
```

#### General MCP Issues

**Issue: "Invalid API token" errors**
```bash
# Test token manually with curl
curl -H "X-FIGMA-TOKEN: YOUR_TOKEN" https://api.figma.com/v1/me

# Check token permissions
curl -H "X-FIGMA-TOKEN: YOUR_TOKEN" https://api.figma.com/v1/files/FILE_ID
```

**Issue: "File not found" errors**
- Ensure the Figma file URL is correct
- Check if the file is public or you have access
- Verify the file ID in the URL is accurate

**Issue: Network connectivity problems**
```bash
# Test network connectivity
ping api.figma.com

# Check firewall settings
# Ensure ports 80 and 443 are open for outbound connections
```

**Issue: Permission denied errors**
```bash
# Check npm global installation permissions
npm config get prefix

# Fix npm permissions (macOS/Linux)
sudo chown -R $(whoami) $(npm config get prefix)/{lib/node_modules,bin,share}

# Alternative: use npx instead of global install
npx figma-context-mcp --figma-api-key=YOUR_TOKEN --stdio
```

#### Platform-Specific Issues

**macOS Issues:**
- **Gatekeeper blocking execution:** Right-click the terminal and select "Open" to bypass Gatekeeper
- **Path issues:** Ensure `/usr/local/bin` is in your PATH
- **Permission issues:** Use `sudo` carefully, prefer fixing npm permissions

**Windows Issues:**
- **PowerShell execution policy:**
  ```powershell
  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
  ```
- **Path issues:** Ensure npm global bin directory is in PATH
- **Environment variables:** Use System Properties to set permanent environment variables

**Linux Issues:**
- **Node.js version:** Ensure Node.js 16+ is installed
- **Global npm permissions:** Configure npm to use a different directory for global packages
- **Shell configuration:** Ensure environment variables are set in the correct shell profile

#### Debugging Steps

**1. Verify Installation:**
```bash
# Check if package is installed
npm list -g figma-context-mcp

# Check command availability
which figma-context-mcp  # macOS/Linux
where figma-context-mcp  # Windows
```

**2. Test Manual Execution:**
```bash
# Test each command variant
figma-developer-mcp --version
figma-mcp --version
yujie-figma-mcp --version
```

**3. Validate Configuration:**
```bash
# Use a JSON validator
cat your_config.json | python -m json.tool

# Or use online JSON validators
```

**4. Check Logs:**
- **Claude Desktop:** Check application logs in Console.app (macOS) or Event Viewer (Windows)
- **Cursor:** Check the developer console (Help → Toggle Developer Tools)
- **VS Code:** Check the Output panel and select the relevant extension

**5. Network Debugging:**
```bash
# Test Figma API connectivity
curl -v -H "X-FIGMA-TOKEN: YOUR_TOKEN" https://api.figma.com/v1/me

# Check DNS resolution
nslookup api.figma.com
```

#### Getting Help

**Before seeking help, gather this information:**
1. Operating system and version
2. Node.js version (`node --version`)
3. npm version (`npm --version`)
4. Package version (`npm list -g figma-context-mcp`)
5. AI assistant/client version
6. Complete error messages
7. Configuration file contents (with tokens redacted)

**Support Channels:**
- [GitHub Issues](https://github.com/tianmuji/Figma-Context-MCP/issues) - For bugs and feature requests
- [MCP Documentation](https://modelcontextprotocol.io/) - For MCP protocol questions
- [Figma API Documentation](https://www.figma.com/developers/api) - For Figma-specific issues

**Update and Maintenance:**
```bash
# Check for updates
npm outdated -g figma-context-mcp

# Update to latest version
npm update -g figma-context-mcp

# Clean reinstall if needed
npm uninstall -g figma-context-mcp
npm cache clean --force
npm install -g figma-context-mcp
```

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
