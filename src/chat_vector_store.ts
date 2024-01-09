import { CohereEmbeddings } from "@langchain/cohere"
import { QdrantVectorStore } from "langchain/vectorstores/qdrant"

import { TextLoader } from "langchain/document_loaders/fs/text";

// Create docs with a loader
const loader = new TextLoader("src/data.txt");

const qdrant_vector_store = await QdrantVectorStore.fromDocuments(
    await loader.load(),
    new CohereEmbeddings({
        apiKey: process.env.COHERE_API_KEY
    }),
    {
        url: 'http://localhost:6333',
        collectionName: 'chat_retriever'
    }
)

export const retriever = qdrant_vector_store.asRetriever();