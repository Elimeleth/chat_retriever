/*

Langchain: https://js.langchain.com/docs/integrations/vectorstores/qdrant#setup
Qdrant: https://qdrant.tech

Es un gestor de vectores

La idea es usarlo como retriver esto significa que nuestra AI funcionara como un RAG (RETRIEVAL AUGMENTED GENERATION)

CARGAMOS NUESTRO DATASET Y LUEGO LO ADJUNTAMOS COMO DOCUMENTO EN NUESTRO VECTOR
PARA EXPORTARLO COMO UN RETRIEVER
*/

import { CohereEmbeddings } from "@langchain/cohere"
import { QdrantVectorStore } from "@langchain/community/vectorstores/qdrant"

import { TextLoader } from "langchain/document_loaders/fs/text";

// Create docs with a loader
const loader = new TextLoader("src/data.txt");


const qdrant_vector_store = async () => await QdrantVectorStore.fromDocuments(
    await loader.load(),
    new CohereEmbeddings({
        apiKey: process.env.COHERE_API_KEY
    }),
    {
        url: 'http://localhost:6333',
        collectionName: 'chat_retriever'
    }
)

export const retriever = qdrant_vector_store().then(retriever => retriever.asRetriever());