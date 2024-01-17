import "dotenv/config"
import Bot from '@bot-whatsapp/bot'

// import RunnablePassthroughChat from './ai'
import database from './chatbot/database'
import WebHookProvider, { Args } from './chatbot/provider'
import flow from "./chatbot/flows"

const handleWebhook = async (req: any, res: any) => {
    const { type, from, to, body, pushName } = req.body
    let responses = {
        type: type || 'text',
        from,
        to,
        body,
        pushName,
        messageTimestamp: Date.now(),
        timestamp: Date.now()
    }

    res.responses = [responses]

    return res
}

const provider = Bot.createProvider<WebHookProvider, Args>(WebHookProvider, {
    bearer_token: '',
    headers: {},
    url: '',
    attachWebhook: {
        path: '/webhook',
        controller: handleWebhook
    }
})


const main = async () => {
    Bot.createBot({
        flow,
        provider,
        database,
    })
    // if (chatbot) {
    //     // pasamos nuestro runnable al provider para tenerlo en nuestro interceptor
    //     chatbot.providerClass.runnable = new RunnablePassthroughChat()
    // }
}

main().then().catch((err) => console.log({ err }))