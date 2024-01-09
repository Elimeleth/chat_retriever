import { PromptTemplate } from"langchain/prompts";
import {
    RunnableSequence,
    RunnablePassthrough,
} from"langchain/schema/runnable";
import { formatDocumentsAsString } from"langchain/util/document";
import { StringOutputParser } from"langchain/schema/output_parser";
import { model } from"./chat_model";
import { retriever } from"./chat_vector_store";
import { ANSWER_TEMPLATE, CONDENSE_TEMPLATE } from"./chat_template";

export default class RunnablePassthroughChat {
    private chat_history: [string, string][] = [];
    private retriever = retriever;
    private CONDENSE_QUESTION_PROMPT = PromptTemplate.fromTemplate(CONDENSE_TEMPLATE)
    private ANSWER_PROMPT = PromptTemplate.fromTemplate(ANSWER_TEMPLATE)
    

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
                question: (input) => input.question,
                chat_history: (input) =>
                    this.formatChatHistory(input.chat_history),
            },
            this.CONDENSE_QUESTION_PROMPT,
            model,
            new StringOutputParser(),
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

            console.log({ content })
            // this.chat_history.push([question, content])

            return content
        } catch (error) {
            console.log({ error })
            return ''
        }
    }
}