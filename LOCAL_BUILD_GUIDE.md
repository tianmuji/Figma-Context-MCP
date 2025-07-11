# 本地构建和MCP调试指南

## 🏗️ 构建步骤

### 1. 安装依赖
```bash
cd Figma-Context-MCP
pnpm install
```

### 2. 构建项目
```bash
pnpm build
```

### 3. 验证构建
```bash
# 运行测试
pnpm test src/tests/position-info.test.ts src/tests/benchmark.test.ts

# 检查构建产物
ls -la dist/
```

## 🔧 本地MCP配置

### 1. 获取Figma API Token
1. 访问 https://www.figma.com/developers/api
2. 生成Personal Access Token
3. 保存token备用

### 2. 配置MCP客户端

#### 对于Cursor (推荐)
在 `~/.cursor/mcp_servers.json` 中添加：

```json
{
  "mcpServers": {
    "Figma MCP (Local)": {
      "command": "node",
      "args": [
        "/path/to/your/Figma-Context-MCP/dist/cli.js",
        "--figma-api-key=YOUR_FIGMA_API_KEY",
        "--stdio"
      ],
      "env": {
        "NODE_ENV": "development"
      }
    }
  }
}
```

#### 对于其他MCP客户端
```json
{
  "mcpServers": {
    "figma-local": {
      "command": "node",
      "args": [
        "/absolute/path/to/Figma-Context-MCP/dist/cli.js",
        "--figma-api-key=YOUR_API_KEY",
        "--stdio"
      ]
    }
  }
}
```

### 3. 环境变量方式 (可选)
创建 `.env` 文件：
```bash
FIGMA_API_KEY=your_figma_api_key_here
OUTPUT_FORMAT=yaml
```

然后简化配置：
```json
{
  "mcpServers": {
    "figma-local": {
      "command": "node",
      "args": ["/path/to/dist/cli.js", "--stdio"],
      "env": {
        "FIGMA_API_KEY": "your_api_key"
      }
    }
  }
}
```

## 🧪 测试新功能

### 1. 准备测试数据
找一个包含以下元素的Figma文件：
- 使用AutoLayout的Frame
- 不使用AutoLayout的Frame (手动摆放的元素)
- 混合场景

### 2. 获取文件信息
从Figma URL中提取：
- File Key: `figma.com/file/{FILE_KEY}/...`
- Node ID: URL参数 `node-id={NODE_ID}`

### 3. 测试命令示例

#### 测试AutoLayout场景 (应该不包含boundingBox)
```bash
# 在MCP客户端中执行
get_figma_data fileKey="YOUR_FILE_KEY" nodeId="AUTOLAYOUT_NODE_ID"
```

#### 测试非AutoLayout场景 (应该包含boundingBox)
```bash
get_figma_data fileKey="YOUR_FILE_KEY" nodeId="NON_AUTOLAYOUT_NODE_ID"
```

### 4. 验证输出

#### AutoLayout输出示例：
```yaml
nodes:
  - id: "frame-1"
    name: "AutoLayout Frame"
    type: "FRAME"
    layout: "layout_HORIZONTAL_12PX"
    # 注意：没有boundingBox字段
    children:
      - id: "child-1"
        name: "Child Element"
        type: "RECTANGLE"
        # 注意：子元素也没有boundingBox
```

#### 非AutoLayout输出示例：
```yaml
nodes:
  - id: "frame-1"
    name: "Manual Layout Frame"
    type: "FRAME"
    boundingBox:  # 包含位置信息
      x: 0
      y: 0
      width: 300
      height: 200
    children:
      - id: "child-1"
        name: "Child Element"
        type: "RECTANGLE"
        boundingBox:  # 相对位置
          x: 50
          y: 30
          width: 100
          height: 50
```

## 🐛 调试技巧

### 1. 启用详细日志
```bash
NODE_ENV=development node dist/cli.js --figma-api-key=YOUR_KEY --stdio
```

### 2. 检查原始Figma数据
使用curl直接调用Figma API：
```bash
curl -H 'X-FIGMA-TOKEN: YOUR_API_KEY' \
  'https://api.figma.com/v1/files/FILE_KEY/nodes?ids=NODE_ID'
```

### 3. 对比输出
- 检查原始API中的 `layoutMode` 字段
- 验证 `absoluteBoundingBox` 是否存在
- 确认我们的逻辑是否正确应用

### 4. 常见问题排查

#### 问题：所有元素都有boundingBox
- 检查：元素是否真的在AutoLayout中
- 验证：父元素的 `layoutMode` 是否为 "HORIZONTAL" 或 "VERTICAL"

#### 问题：应该有boundingBox但没有
- 检查：元素是否有 `absoluteBoundingBox` 数据
- 验证：是否为根节点或绝对定位

#### 问题：相对位置计算错误
- 检查：根元素的边界是否正确传递
- 验证：计算公式 `child.x - root.x`

## 🎯 AI测试建议

在MCP客户端中测试AI的布局推断能力：

```
请分析这个Figma设计的布局，并生成相应的CSS代码：
[粘贴Figma链接]

特别关注：
1. 元素的对齐方式
2. 元素间的间距
3. 推荐的Flexbox布局
```

AI现在应该能够：
- 识别水平/垂直对齐
- 计算精确的间距
- 生成合适的Flexbox代码
- 处理复杂的嵌套布局

## 📝 提交PR

完成测试后，提交你的更改：

```bash
git add .
git commit -m "feat: implement smart position information for layout inference

- Add intelligent boundingBox inclusion based on AutoLayout usage
- Implement relative position calculation for non-AutoLayout elements  
- Add comprehensive test suite with 8 test cases
- Enable AI layout inference for absolute-positioned designs
- Optimize data payload size for AutoLayout scenarios"

git push origin feature/smart-position-info
```

然后在GitHub上创建Pull Request！
