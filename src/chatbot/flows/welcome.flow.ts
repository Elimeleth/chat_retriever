const { addKeyword } = require('@bot-whatsapp/bot')

const welcome = addKeyword('hola', { regex: true, sensitive: false })
    .addAction(async (ctx, { flowDynamic, state }) => {
        const message = 'hola!'

        await state.clear()
        await flowDynamic(message)
    })

export default welcome