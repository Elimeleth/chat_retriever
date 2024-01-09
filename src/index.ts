import { RunnablePassthroughChat } from "./chat_runnable";

const runnable = new RunnablePassthroughChat()

runnable.call('Que es langchain?')