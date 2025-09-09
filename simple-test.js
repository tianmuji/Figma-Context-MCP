import { normalizeNodeId } from './src/utils/nodeid.js';

console.log('=== 简单测试 normalizeNodeId 函数 ===');

// 测试连字符格式的nodeId
const testNodeId = '17606-50778';
console.log(`输入: ${testNodeId}`);

const result = normalizeNodeId(testNodeId);
console.log('结果:', result);

if (result.wasConverted && result.normalizedId === '17606:50778') {
  console.log('✅ 测试通过！连字符格式正确转换为冒号格式');
} else {
  console.log('❌ 测试失败！');
}

console.log('=== 测试完成 ===');


