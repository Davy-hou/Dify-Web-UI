// Note: DIFY_API_KEY check moved to inside the POST function to allow app-specific tokens

const handleError = (error: unknown) => {
  console.error('Error in chat API:', error);
  let errorMessage = 'An error occurred while processing your request.';
  if (error instanceof Error) {
    console.error('Error stack:', error.stack);
    errorMessage = error.message;
  }
  return new Response(JSON.stringify({ error: errorMessage }), {
    status: 500,
    headers: { 'Content-Type': 'application/json' },
  });
};

export async function POST(req: Request) {
  console.log('Dify API route called');

  try {
    if (!req.body) {
      throw new Error('Request body is empty');
    }
    const { messages, appToken, appProvider } = await req.json();

    console.log('Request payload:', {
      messagesCount: messages?.length,
      hasAppToken: !!appToken,
      appProvider,
      lastMessage: messages?.[messages?.length - 1]?.content?.substring(0, 50) + '...'
    });

    if (!Array.isArray(messages) || messages.length === 0) {
      throw new Error('Invalid or empty messages array');
    }

    const lastMessage = messages[messages.length - 1];

    // Use app-specific token if provided, otherwise use environment variable
    const apiKey = appToken || process.env.DIFY_API_KEY;

    // Get Dify host from environment variable with default fallback
    const difyHost = process.env.DIFY_HOST || 'https://api.dify.ai/v1';

    console.log('Using API key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'none');
    console.log('Using Dify host:', difyHost);

    if (!apiKey) {
      throw new Error('No API key available');
    }

    const response = await fetch(`${difyHost}/chat-messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: {},
        query: lastMessage.content,
        response_mode: "streaming",
        conversation_id: '',
        user: 'default-user'
      })
    });

    if (!response.ok) {
      throw new Error(`Dify API error: ${response.status}`);
    }

    // 设置流式响应头
    const headers = {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    };

    let buffer = ''; // 用于存储不完整的数据

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('Response body is null');
        }
        const decoder = new TextDecoder();

        try {
          while (true) {
            const result = await reader.read();

            if (result.done) {
              // 处理最后可能剩余的数据
              if (buffer.trim()) {
                try {
                  const data = JSON.parse(buffer.trim().slice(5));
                  handleStreamData(data, controller);
                } catch (e) {
                  console.error('Error parsing final buffer:', e);
                }
              }
              controller.close();
              break;
            }

            const chunk = decoder.decode(result.value);
            buffer += chunk;

            // 寻找完整的数据行
            let newlineIndex;
            while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
              const line = buffer.slice(0, newlineIndex).trim();
              buffer = buffer.slice(newlineIndex + 1);

              if (line.startsWith('data: ')) {
                try {
                  const jsonStr = line.slice(5);
                  // 检查JSON字符串是否完整
                  if (isValidJSON(jsonStr)) {
                    const data = JSON.parse(jsonStr);
                    console.log('Received messages:', data);
                    handleStreamData(data, controller);
                  }
                } catch (e) {
                  // 如果解析失败，将该行添加回buffer
                  if (line.length > 0) {
                    buffer = line + '\n' + buffer;
                  }
                }
              }
            }
          }
        } catch (error) {
          console.error('Stream processing error:', error);
          controller.error(error);
        }
      }
    });

    return new Response(stream, { headers });
  } catch (error) {
    return handleError(error);
  }
}

// 检查JSON字符串是否有效
function isValidJSON(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

// 处理流数据
function handleStreamData(data: any, controller: ReadableStreamDefaultController) {
  if (data.event === 'message') {
    // 根据 Dify 文档，answer 字段已经是增量内容（text chunk content）
    const chunkContent = data.answer || '';

    // 直接发送增量内容
    if (chunkContent) {
      controller.enqueue(`data: ${JSON.stringify({
        content: chunkContent,
        isMarkdown: true
      })}\n\n`);
    }
  } else if (data.event === 'error') {
    controller.enqueue(`data: ${JSON.stringify({
      error: data.message
    })}\n\n`);
  } else if (data.event === 'message_end') {
    controller.enqueue(`data: ${JSON.stringify({
      end: true,
      metadata: data.metadata
    })}\n\n`);
  } else if (data.event === 'node_finished') {
    // 处理knowledge-retrieval节点完成事件
    if (data.data && data.data.node_type === 'knowledge-retrieval') {
      const knowledgeSources = data.data.outputs?.result || [];

      // 发送knowledge源文档信息
      if (knowledgeSources.length > 0) {
        controller.enqueue(`data: ${JSON.stringify({
          knowledgeSources: knowledgeSources,
          nodeTitle: data.data.title || '知识检索'
        })}\n\n`);
      }
    }
  }
}