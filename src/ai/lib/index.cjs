/** 
* NO TOCAR ESTE ARCHIVO: Es generado automaticamente, si sabes lo que haces adelante ;)
* de lo contrario mejor ir a la documentacion o al servidor de discord link.codigoencasa.com/DISCORD
*/
'use strict';

var prompts = require('langchain/prompts');
var runnable = require('langchain/schema/runnable');
var document = require('langchain/util/document');
var output_parser = require('langchain/schema/output_parser');
var cohere = require('@langchain/cohere');
var qdrant = require('langchain/vectorstores/qdrant');
var text = require('langchain/document_loaders/fs/text');

const model = new cohere.Cohere({
    apiKey: process.env.COHERE_API_KEY, // Default
    maxRetries: 2,
    temperature: 0,
    maxTokens: 90,
    maxConcurrency: 2,
    cache: true,
    onFailedAttempt: (err) => {
        console.log({ err });
    }
});

// Create docs with a loader
const loader = new text.TextLoader("src/data.txt");
const qdrant_vector_store = async () => await qdrant.QdrantVectorStore.fromDocuments(await loader.load(), new cohere.CohereEmbeddings({
    apiKey: process.env.COHERE_API_KEY
}), {
    url: 'http://localhost:6333',
    collectionName: 'chat_retriever'
});
const retriever = qdrant_vector_store().then(retriever => retriever.asRetriever());

const CONDENSE_TEMPLATE = `Eres un asesor profesional del area de tecnologia

Debes ofrecer unicamente la informacion que tienes en el contexto.
Se puntual y breve para generar nuevos leads.

Chat history:
{chat_history}

Recuerda las siguientes reglas:
- No saludes mas de una vez.

Pregunta del cliente:
{question}

Tu respuesta:
`;
const ANSWER_TEMPLATE = `Siempre debes responder las preguntas en español y basado en el siguiente contexto:
{context}

Pregunta: {question}`;

class RunnablePassthroughChat {
    constructor() {
        this.chat_history = [];
        this.retriever = retriever;
        this.CONDENSE_QUESTION_PROMPT = prompts.PromptTemplate.fromTemplate(CONDENSE_TEMPLATE);
        this.ANSWER_PROMPT = prompts.PromptTemplate.fromTemplate(ANSWER_TEMPLATE);
    }
    formatChatHistory(chatHistory) {
        const formattedDialogueTurns = chatHistory.map((dialogueTurn) => `Human: ${dialogueTurn[0]}\nAssistant: ${dialogueTurn[1]}`);
        return formattedDialogueTurns.join("\n");
    }
    ;
    async conversationalRetrievalQAChain() {
        const runnable$1 = new runnable.RunnablePassthrough();
        const standaloneQuestionChain = runnable.RunnableSequence.from([
            {
                question: (input) => input.question,
                chat_history: (input) => this.formatChatHistory(input.chat_history),
            },
            this.CONDENSE_QUESTION_PROMPT,
            model,
            new output_parser.StringOutputParser(),
        ]);
        const answerChain = runnable.RunnableSequence.from([
            {
                context: (await this.retriever).pipe(document.formatDocumentsAsString),
                question: runnable$1
            },
            this.ANSWER_PROMPT,
            model,
        ]);
        return standaloneQuestionChain.pipe(answerChain);
    }
    async call(question) {
        try {
            const conversationalRetrievalQAChain = await this.conversationalRetrievalQAChain();
            const content = await conversationalRetrievalQAChain.invoke({
                question,
                chat_history: this.chat_history,
            });
            console.log({ content });
            // this.chat_history.push([question, content])
            return content;
        }
        catch (error) {
            console.log({ error });
            return '';
        }
    }
}

exports.RunnablePassthroughChat = RunnablePassthroughChat;
