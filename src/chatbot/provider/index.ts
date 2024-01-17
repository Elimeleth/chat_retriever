/*
    Debes editar tu propia logica en la funcion sendMessageToApi para el envio de la data a tu API
*/

// @ts-nocheck
import Bot from "@bot-whatsapp/bot"
import axios from 'axios'
import Queue from 'queue-promise'
import WebHookServer from './server'
import { IncomingMessage, ServerResponse } from "http"


export type Args = {
    bearer_token: string;
    url: string;
    headers: {
        [key: string]: string
    };
    attachWebhook: {
        path: string, 
        controller: (req: IncomingMessage, res: ServerResponse) => Promise<ServerResponse & { responses: any[] }>
    }
}

class WebHookProvider extends Bot.ProviderClass {
    private bearer_token = undefined
    private hook = new WebHookServer(this.bearer_token, 9000)

    private queue = new Queue({
        concurrent: 1, // Cantidad de tareas que se ejecutarán en paralelo
        interval: 100, // Intervalo entre tareas
        start: true, // Iniciar la cola automáticamente
    })

    constructor(private args: Args) {
        super()
        this.bearer_token = args?.bearer_token || args?.headers?.Authorization
        
        if (args.attachWebhook) {
            const { path, controller } = args.attachWebhook
            this.hook.createWebhook(path, controller)
        }

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
    private busEvents = () => [
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
    private sendMessageApi(body) {
        return this.queue.add(() => this.sendMessageToApi(body))
    }

    /**
     * Sends a message to the API.
     *
     * @param {Object} body - The body of the message.
     * @return {Object} The response data from the API.
     */
    private async sendMessageToApi(body) {
        try {
            console.log('Sending message to API: ', body)
            if (!this.bearer_token || !this.args) throw new Error("bearer_token && args is required")
            // const response = await axios.post(`${this.args.url}/foo`, body, {
            //     headers: {
            //         ...this.args?.headers
            //     },
            // })

            // return response.data
        } catch (error) {
            console.error(error)
        }
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
}

export default WebHookProvider