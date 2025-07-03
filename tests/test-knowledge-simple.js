// 简单测试knowledge-retrieval功能
async function testKnowledgeRetrieval() {
  try {
    console.log('Testing knowledge retrieval...');
    
    const response = await fetch('http://localhost:3001/api/test-knowledge', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: '黄牛' })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let hasKnowledgeSources = false;
    
    console.log('Reading stream...');
    
    while (true) {
      const result = await reader.read();
      if (result.done) break;
      
      const chunk = decoder.decode(result.value);
      buffer += chunk;
      
      const events = buffer.split('\n\n');
      buffer = events.pop() || '';
      
      for (const event of events) {
        if (!event.trim()) continue;
        
        const lines = event.split('\n');
        for (const line of lines) {
          if (line.trim().startsWith('data: ')) {
            try {
              const jsonStr = line.trim().slice(5);
              if (!jsonStr) continue;
              
              const data = JSON.parse(jsonStr);
              console.log('Received data:', data);
              
              if (data.knowledgeSources) {
                hasKnowledgeSources = true;
                console.log('✅ Knowledge sources found:', data.knowledgeSources);
                console.log('Number of sources:', data.knowledgeSources.length);
                
                data.knowledgeSources.forEach((source, index) => {
                  console.log(`Source ${index + 1}:`, {
                    title: source.title,
                    content: source.content?.substring(0, 100) + '...',
                    score: source.score
                  });
                });
              }
              
              if (data.content) {
                console.log('Content chunk:', data.content);
              }
              
              if (data.end) {
                console.log('Stream ended');
                break;
              }
            } catch (e) {
              console.error('Error parsing JSON:', e, 'Line:', line);
            }
          }
        }
      }
    }
    
    if (hasKnowledgeSources) {
      console.log('✅ Test passed: Knowledge sources were received and processed');
    } else {
      console.log('❌ Test failed: No knowledge sources were received');
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// 运行测试
testKnowledgeRetrieval();
