const { retrieveDocuments } = require('../lib/retriever');
const { generateAnswer } = require('../lib/llm');
require('dotenv').config();

// Sample Q&A pairs for evaluation
const evaluationPairs = [
  {
    question: "What is machine learning?",
    expectedKeywords: ["artificial intelligence", "learn", "experience", "programmed"],
    category: "definition"
  },
  {
    question: "What are the main types of machine learning?",
    expectedKeywords: ["supervised", "unsupervised", "reinforcement"],
    category: "classification"
  },
  {
    question: "How does RAG work?",
    expectedKeywords: ["retrieval", "generation", "knowledge base", "context"],
    category: "process"
  },
  {
    question: "What is the transformer architecture?",
    expectedKeywords: ["attention", "self-attention", "multi-head", "positional"],
    category: "architecture"
  },
  {
    question: "What are vector databases used for?",
    expectedKeywords: ["vectors", "similarity", "search", "embeddings"],
    category: "application"
  }
];

async function runEvaluation() {
  console.log('Starting RAG System Evaluation...\n');
  
  let totalQuestions = evaluationPairs.length;
  let successfulAnswers = 0;
  let totalResponseTime = 0;
  let totalTokens = 0;
  let totalCost = 0;
  
  for (let i = 0; i < evaluationPairs.length; i++) {
    const pair = evaluationPairs[i];
    console.log(`\n${i + 1}. Question: ${pair.question}`);
    console.log(`   Category: ${pair.category}`);
    
    try {
      const startTime = Date.now();
      
      // Retrieve documents
      const retrievedDocs = await retrieveDocuments(pair.question);
      
      if (retrievedDocs.length === 0) {
        console.log('   ❌ No relevant documents found');
        continue;
      }
      
      // Generate answer
      const response = await generateAnswer(pair.question, retrievedDocs);
      const responseTime = Date.now() - startTime;
      
      // Check if answer contains expected keywords
      const answerLower = response.answer.toLowerCase();
      const keywordMatches = pair.expectedKeywords.filter(keyword => 
        answerLower.includes(keyword.toLowerCase())
      );
      
      const keywordScore = keywordMatches.length / pair.expectedKeywords.length;
      const isSuccessful = keywordScore >= 0.5; // 50% keyword match threshold
      
      if (isSuccessful) {
        successfulAnswers++;
        console.log('   ✅ Answer generated successfully');
      } else {
        console.log('   ⚠️  Answer generated but may lack expected content');
      }
      
      console.log(`   📊 Keyword Score: ${(keywordScore * 100).toFixed(1)}% (${keywordMatches.length}/${pair.expectedKeywords.length})`);
      console.log(`   ⏱️  Response Time: ${responseTime}ms`);
      console.log(`   🎯 Tokens Used: ${response.tokensUsed}`);
      console.log(`   💰 Estimated Cost: $${response.estimatedCost.toFixed(6)}`);
      console.log(`   📝 Answer: ${response.answer.substring(0, 200)}...`);
      
      totalResponseTime += responseTime;
      totalTokens += response.tokensUsed;
      totalCost += response.estimatedCost;
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
  
  // Calculate metrics
  const successRate = (successfulAnswers / totalQuestions) * 100;
  const avgResponseTime = totalResponseTime / totalQuestions;
  const avgTokens = totalTokens / totalQuestions;
  const avgCost = totalCost / totalQuestions;
  
  console.log('\n' + '='.repeat(60));
  console.log('EVALUATION RESULTS');
  console.log('='.repeat(60));
  console.log(`Total Questions: ${totalQuestions}`);
  console.log(`Successful Answers: ${successfulAnswers}`);
  console.log(`Success Rate: ${successRate.toFixed(1)}%`);
  console.log(`Average Response Time: ${avgResponseTime.toFixed(0)}ms`);
  console.log(`Average Tokens per Query: ${avgTokens.toFixed(0)}`);
  console.log(`Average Cost per Query: $${avgCost.toFixed(6)}`);
  console.log(`Total Cost: $${totalCost.toFixed(6)}`);
  
  // Performance assessment
  console.log('\nPERFORMANCE ASSESSMENT:');
  if (successRate >= 80) {
    console.log('✅ Excellent: High success rate indicates good retrieval and generation');
  } else if (successRate >= 60) {
    console.log('⚠️  Good: Moderate success rate, consider improving retrieval or generation');
  } else {
    console.log('❌ Needs Improvement: Low success rate, review system configuration');
  }
  
  if (avgResponseTime <= 2000) {
    console.log('✅ Fast: Response time is acceptable for real-time use');
  } else {
    console.log('⚠️  Slow: Consider optimizing retrieval or using faster models');
  }
  
  console.log('\nEvaluation completed!');
}

runEvaluation().catch(console.error);
