import { createBot, createProvider, createFlow } from '@bot-whatsapp/bot'

import MockAdapter from '@bot-whatsapp/database/mock'
import WebHookProvider from './provider'
import intercept from './intercept'
import welcome from './flows/welcome.flow'
import RunnablePassthroughChat from '../ai/chat_runnable'

const flows = [welcome]

const main = async () => {
    const adapterDB = new MockAdapter()
    const adapterFlow = createFlow([intercept(flows)])
    const adapterProvider = createProvider(WebHookProvider)

    const chatbot = await createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    if (chatbot) {
        chatbot.providerClass.runnable = new RunnablePassthroughChat()
    }
}

main()