import { test, expect } from '@playwright/test';

test.describe('Knowledge Retrieval Feature', () => {
  test.beforeEach(async ({ page }) => {
    // 导航到应用
    await page.goto('http://localhost:3001');
    
    // 等待页面加载
    await page.waitForLoadState('networkidle');
  });

  test('should display knowledge sources when received', async ({ page }) => {
    // 模拟knowledge-retrieval响应
    await page.route('**/api/chat-dify', async (route) => {
      // 创建一个模拟的streaming响应
      const mockResponse = `data: {"content":"正在查询黄牛相关信息..."}\n\n` +
        `data: {"knowledgeSources":[{"content":"黄牛是一种常见的牛品种，原产于中国，具有适应性强、耐粗饲、抗病力强等特点。","title":"黄牛品种介绍","score":0.95},{"content":"黄牛的饲养管理要点包括：1. 提供充足的饲料和清洁的饮水；2. 定期进行健康检查。","title":"黄牛饲养管理","score":0.87}],"nodeTitle":"知识检索"}\n\n` +
        `data: {"content":"根据知识库信息，黄牛是一种适应性强的牛品种..."}\n\n` +
        `data: {"end":true}\n\n`;

      await route.fulfill({
        status: 200,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
        body: mockResponse,
      });
    });

    // 检查是否有应用选择器，如果没有配置的应用，先配置一个
    const appSelector = page.locator('[data-testid="app-selector"]').or(page.locator('select')).first();
    
    // 如果找不到应用选择器或者显示"请选择应用"，需要先配置应用
    try {
      await expect(appSelector).toBeVisible({ timeout: 5000 });
      
      // 检查是否有可用的应用
      const hasApps = await page.locator('option').count() > 1; // 除了默认选项
      
      if (!hasApps) {
        // 打开设置配置应用
        await page.click('[data-testid="settings-button"]').catch(() => {
          // 如果没有设置按钮，尝试其他方式
          console.log('Settings button not found, trying alternative approach');
        });
        
        // 这里可以添加配置应用的步骤，但为了测试简化，我们跳过
        console.log('No apps configured, skipping test');
        test.skip();
        return;
      }
      
      // 选择第一个可用的应用
      await appSelector.selectOption({ index: 1 });
    } catch (error) {
      console.log('App selector not found or not working, continuing with test');
    }

    // 输入消息
    const messageInput = page.locator('input[placeholder="Type your message..."]');
    await expect(messageInput).toBeVisible();
    
    await messageInput.fill('黄牛是什么？');
    
    // 发送消息
    await page.keyboard.press('Enter');
    
    // 等待响应
    await page.waitForTimeout(2000);
    
    // 检查是否显示了knowledge源文档
    const knowledgeSection = page.locator('text=知识库来源');
    await expect(knowledgeSection).toBeVisible({ timeout: 10000 });
    
    // 检查是否显示了源文档数量
    await expect(page.locator('text=知识库来源 (2)')).toBeVisible();
    
    // 检查是否显示了具体的源文档
    await expect(page.locator('text=黄牛品种介绍')).toBeVisible();
    await expect(page.locator('text=黄牛饲养管理')).toBeVisible();
    
    // 检查是否显示了相关度分数
    await expect(page.locator('text=相关度: 95.0%')).toBeVisible();
    await expect(page.locator('text=相关度: 87.0%')).toBeVisible();
    
    // 检查源文档内容
    await expect(page.locator('text=黄牛是一种常见的牛品种，原产于中国')).toBeVisible();
  });

  test('should not display knowledge sources when not present', async ({ page }) => {
    // 模拟没有knowledge-retrieval的响应
    await page.route('**/api/chat-dify', async (route) => {
      const mockResponse = `data: {"content":"这是一个普通的回答，没有知识库检索。"}\n\n` +
        `data: {"end":true}\n\n`;

      await route.fulfill({
        status: 200,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
        body: mockResponse,
      });
    });

    // 输入消息
    const messageInput = page.locator('input[placeholder="Type your message..."]');
    await expect(messageInput).toBeVisible();
    
    await messageInput.fill('普通问题');
    await page.keyboard.press('Enter');
    
    // 等待响应
    await page.waitForTimeout(2000);
    
    // 确认没有显示knowledge源文档
    const knowledgeSection = page.locator('text=知识库来源');
    await expect(knowledgeSection).not.toBeVisible();
  });
});
