const { createBot, createProvider, createFlow } = require('@bot-whatsapp/bot')

const MockAdapter = require('@bot-whatsapp/database/mock')
const WebHookProvider = require('./provider/lib/index.cjs')
const intercept = require('./intercept')
const welcome = require('./flows/welcome.flow')

const flows = [welcome]

module.exports = async (runnable) => {
    const adapterDB = new MockAdapter()
    const adapterFlow = createFlow([intercept(flows)])
    const adapterProvider = createProvider(WebHookProvider)

    const chatbot = await createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    if (chatbot) {
        chatbot.providerClass.runnable = runnable
    }
}
