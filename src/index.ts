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
        // pasamos nuestro runnable al provider para tenerlo en nuestro interceptor
        chatbot.providerClass.runnable = new RunnablePassthroughChat()
    }
}

main().then().catch((err) => console.log({ err }))