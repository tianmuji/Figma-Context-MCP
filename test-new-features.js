#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 从命令行参数获取 API 密钥
const apiKey = process.argv[2];
if (!apiKey) {
  console.error('❌ Please provide Figma API key as argument:');
  console.error('   node test-new-features.js YOUR_FIGMA_API_KEY');
  process.exit(1);
}

console.log('🚀 Testing New Features (strokeAlign, clipsContent, enhanced debugging)...\n');

// 启动本地MCP服务器
const mcpServer = spawn('node', [
  join(__dirname, 'dist/cli.js'),
  `--figma-api-key=${apiKey}`,
  '--stdio'
], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let requestId = 1;

// 发送MCP请求
function sendMCPRequest(request) {
  return new Promise((resolve, reject) => {
    let response = '';
    
    const timeout = setTimeout(() => {
      reject(new Error('Request timeout'));
    }, 30000);

    const dataHandler = (data) => {
      response += data.toString();
      
      // 检查是否收到完整响应
      try {
        const lines = response.split('\n').filter(line => line.trim());
        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            if (parsed.id === request.id) {
              clearTimeout(timeout);
              mcpServer.stdout.removeListener('data', dataHandler);
              resolve(parsed);
              return;
            }
          } catch (e) {
            // 继续处理下一行
          }
        }
      } catch (e) {
        // 继续等待更多数据
      }
    };

    mcpServer.stdout.on('data', dataHandler);

    mcpServer.stderr.on('data', (data) => {
      console.error('MCP Server Error:', data.toString());
    });

    // 发送请求
    mcpServer.stdin.write(JSON.stringify(request) + '\n');
  });
}

async function testNewFeatures() {
  try {
    // 1. 初始化
    console.log('1. Initializing MCP connection...');
    const initResponse = await sendMCPRequest({
      jsonrpc: "2.0",
      id: requestId++,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        clientInfo: { name: "test-client", version: "1.0.0" }
      }
    });
    console.log('✅ Initialization successful\n');

    // 2. 测试 strokeAlign 和 clipsContent 处理
    console.log('2. Testing strokeAlign and clipsContent processing...');
    const figmaResponse = await sendMCPRequest({
      jsonrpc: "2.0",
      id: requestId++,
      method: "tools/call",
      params: {
        name: "get_figma_data",
        arguments: {
          fileKey: "hdyf6u2eqRkmXY0I7d9S98",
          nodeId: "2836-1478"
        }
      }
    });

    if (figmaResponse.result && figmaResponse.result.content) {
      const content = figmaResponse.result.content[0].text;
      
      // 检查是否包含我们新添加的属性
      const hasStrokeAlign = content.includes('strokeAlign:');
      const hasClipsContent = content.includes('clipsContent:');
      
      console.log('📊 New Properties Analysis:');
      console.log(`- Contains strokeAlign: ${hasStrokeAlign}`);
      console.log(`- Contains clipsContent: ${hasClipsContent}`);
      
      // 查找具体的 stroke 样式
      const strokeMatches = content.match(/stroke_[A-Z0-9]+:/g);
      if (strokeMatches) {
        console.log(`- Found ${strokeMatches.length} stroke styles: ${strokeMatches.join(', ')}`);
      }
      
      // 查找具体的 layout 样式
      const layoutMatches = content.match(/layout_[A-Z0-9]+:/g);
      if (layoutMatches) {
        console.log(`- Found ${layoutMatches.length} layout styles: ${layoutMatches.join(', ')}`);
      }
      
      console.log('✅ Data processing test completed\n');
    }

    // 3. 测试增强的图片下载调试
    console.log('3. Testing enhanced image download debugging...');
    
    // 测试正常下载
    console.log('3a. Testing successful download...');
    const downloadResponse = await sendMCPRequest({
      jsonrpc: "2.0",
      id: requestId++,
      method: "tools/call",
      params: {
        name: "download_figma_images",
        arguments: {
          fileKey: "hdyf6u2eqRkmXY0I7d9S98",
          nodes: [
            { nodeId: "2827:8496", fileName: "test-square1.png" },
            { nodeId: "2827:8497", fileName: "test-square2.svg" }
          ],
          localPath: "/tmp/figma-test-new"
        }
      }
    });

    if (downloadResponse.result && downloadResponse.result.content) {
      const downloadContent = downloadResponse.result.content[0].text;
      console.log('📥 Download Result:');
      console.log(downloadContent);
      
      const hasDebugInfo = downloadContent.includes('Debug Information:');
      const hasBreakdown = downloadContent.includes('Breakdown:');
      
      console.log(`- Contains debug info: ${hasDebugInfo}`);
      console.log(`- Contains breakdown: ${hasBreakdown}`);
      console.log('✅ Successful download test completed\n');
    }

    // 测试可能失败的下载（触发调试信息）
    console.log('3b. Testing download with potential failures...');
    const failureResponse = await sendMCPRequest({
      jsonrpc: "2.0",
      id: requestId++,
      method: "tools/call",
      params: {
        name: "download_figma_images",
        arguments: {
          fileKey: "hdyf6u2eqRkmXY0I7d9S98",
          nodes: [
            { nodeId: "2827:8496", fileName: "test1.png", imageRef: "invalid-ref" },
            { nodeId: "nonexistent-node", fileName: "test2.png" }
          ],
          localPath: "/tmp/figma-test-debug"
        }
      }
    });

    if (failureResponse.result && failureResponse.result.content) {
      const failureContent = failureResponse.result.content[0].text;
      console.log('🐛 Debug Test Result:');
      console.log(failureContent);
      
      const hasDetailedDebug = failureContent.includes('Debug Information:');
      const hasFailureReasons = failureContent.includes('Failed download reasons:');
      
      console.log(`- Contains detailed debug info: ${hasDetailedDebug}`);
      console.log(`- Contains failure reasons: ${hasFailureReasons}`);
      console.log('✅ Debug test completed\n');
    }

    console.log('🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
  } finally {
    mcpServer.kill();
    console.log('\n🏁 Test session ended');
  }
}

testNewFeatures();