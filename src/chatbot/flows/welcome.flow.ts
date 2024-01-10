import bot from '@bot-whatsapp/bot'

const welcome = bot.addKeyword('hola', { regex: true, sensitive: false })
    .addAction(async (ctx, { flowDynamic, state }) => {
        const message = 'hola!'

        await state.clear()
        await flowDynamic(message)
    })

export default welcome