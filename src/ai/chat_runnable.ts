/*
Langchain: https://js.langchain.com/docs/expression_language/how_to/routing#using-a-custom-function

Un runnable es un algoritmo por el cual podemos tener control de nuestro RAG
con algo de logica un poco avancada podriamos controlar los callbacks que usa langchain por debajo
y con ello tener aún más control sobre nuestro chatbot
*/

import { PromptTemplate } from"@langchain/core/prompts";
import {
    RunnableSequence,
    RunnablePassthrough,
} from"@langchain/core/runnables";
import { StringOutputParser } from"@langchain/core/output_parsers";
import { formatDocumentsAsString } from"langchain/util/document";

import { model } from"./chat_model";
import { retriever } from"./chat_vector_store";
import { ANSWER_TEMPLATE, CONDENSE_TEMPLATE } from"./chat_template";

type conversational = {
    question: string
    chat_history: [string, string][]
}
export default class RunnablePassthroughChat {
    private chat_history: [string, string][] = [];
    private retriever = retriever;
    private CONDENSE_QUESTION_PROMPT = PromptTemplate.fromTemplate(CONDENSE_TEMPLATE) // El primer PROMPT indica como actuar en consecuencia
    private ANSWER_PROMPT = PromptTemplate.fromTemplate(ANSWER_TEMPLATE) // El segundo PROMPT indica como responder
    

    private formatChatHistory(chatHistory: [string, string][]) {
        const formattedDialogueTurns = chatHistory.map(
            (dialogueTurn) => `Human: ${dialogueTurn[0]}\nAssistant: ${dialogueTurn[1]}`
        );
        return formattedDialogueTurns.join("\n");
    };

    private async conversationalRetrievalQAChain() {
        const runnable = new RunnablePassthrough() // Construimos nuestro Runnable

        const standaloneQuestionChain = RunnableSequence.from([
            {
                question: (input: conversational) => input.question,
                chat_history: (input: conversational) =>
                    // esto con la finalidad de que nuestro RAG tenga conocimiento del flujo
                    this.formatChatHistory(input.chat_history) // convertimos nuestro historial [pregunta, respuesta][] a un Human: ...\nAssistant: ...,
            },
            this.CONDENSE_QUESTION_PROMPT,
            model,
            new StringOutputParser() // aplaca la salida a string,
        ]);

        const answerChain = RunnableSequence.from([
            {
                context: (await this.retriever).pipe(formatDocumentsAsString),
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

            const content = await conversationalRetrievalQAChain.invoke({
                question,
                chat_history: this.chat_history,
            })

            this.chat_history.push([question, content])

            return content
        } catch (error) {
            console.log({ error })
            return ''
        }
    }
}