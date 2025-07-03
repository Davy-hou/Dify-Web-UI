// 测试knowledge-retrieval功能的脚本
// 模拟Dify API返回的knowledge-retrieval数据

const testKnowledgeRetrievalData = {
  event: 'node_finished',
  conversation_id: '9608623b-632d-4643-afb4-0cba974a87d1',
  message_id: 'eb76736d-fa72-49d7-839d-57126122b62a',
  created_at: 1751423660,
  task_id: '84486936-ac92-4a76-aea8-1a4fbe59b8fd',
  workflow_run_id: '83d8de35-0c5a-48ac-b336-39e076dadc8e',
  data: {
    id: '14ff202a-8075-4a7a-ae20-556e131d3819',
    node_id: '1711528915811',
    node_type: 'knowledge-retrieval',
    title: '知识检索',
    index: 2,
    predecessor_node_id: '1711528914102',
    inputs: { query: '黄牛' },
    process_data: null,
    outputs: { 
      result: [
        {
          content: '黄牛是一种常见的牛品种，原产于中国，具有适应性强、耐粗饲、抗病力强等特点。黄牛体型中等，毛色多为黄色或黄褐色，是中国传统的役用牛品种。',
          title: '黄牛品种介绍',
          url: 'https://example.com/cattle-breeds',
          score: 0.95
        },
        {
          content: '黄牛的饲养管理要点包括：1. 提供充足的饲料和清洁的饮水；2. 定期进行健康检查和疫苗接种；3. 保持牛舍清洁干燥；4. 合理安排放牧时间。',
          title: '黄牛饲养管理',
          url: 'https://example.com/cattle-management',
          score: 0.87
        },
        {
          content: '黄牛的经济价值主要体现在肉用、乳用和役用三个方面。黄牛肉质鲜美，营养丰富，是重要的蛋白质来源。同时，黄牛还可以提供牛奶和作为农业生产的动力。',
          title: '黄牛的经济价值',
          url: 'https://example.com/cattle-value',
          score: 0.82
        }
      ]
    },
    status: 'succeeded',
    error: null,
    elapsed_time: 1.293433,
    execution_metadata: {},
    created_at: 1751423660,
    finished_at: 1751423660,
    files: [],
    parallel_id: null,
    parallel_start_node_id: null,
    parent_parallel_id: null,
    parent_parallel_start_node_id: null,
    iteration_id: null,
    loop_id: null
  }
};

// 测试handleStreamData函数
function testHandleStreamData() {
  console.log('Testing knowledge-retrieval data processing...');
  
  // 模拟controller
  const mockController = {
    enqueue: (data) => {
      console.log('Enqueued data:', data);
      
      // 解析发送的数据
      if (data.startsWith('data: ')) {
        const jsonStr = data.slice(5, -2); // 移除 'data: ' 和 '\n\n'
        const parsedData = JSON.parse(jsonStr);
        
        if (parsedData.knowledgeSources) {
          console.log('✅ Knowledge sources detected:', parsedData.knowledgeSources.length, 'sources');
          console.log('✅ Node title:', parsedData.nodeTitle);
          
          parsedData.knowledgeSources.forEach((source, index) => {
            console.log(`Source ${index + 1}:`, {
              title: source.title,
              content: source.content.substring(0, 50) + '...',
              score: source.score
            });
          });
        }
      }
    }
  };
  
  // 复制handleStreamData函数的逻辑
  const data = testKnowledgeRetrievalData;
  
  if (data.event === 'node_finished') {
    if (data.data && data.data.node_type === 'knowledge-retrieval') {
      const knowledgeSources = data.data.outputs?.result || [];
      
      if (knowledgeSources.length > 0) {
        mockController.enqueue(`data: ${JSON.stringify({
          knowledgeSources: knowledgeSources,
          nodeTitle: data.data.title || '知识检索'
        })}\n\n`);
      }
    }
  }
}

// 运行测试
testHandleStreamData();
