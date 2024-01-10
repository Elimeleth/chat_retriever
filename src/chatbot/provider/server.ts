import { EventEmitter } from 'node:events'
import polka from 'polka'
import bodyParser from 'body-parser'

import Queue from 'queue-promise'

export default class WebHookServer extends EventEmitter {
    messageQueue: any = new Queue({
        concurrent: 1, // Procesa un mensaje a la vez
        interval: 50, // Intervalo de 100 milisegundos entre mensajes
        start: true, // La cola empieza a procesar tareas inmediatamente
    })

    constructor(private server: any, private port = 9000) {
        super()
        this.server = this.buildHTTPServer()
    }

    /**
     * Mensaje entrante
     * emit: 'message'
     * @param {*} req
     * @param {*} res
     */
    incomingMsg = async (req, res) => {
        const { body } = req
        // if (body?.payload && body.payload.status !== 'sent') {
        //     res.end('OK')
        //     return
        // }
        const messages = [body.payload]

        if (!messages) {
            res.statusCode = 200
            res.end('empty endpoint')
            return
        }

        messages.forEach(async (message) => {
            const pushName = message.name
            let responseObj

            responseObj = {
                type: 'text', //message.type,
                from: message.from,
                to: message.to,
                body: message.text,
                pushName: 'mari',
                messageTimestamp: Date.now(),
                timestamp: Date.now()
            }


            if (responseObj) {
                this.messageQueue.enqueue(() => this.processMessage(responseObj))
            }
        })

        res.statusCode = 200
        res.end('Messages enqueued')
    }

    processMessage = (message) => {
        this.emit('message', message)
    }

    emptyCtrl = (_, res) => {
        res.end('')
    }

    /**
     * Contruir HTTP Server
     */
    buildHTTPServer() {
        return polka()
            .use(bodyParser.urlencoded({ extended: true }))
            .use(bodyParser.json())
            .get('/', this.emptyCtrl)
            .get('/webhook', this.emptyCtrl)
            .post('/webhook', this.incomingMsg)
            .all('*', (_, res) => res.status(404))
    }

    /**
     * Iniciar el servidor HTTP
     */
    start() {
        this.server.listen(this.port, () => {
            console.log(`[edge]: Agregar esta url "Webhook"`)
            console.log(`[edge]: POST http://localhost:${this.port}/webhook`)
            console.log(`[edge]: Más información en la documentación`)
        })
        this.emit('ready')
    }
}