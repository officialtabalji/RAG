const { Pinecone } = require('@pinecone-database/pinecone');
require('dotenv').config();

async function initializePinecone() {
  try {
    console.log('Initializing Pinecone...');
    
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
      environment: process.env.PINECONE_ENVIRONMENT,
    });

    const indexName = process.env.PINECONE_INDEX_NAME || 'rag-documents';
    
    // Check if index exists
    const existingIndexes = await pinecone.listIndexes();
    const indexExists = existingIndexes.indexes?.some(index => index.name === indexName);
    
    if (indexExists) {
      console.log(`Index '${indexName}' already exists.`);
      return;
    }
    
    // Create index
    console.log(`Creating index '${indexName}'...`);
    await pinecone.createIndex({
      name: indexName,
      dimension: 1536, // OpenAI text-embedding-ada-002 dimension
      metric: 'cosine',
      spec: {
        serverless: {
          cloud: 'aws',
          region: 'us-east-1'
        }
      }
    });
    
    console.log(`Index '${indexName}' created successfully!`);
    console.log('Waiting for index to be ready...');
    
    // Wait for index to be ready
    let isReady = false;
    while (!isReady) {
      const indexDescription = await pinecone.describeIndex(indexName);
      isReady = indexDescription.status?.ready;
      
      if (!isReady) {
        console.log('Index not ready yet, waiting 10 seconds...');
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    }
    
    console.log('Index is ready!');
    
  } catch (error) {
    console.error('Error initializing Pinecone:', error);
    process.exit(1);
  }
}

initializePinecone();
