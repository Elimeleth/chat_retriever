import { PromptTemplate } from "langchain/prompts";
import {
    RunnableSequence,
    RunnablePassthrough,
} from "langchain/schema/runnable";
import { formatDocumentsAsString } from "langchain/util/document";
import { StringOutputParser } from "langchain/schema/output_parser";
import { model } from "./chat_model";
import { retriever } from "./chat_vector_store";
import { VectorStoreRetriever } from "langchain/dist/vectorstores/base";
import { ANSWER_TEMPLATE, CONDENSE_TEMPLATE } from "./chat_template";
import { QdrantVectorStore } from "langchain/vectorstores/qdrant";


type ConversationalRetrievalQAChainInput = {
    question: string;
    language: string;
    chat_history: [string, string][];
};

export class RunnablePassthroughChat {
    private chat_history: [string, string][] = [];
    private retriever: VectorStoreRetriever<QdrantVectorStore> = retriever;
    private CONDENSE_QUESTION_PROMPT = PromptTemplate.fromTemplate(CONDENSE_TEMPLATE)
    private ANSWER_PROMPT: PromptTemplate = PromptTemplate.fromTemplate(ANSWER_TEMPLATE)
    

    private formatChatHistory(chatHistory: [string, string][]) {
        const formattedDialogueTurns = chatHistory.map(
            (dialogueTurn) => `Human: ${dialogueTurn[0]}\nAssistant: ${dialogueTurn[1]}`
        );
        return formattedDialogueTurns.join("\n");
    };

    private async conversationalRetrievalQAChain() {
        const runnable = new RunnablePassthrough()

        const standaloneQuestionChain = RunnableSequence.from([
            {
                question: (input: ConversationalRetrievalQAChainInput) => input.question,
                language: (input: ConversationalRetrievalQAChainInput) => input.language,
                chat_history: (input: ConversationalRetrievalQAChainInput) =>
                    this.formatChatHistory(input.chat_history),
            },
            this.CONDENSE_QUESTION_PROMPT,
            model,
            new StringOutputParser(),
        ]);

        const answerChain = RunnableSequence.from([
            {
                context: this.retriever.pipe(formatDocumentsAsString),
                language: runnable,
                question: runnable
            },
            this.ANSWER_PROMPT,
            model,
        ]);

        return standaloneQuestionChain.pipe(answerChain)
    }


    async call(question: string) {
        try {
            const conversationalRetrievalQAChain = await this.conversationalRetrievalQAChain()

            const content: any = await conversationalRetrievalQAChain.invoke({
                question,
                language: "spanish",
                chat_history: this.chat_history,
            })

            console.log({ content })
            // this.chat_history.push([question, content])

            return content
        } catch (error) {
            console.log({ error })
            return ''
        }
    }
}