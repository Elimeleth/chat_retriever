
import { compile } from "html-to-text";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { RecursiveUrlLoader } from "langchain/document_loaders/web/recursive_url";
import { HNSWLib } from "@langchain/community/vectorstores/hnswlib";
import { CohereEmbeddings } from "@langchain/cohere";


const url = "https://bot-whatsapp.netlify.app/docs/";
const compiledConvert = compile({ wordwrap: 130 }); // returns (text: string) => string;

const loader = new RecursiveUrlLoader(url, {
  extractor: compiledConvert,
  maxDepth: 1,
  excludeDirs: [],
});

const docs = await loader.loadAndSplit(new RecursiveCharacterTextSplitter({ chunkSize: 1000 }));

const vectorStore = await HNSWLib.fromDocuments(
  docs, new CohereEmbeddings({ apiKey: 'grA5kXUCn3WMrZrEjYO35KoKlTCzCPnwOXGRxxEG' })
);

// Initialize a retriever wrapper around the vector store
export default vectorStore.asRetriever();