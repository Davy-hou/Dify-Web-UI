// 测试knowledge sources显示时机
async function testKnowledgeSourcesTiming() {
  try {
    console.log('Testing knowledge sources timing...');
    
    const response = await fetch('http://localhost:3001/api/test-knowledge', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: '测试时机' })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let hasContent = false;
    let hasKnowledgeSources = false;
    let contentBeforeKnowledge = false;
    let knowledgeBeforeContent = false;
    
    console.log('Reading stream to check timing...');
    
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
              
              if (data.content && !hasContent) {
                hasContent = true;
                console.log('✅ First content received:', data.content.substring(0, 50) + '...');
                if (hasKnowledgeSources) {
                  knowledgeBeforeContent = true;
                  console.log('📝 Knowledge sources came BEFORE content');
                }
              }
              
              if (data.knowledgeSources && !hasKnowledgeSources) {
                hasKnowledgeSources = true;
                console.log('📚 Knowledge sources received');
                if (hasContent) {
                  contentBeforeKnowledge = true;
                  console.log('📝 Content came BEFORE knowledge sources');
                }
              }
              
              if (data.end) {
                console.log('Stream ended');
                break;
              }
            } catch (e) {
              console.error('Error parsing JSON:', e);
            }
          }
        }
      }
    }
    
    console.log('\n=== Timing Analysis ===');
    console.log('Has content:', hasContent);
    console.log('Has knowledge sources:', hasKnowledgeSources);
    console.log('Content before knowledge:', contentBeforeKnowledge);
    console.log('Knowledge before content:', knowledgeBeforeContent);
    
    if (knowledgeBeforeContent) {
      console.log('✅ Good: Our fix will prevent knowledge sources from showing before content');
    } else if (contentBeforeKnowledge) {
      console.log('ℹ️  Content came first, knowledge sources will show after content is available');
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// 运行测试
testKnowledgeSourcesTiming();
