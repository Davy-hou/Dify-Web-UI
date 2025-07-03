// 测试knowledge-retrieval功能的API端点

export async function POST(req: Request) {
  console.log('Test knowledge API called');

  try {
    const { query } = await req.json();
    
    // 设置流式响应头
    const headers = {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    };

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // 发送初始消息
          controller.enqueue(`data: ${JSON.stringify({
            content: `正在查询"${query}"相关信息...`,
            isMarkdown: true
          })}\n\n`);

          // 等待一下模拟处理时间
          await new Promise(resolve => setTimeout(resolve, 1000));

          // 发送knowledge源文档
          const knowledgeSources = [
            {
              content: `${query}是一种常见的概念，具有重要的意义和应用价值。它在多个领域都有广泛的应用，是研究和实践中的重要组成部分。`,
              title: `${query}基础介绍`,
              url: 'https://example.com/basic-intro',
              score: 0.95
            },
            {
              content: `关于${query}的详细分析表明，它具有多个重要特征：1. 具有独特的属性；2. 在实际应用中表现出色；3. 具有良好的发展前景。`,
              title: `${query}详细分析`,
              url: 'https://example.com/detailed-analysis',
              score: 0.87
            },
            {
              content: `${query}的应用案例显示了其在不同场景下的价值。通过实际案例可以看出，它能够有效解决相关问题，提供可靠的解决方案。`,
              title: `${query}应用案例`,
              url: 'https://example.com/use-cases',
              score: 0.82
            }
          ];

          controller.enqueue(`data: ${JSON.stringify({
            knowledgeSources: knowledgeSources,
            nodeTitle: '知识检索'
          })}\n\n`);

          // 等待一下
          await new Promise(resolve => setTimeout(resolve, 500));

          // 发送最终回答
          controller.enqueue(`data: ${JSON.stringify({
            content: `\n\n根据知识库检索结果，${query}是一个重要的概念。从检索到的文档可以看出，它具有以下特点：\n\n1. **基础特征**：具有独特的属性和重要意义\n2. **应用价值**：在多个领域都有广泛应用\n3. **发展前景**：具有良好的发展潜力\n\n以上信息来源于知识库中的相关文档，为您提供了全面的参考。`,
            isMarkdown: true
          })}\n\n`);

          // 结束流
          controller.enqueue(`data: ${JSON.stringify({
            end: true,
            metadata: { test: true }
          })}\n\n`);

          controller.close();
        } catch (error) {
          console.error('Test stream error:', error);
          controller.error(error);
        }
      }
    });

    return new Response(stream, { headers });
  } catch (error) {
    console.error('Test API error:', error);
    return new Response(JSON.stringify({ error: 'Test API error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
