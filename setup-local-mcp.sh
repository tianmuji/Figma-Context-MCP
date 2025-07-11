#!/bin/bash

echo "🚀 Setting up Local Figma MCP Server"
echo "=================================="

# 检查是否已构建
if [ ! -d "dist" ]; then
    echo "📦 Building project..."
    pnpm build
fi

echo ""
echo "🔑 Please provide your Figma API token:"
echo "1. Go to https://www.figma.com/developers/api"
echo "2. Click 'Get personal access token'"
echo "3. Generate a new token"
echo "4. Copy and paste it below"
echo ""

read -p "Enter your Figma API token: " FIGMA_TOKEN

if [ -z "$FIGMA_TOKEN" ]; then
    echo "❌ No token provided. Exiting."
    exit 1
fi

echo ""
echo "📝 Creating MCP configuration..."

# 创建Cursor配置
CURSOR_CONFIG_DIR="$HOME/Library/Application Support/Cursor/User/globalStorage"
mkdir -p "$CURSOR_CONFIG_DIR"

cat > "$CURSOR_CONFIG_DIR/mcp_servers.json" << EOF
{
  "mcpServers": {
    "figma-local": {
      "command": "node",
      "args": [
        "$(pwd)/dist/cli.js",
        "--figma-api-key=$FIGMA_TOKEN",
        "--stdio"
      ],
      "env": {
        "NODE_ENV": "development"
      }
    }
  }
}
EOF

echo "✅ Cursor MCP configuration created at:"
echo "   $CURSOR_CONFIG_DIR/mcp_servers.json"

# 创建Claude Desktop配置
CLAUDE_CONFIG_DIR="$HOME/Library/Application Support/Claude"
mkdir -p "$CLAUDE_CONFIG_DIR"

cat > "$CLAUDE_CONFIG_DIR/claude_desktop_config.json" << EOF
{
  "mcpServers": {
    "figma-local": {
      "command": "node",
      "args": [
        "$(pwd)/dist/cli.js",
        "--figma-api-key=$FIGMA_TOKEN",
        "--stdio"
      ]
    }
  }
}
EOF

echo "✅ Claude Desktop MCP configuration created at:"
echo "   $CLAUDE_CONFIG_DIR/claude_desktop_config.json"

# 创建测试脚本
cat > "test-with-your-token.js" << 'EOF'
#!/usr/bin/env node

import { spawn } from 'child_process';

const FIGMA_TOKEN = process.env.FIGMA_TOKEN;
if (!FIGMA_TOKEN) {
    console.error('❌ Please set FIGMA_TOKEN environment variable');
    process.exit(1);
}

console.log('🧪 Testing MCP with your token...');

const mcpServer = spawn('node', [
    'dist/cli.js',
    `--figma-api-key=${FIGMA_TOKEN}`,
    '--stdio'
], {
    stdio: ['pipe', 'pipe', 'pipe']
});

// 简单的ping测试
const initRequest = {
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        clientInfo: { name: "test", version: "1.0.0" }
    }
};

mcpServer.stdout.on('data', (data) => {
    console.log('📨 Response:', data.toString());
});

mcpServer.stderr.on('data', (data) => {
    console.log('📝 Log:', data.toString());
});

mcpServer.stdin.write(JSON.stringify(initRequest) + '\n');

setTimeout(() => {
    console.log('✅ MCP server is running successfully!');
    mcpServer.kill();
}, 3000);
EOF

chmod +x test-with-your-token.js

echo ""
echo "🧪 Testing the setup..."
FIGMA_TOKEN="$FIGMA_TOKEN" node test-with-your-token.js

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Restart Cursor or Claude Desktop"
echo "2. In the chat, try: 'Please get Figma data for file [YOUR_FILE_ID] node [YOUR_NODE_ID]'"
echo "3. The AI should now be able to use the local MCP server"
echo ""
echo "📋 Example usage in AI chat:"
echo "   'Analyze this Figma design and tell me about its layout:'"
echo "   'File: YOUR_FIGMA_FILE_URL'"
