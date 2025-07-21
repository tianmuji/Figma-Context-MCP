#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 启动本地MCP服务器
const mcpServer = spawn('node', [
  join(__dirname, 'dist/cli.js'),
  '--figma-api-key=YOUR_FIGMA_API_TOKEN_HERE',
  '--stdio'
], {
  stdio: ['pipe', 'pipe', 'pipe']
});

// 发送MCP请求
function sendMCPRequest(request) {
  return new Promise((resolve, reject) => {
    let response = '';
    
    const timeout = setTimeout(() => {
      reject(new Error('Request timeout'));
    }, 30000);

    mcpServer.stdout.on('data', (data) => {
      response += data.toString();
      
      // 检查是否收到完整响应
      try {
        const lines = response.split('\n').filter(line => line.trim());
        if (lines.length > 0) {
          const lastLine = lines[lines.length - 1];
          const parsed = JSON.parse(lastLine);
          if (parsed.id === request.id) {
            clearTimeout(timeout);
            resolve(parsed);
          }
        }
      } catch (e) {
        // 继续等待更多数据
      }
    });

    mcpServer.stderr.on('data', (data) => {
      console.error('MCP Server Error:', data.toString());
    });

    // 发送请求
    mcpServer.stdin.write(JSON.stringify(request) + '\n');
  });
}

async function testMCP() {
  console.log('🚀 Testing Local MCP Server...\n');

  try {
    // 1. 初始化请求
    console.log('1. Initializing MCP connection...');
    const initRequest = {
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: {
          tools: {}
        },
        clientInfo: {
          name: "test-client",
          version: "1.0.0"
        }
      }
    };

    const initResponse = await sendMCPRequest(initRequest);
    console.log('✅ Initialization successful');

    // 2. 获取工具列表
    console.log('\n2. Getting available tools...');
    const toolsRequest = {
      jsonrpc: "2.0",
      id: 2,
      method: "tools/list",
      params: {}
    };

    const toolsResponse = await sendMCPRequest(toolsRequest);
    console.log('✅ Available tools:', toolsResponse.result.tools.map(t => t.name));

    // 3. 测试get_figma_data工具
    console.log('\n3. Testing get_figma_data tool...');
    const figmaRequest = {
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: {
        name: "get_figma_data",
        arguments: {
          fileKey: "hdyf6u2eqRkmXY0I7d9S98",
          nodeId: "2836-1477"
        }
      }
    };

    const figmaResponse = await sendMCPRequest(figmaRequest);
    console.log('✅ Figma data retrieved successfully');
    
    // 分析响应中的位置信息
    const content = figmaResponse.result.content[0].text;
    const hasBoundingBox = content.includes('boundingBox:');
    const hasAutoLayout = content.includes('layout_');
    
    console.log('\n📊 Analysis Results:');
    console.log(`- Contains boundingBox: ${hasBoundingBox}`);
    console.log(`- Contains layout references: ${hasAutoLayout}`);
    console.log(`- Response size: ${content.length} characters`);

    // 显示部分响应内容
    console.log('\n📝 Sample Response (first 500 chars):');
    console.log(content.substring(0, 500) + '...');

    // 4. 测试带savePath的get_figma_data工具
    console.log('\n4. Testing get_figma_data tool with savePath...');
    const figmaWithSaveRequest = {
      jsonrpc: "2.0",
      id: 4,
      method: "tools/call",
      params: {
        name: "get_figma_data",
        arguments: {
          fileKey: "hdyf6u2eqRkmXY0I7d9S98",
          nodeId: "2836-1477",
          savePath: "./test-output"
        }
      }
    };

    const figmaWithSaveResponse = await sendMCPRequest(figmaWithSaveRequest);
    console.log('✅ Figma data with save retrieved successfully');

    const saveContent = figmaWithSaveResponse.result.content[0].text;
    const hasSaveInfo = saveContent.includes('--- FILE SAVED ---');
    const hasFilePath = saveContent.includes('Data saved to:');

    console.log('\n💾 Save Results:');
    console.log(`- Contains save confirmation: ${hasSaveInfo}`);
    console.log(`- Contains file path: ${hasFilePath}`);

    if (hasSaveInfo) {
      const saveLines = saveContent.split('\n');
      const saveInfoLine = saveLines.find(line => line.includes('Data saved to:'));
      if (saveInfoLine) {
        console.log(`- ${saveInfoLine}`);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    mcpServer.kill();
    console.log('\n🏁 Test completed');
  }
}

testMCP();
