import Bot from '@bot-whatsapp/bot'

export default Bot.addKeyword('/^hola/', { regex: true, sensitive: false })
    .addAnswer('Un gusto tenerte de nuevo ¿Como puedo ayudarte el día de hoy 😀?')