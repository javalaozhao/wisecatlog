// background.js

console.log('后台服务脚本已启动');

// 监听安装事件
chrome.runtime.onInstalled.addListener(() => {
  console.log('插件已安装');
  // 在这里可以进行一些初始化设置，例如设置默认值
  chrome.storage.sync.set({ 
    theme: 'light',
    aiProvider: 'openai',
    maxLevel: 3
  });
});

// 监听来自内容脚本或弹出窗口的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('收到消息:', request);

  if (request.action === "getSettings") {
    chrome.storage.sync.get(['theme', 'aiProvider'], (settings) => {
      sendResponse(settings);
    });
    return true; // 保持消息通道开放以进行异步响应
  }
});
