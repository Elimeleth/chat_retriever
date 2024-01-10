// @ts-nocheck
import bot from '@bot-whatsapp/bot'
import axios from 'axios'
import Queue from 'queue-promise'
import WebHookServer from './server'

class WebHookProvider extends bot.ProviderClass {
    private bearer_token = undefined
    private hook = new WebHookServer(this.bearer_token, 9000)

    private queue = new Queue({
        concurrent: 1, // Cantidad de tareas que se ejecutarán en paralelo
        interval: 100, // Intervalo entre tareas
        start: true, // Iniciar la cola automáticamente
    })

    constructor(private args: any) {
        super()
        this.bearer_token = args?.bearer_token || args?.headers?.Authorization
        this.hook.start()

        const listEvents = this.busEvents()

        for (const { event, func } of listEvents) {
            this.hook.on(event, func)
        }
    }

    /**
     * Mapeamos los eventos nativos a los que la clase Provider espera
     * para tener un standar de eventos
     * @returns
     */
    busEvents = () => [
        {
            event: 'auth_failure',
            func: (payload) => this.emit('error', payload),
        },
        {
            event: 'ready',
            func: () => this.emit('ready', true),
        },
        {
            event: 'message',
            func: (payload) => this.emit('message', payload),
        },
    ]

    /**
     * Sends a message with metadata to the API.
     *
     * @param {Object} body - The body of the message.
     * @return {Promise} A Promise that resolves when the message is sent.
     */
    sendMessageApi(body) {
        return this.queue.add(() => this.sendMessageToApi(body))
    }

    /**
     * Sends a message to the API.
     *
     * @param {Object} body - The body of the message.
     * @return {Object} The response data from the API.
     */
    async sendMessageToApi(body) {
        try {
            
            const response = await axios.post(`${this.args.url}/messages/send`, body, {
                headers: {
                    ...this.args?.headers
                },
            })

            return response.data
        } catch (error) {
            console.error(error)
        }
    }

    sendtext = async (number, message) => {
        const body = {
            from: "whatsapp",
            to: `+${number}`,
            type: 'text',
            content: {
                text: message,
            },
        }
        return this.sendMessageApi(body)
    }
    /**
     * @alpha
     * @param {string} number
     * @param {string} message
     * @example await sendMessage('+XXXXXXXXXXX', 'https://dominio.com/imagen.jpg' | 'img/imagen.jpg')
     */

    sendMedia = async (number, text = '', options) => {
    }

    /**
     *
     * @param {*} userId
     * @param {*} message
     * @param {*} param2
     * @returns
     */
    sendMessage = async (number, message, { options }) => {
        if (options?.media) return this.sendMedia(number, message, options.media)
        
        this.sendtext(number, message)
    }
}

export default Bot.createProvider(WebHookProvider)