const { EventEmitter } = require('node:events')
const polka = require('polka')
const { urlencoded, json } = require('body-parser')

const Queue = require('queue-promise')

class WebHookServer extends EventEmitter {
    constructor(bearer_token, port = 9000) {
        super()
        this.port = port
        this.bearer_token = bearer_token
        
        this.server = this.buildHTTPServer()

        this.messageQueue = new Queue({
            concurrent: 1, // Procesa un mensaje a la vez
            interval: 50, // Intervalo de 100 milisegundos entre mensajes
            start: true, // La cola empieza a procesar tareas inmediatamente
        })
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
            .use(urlencoded({ extended: true }))
            .use(json())
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

module.exports = WebHookServer