// This script creates a simple text file that can be used for testing
// In a real scenario, you would have actual PDF files

const fs = require('fs');
const path = require('path');

const sampleContent = `# Sample Document for RAG Testing

This is a sample document that can be used to test the RAG application with various file formats.

## Introduction

Retrieval-Augmented Generation (RAG) is a powerful technique that combines information retrieval with text generation to improve the accuracy and relevance of AI-generated responses.

## Key Components

### 1. Document Processing
- Text extraction from various formats
- Chunking strategies for optimal retrieval
- Metadata preservation

### 2. Vector Storage
- Embedding generation
- Vector database storage
- Similarity search capabilities

### 3. Retrieval and Generation
- Query processing
- Document retrieval
- Answer generation with citations

## Benefits

RAG systems provide several advantages:
- Reduced hallucination
- Up-to-date information
- Source attribution
- Domain-specific knowledge integration

## Use Cases

Common applications include:
- Question answering systems
- Customer support chatbots
- Knowledge management
- Research assistance
- Content generation

## Best Practices

When implementing RAG systems:
1. Choose appropriate chunking strategies
2. Optimize retrieval parameters
3. Implement proper reranking
4. Monitor system performance
5. Ensure data quality

This document serves as a test case for the RAG application's document processing capabilities.
`;

// Create a sample text file
fs.writeFileSync(path.join(__dirname, '../public/sample-document.txt'), sampleContent);

// Create a sample markdown file
fs.writeFileSync(path.join(__dirname, '../public/sample-document.md'), sampleContent);

console.log('Sample documents created:');
console.log('- public/sample-document.txt');
console.log('- public/sample-document.md');
console.log('\nYou can use these files to test the document upload functionality.');
