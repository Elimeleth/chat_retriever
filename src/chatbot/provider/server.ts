import { EventEmitter } from 'node:events'
import polka from 'polka'
import bodyParser from 'body-parser'

import Queue from 'queue-promise'

export default class WebHookServer extends EventEmitter {
    server!: polka.Polka
    
    messageQueue: any = new Queue({
        concurrent: 1, // Procesa un mensaje a la vez
        interval: 50, // Intervalo de 100 milisegundos entre mensajes
        start: true, // La cola empieza a procesar tareas inmediatamente
    })


    constructor(private port = 9000) {
        super()
        this.server = this.buildHTTPServer()
    }

    private processMessage = async (message) => {
        this.emit('message', message)
    }

    private handleQueue (messages) {
        if (!messages) return
        messages = Array.isArray(messages) ? messages : [messages]
        for (const message of messages) {
            this.messageQueue.enqueue(() => this.processMessage(message))
        }
    }

    createWebhook(path: string, controller: (req, res) => Promise<Response>) {
        this.server.use(path, (req, res, next) => {
            try {
                Promise.all([
                    controller(req, res),
                    // @ts-ignore
                    this.handleQueue(res?.responses)
                ])
                next()
            } catch (error) {
                next(error?.message)
            }
        })
        this.server.post(path, async (req, res) => {
            res.statusCode = 201
            res.end('success!')
        })
    }

    /**
     * Contruir HTTP Server
     */
    private buildHTTPServer() {
        return polka()
            .use(bodyParser.urlencoded({ extended: true }))
            .use(bodyParser.json())
            .get('/', (_, res) => res.end('Hello, friend'))
            .all('*', (_, res) => {
                res.statusCode = 404
                res.end('')
            })
    }    

    /**
     * Iniciar el servidor HTTP
     */
    start() {
        this.server.listen(this.port, () => {
            console.log(`Server listening on port: http://localhost:${this.port}`);
        })
        this.emit('ready')
    }
}