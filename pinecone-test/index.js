import { Pinecone } from '@pinecone-database/pinecone';

// Initialize client
const pc = new Pinecone({
  apiKey: 'pcsk_6U9brN_KF21bHBP8jDA3ZAVbs5rKphELq2XVwcaJeau75rSv4h9pm2t3hyBcLTpX1GFWR6 '  // Replace with your real Pinecone API key
});

// Connect to index
const index = pc.index('quickstart');

console.log("Connected to Pinecone index:", index.name);
