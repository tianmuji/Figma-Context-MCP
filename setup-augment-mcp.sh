#!/bin/bash

echo "🚀 Setting up Figma MCP for Augment in VSCode"
echo "=============================================="

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

PROJECT_PATH=$(pwd)

echo ""
echo "📝 Creating Augment MCP configurations..."

# 方法1: VSCode用户设置目录
VSCODE_USER_DIR="$HOME/Library/Application Support/Code/User"
if [ -d "$VSCODE_USER_DIR" ]; then
    echo "✅ Found VSCode user directory: $VSCODE_USER_DIR"
    
    # 创建或更新settings.json
    SETTINGS_FILE="$VSCODE_USER_DIR/settings.json"
    
    if [ -f "$SETTINGS_FILE" ]; then
        echo "📝 Updating existing settings.json..."
        # 备份原文件
        cp "$SETTINGS_FILE" "$SETTINGS_FILE.backup.$(date +%Y%m%d_%H%M%S)"
        
        # 使用jq添加配置（如果有jq的话）
        if command -v jq &> /dev/null; then
            jq --arg token "$FIGMA_TOKEN" --arg path "$PROJECT_PATH" \
               '.["augment.mcp.servers"]["figma-local"] = {
                  "command": "node",
                  "args": [($path + "/dist/cli.js"), ("--figma-api-key=" + $token), "--stdio"],
                  "env": {"NODE_ENV": "development"}
                }' "$SETTINGS_FILE" > "$SETTINGS_FILE.tmp" && mv "$SETTINGS_FILE.tmp" "$SETTINGS_FILE"
        else
            echo "⚠️  jq not found. Please manually add the configuration to settings.json"
        fi
    else
        echo "📝 Creating new settings.json..."
        cat > "$SETTINGS_FILE" << EOF
{
  "augment.mcp.servers": {
    "figma-local": {
      "command": "node",
      "args": [
        "$PROJECT_PATH/dist/cli.js",
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
    fi
fi

# 方法2: 创建独立的MCP配置文件
MCP_CONFIG_FILE="$HOME/.vscode/augment_mcp_config.json"
mkdir -p "$(dirname "$MCP_CONFIG_FILE")"

cat > "$MCP_CONFIG_FILE" << EOF
{
  "mcpServers": {
    "figma-local": {
      "command": "node",
      "args": [
        "$PROJECT_PATH/dist/cli.js",
        "--figma-api-key=$FIGMA_TOKEN",
        "--stdio"
      ],
      "env": {
        "NODE_ENV": "development"
      },
      "description": "Local Figma MCP Server with Smart Position Info"
    }
  }
}
EOF

echo "✅ Created MCP config file: $MCP_CONFIG_FILE"

# 方法3: 工作区配置
WORKSPACE_CONFIG=".vscode/settings.json"
mkdir -p .vscode

if [ -f "$WORKSPACE_CONFIG" ]; then
    echo "📝 Updating workspace settings..."
    cp "$WORKSPACE_CONFIG" "$WORKSPACE_CONFIG.backup.$(date +%Y%m%d_%H%M%S)"
else
    echo "📝 Creating workspace settings..."
fi

cat > "$WORKSPACE_CONFIG" << EOF
{
  "augment.mcp.servers": {
    "figma-local": {
      "command": "node",
      "args": [
        "\${workspaceFolder}/dist/cli.js",
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

echo "✅ Created workspace config: $WORKSPACE_CONFIG"

# 创建测试脚本
cat > "test-augment-mcp.js" << 'EOF'
#!/usr/bin/env node

// 简单测试脚本验证MCP服务器可以启动
import { spawn } from 'child_process';

const FIGMA_TOKEN = process.argv[2];
if (!FIGMA_TOKEN) {
    console.error('❌ Usage: node test-augment-mcp.js YOUR_FIGMA_TOKEN');
    process.exit(1);
}

console.log('🧪 Testing Augment MCP setup...');

const mcpServer = spawn('node', [
    'dist/cli.js',
    `--figma-api-key=${FIGMA_TOKEN}`,
    '--stdio'
], {
    stdio: ['pipe', 'pipe', 'pipe']
});

let hasResponse = false;

mcpServer.stdout.on('data', (data) => {
    hasResponse = true;
    console.log('✅ MCP server responded successfully');
    console.log('📨 Response preview:', data.toString().substring(0, 100) + '...');
});

mcpServer.stderr.on('data', (data) => {
    console.log('📝 Server log:', data.toString().trim());
});

mcpServer.on('error', (error) => {
    console.error('❌ Failed to start MCP server:', error.message);
});

// 发送初始化请求
const initRequest = {
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        clientInfo: { name: "augment-test", version: "1.0.0" }
    }
};

setTimeout(() => {
    mcpServer.stdin.write(JSON.stringify(initRequest) + '\n');
}, 1000);

setTimeout(() => {
    if (hasResponse) {
        console.log('🎉 MCP server is working correctly!');
    } else {
        console.log('⚠️  No response received. Check configuration.');
    }
    mcpServer.kill();
}, 5000);
EOF

chmod +x test-augment-mcp.js

echo ""
echo "🧪 Testing the setup..."
node test-augment-mcp.js "$FIGMA_TOKEN"

echo ""
echo "🎉 Augment MCP setup complete!"
echo ""
echo "📋 Configuration files created:"
echo "   - VSCode settings: $VSCODE_USER_DIR/settings.json"
echo "   - MCP config: $MCP_CONFIG_FILE"
echo "   - Workspace config: $WORKSPACE_CONFIG"
echo ""
echo "🔄 Next steps:"
echo "1. Restart VSCode"
echo "2. Open this project in VSCode"
echo "3. Open Augment chat panel"
echo "4. Try asking: 'Please test the figma-local MCP server'"
echo ""
echo "💡 Example usage:"
echo "   'Analyze this Figma design: [paste Figma URL]'"
echo "   'Get layout information for Figma file [FILE_ID] node [NODE_ID]'"
