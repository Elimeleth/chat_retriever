import bot from '@bot-whatsapp/bot'

export default bot.addKeyword('hola', { regex: true, sensitive: false })
.addAnswer('Un gusto tenerte de nuevo ¿Como puedo ayudarte el día de hoy 😀?')