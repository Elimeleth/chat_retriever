import "dotenv/config"
import Bot from '@bot-whatsapp/bot'

import RunnablePassthroughChat from './ai/chat_runnable'
import database from './chatbot/database'
import provider from './chatbot/provider'
import flow from "./chatbot/flows"

const main = async () => {
    const chatbot = await Bot.createBot({
        flow,
        provider,
        database,
    })

    if (chatbot) {
        chatbot.providerClass.runnable = new RunnablePassthroughChat()
    }
}

main().then().catch((err) => console.log({ err }))