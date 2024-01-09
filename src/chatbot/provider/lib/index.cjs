/** 
* NO TOCAR ESTE ARCHIVO: Es generado automaticamente, si sabes lo que haces adelante ;)
* de lo contrario mejor ir a la documentacion o al servidor de discord link.codigoencasa.com/DISCORD
*/
'use strict';

var require$$0$2 = require('@bot-whatsapp/bot');
var require$$1$1 = require('axios');
var require$$0 = require('events');
var require$$0$1 = require('node:events');
var require$$1 = require('polka');
var require$$2 = require('body-parser');

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

var dist = {exports: {}};

(function (module, exports) {
var _events=_interopRequireDefault(require$$0);Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=void 0;function _interopRequireDefault(a){return a&&a.__esModule?a:{default:a}}function ownKeys(a,b){var c=Object.keys(a);if(Object.getOwnPropertySymbols){var d=Object.getOwnPropertySymbols(a);b&&(d=d.filter(function(b){return Object.getOwnPropertyDescriptor(a,b).enumerable})),c.push.apply(c,d);}return c}function _objectSpread(a){for(var b,c=1;c<arguments.length;c++)b=null==arguments[c]?{}:arguments[c],c%2?ownKeys(Object(b),!0).forEach(function(c){_defineProperty(a,c,b[c]);}):Object.getOwnPropertyDescriptors?Object.defineProperties(a,Object.getOwnPropertyDescriptors(b)):ownKeys(Object(b)).forEach(function(c){Object.defineProperty(a,c,Object.getOwnPropertyDescriptor(b,c));});return a}function _defineProperty(a,b,c){return b in a?Object.defineProperty(a,b,{value:c,enumerable:!0,configurable:!0,writable:!0}):a[b]=c,a}const State={IDLE:0,RUNNING:1,STOPPED:2};class Queue extends _events.default{constructor(a={}){super(),_defineProperty(this,"tasks",new Map),_defineProperty(this,"uniqueId",0),_defineProperty(this,"lastRan",0),_defineProperty(this,"currentlyHandled",0),_defineProperty(this,"state",State.IDLE),_defineProperty(this,"options",{concurrent:5,interval:500,start:!0}),this.options=_objectSpread(_objectSpread({},this.options),a),this.options.interval=parseInt(this.options.interval,10),this.options.concurrent=parseInt(this.options.concurrent,10);}start(){this.state===State.RUNNING||this.isEmpty||(this.state=State.RUNNING,this.emit("start"),(async()=>{for(;this.shouldRun;)await this.dequeue();})());}stop(){clearTimeout(this.timeoutId),this.state=State.STOPPED,this.emit("stop");}finalize(){this.currentlyHandled-=1,0===this.currentlyHandled&&this.isEmpty&&(this.stop(),this.state=State.IDLE,this.emit("end"));}async execute(){const a=[];this.tasks.forEach((b,c)=>{this.currentlyHandled<this.options.concurrent&&(this.currentlyHandled++,this.tasks.delete(c),a.push(Promise.resolve(b()).then(a=>(this.emit("resolve",a),a)).catch(a=>(this.emit("reject",a),a)).finally(()=>{this.emit("dequeue"),this.finalize();})));});const b=await Promise.all(a);return 1===this.options.concurrent?b[0]:b}dequeue(){const{interval:a}=this.options;return new Promise(b=>{const c=Math.max(0,a-(Date.now()-this.lastRan));clearTimeout(this.timeoutId),this.timeoutId=setTimeout(()=>{this.lastRan=Date.now(),this.execute().then(b);},c);})}enqueue(a){if(Array.isArray(a))return void a.map(a=>this.enqueue(a));if("function"!=typeof a)throw new Error(`You must provide a function, not ${typeof a}.`);this.uniqueId=(this.uniqueId+1)%Number.MAX_SAFE_INTEGER,this.tasks.set(this.uniqueId,a),this.options.start&&this.state!==State.STOPPED&&this.start();}add(a){this.enqueue(a);}clear(){this.tasks.clear();}get size(){return this.tasks.size}get isEmpty(){return 0===this.size}get shouldRun(){return !this.isEmpty&&this.state!==State.STOPPED}}exports.default=Queue,module.exports=exports.default; 
} (dist, dist.exports));

var distExports = dist.exports;

const { EventEmitter } = require$$0$1;
const polka = require$$1;
const { urlencoded, json } = require$$2;

const Queue$1 = distExports;

let WebHookServer$1 = class WebHookServer extends EventEmitter {
    constructor(bearer_token, port = 9000) {
        super();
        this.port = port;
        this.bearer_token = bearer_token;
        
        this.server = this.buildHTTPServer();

        this.messageQueue = new Queue$1({
            concurrent: 1, // Procesa un mensaje a la vez
            interval: 50, // Intervalo de 100 milisegundos entre mensajes
            start: true, // La cola empieza a procesar tareas inmediatamente
        });
    }

    /**
     * Mensaje entrante
     * emit: 'message'
     * @param {*} req
     * @param {*} res
     */
    incomingMsg = async (req, res) => {
        const { body } = req;
        // if (body?.payload && body.payload.status !== 'sent') {
        //     res.end('OK')
        //     return
        // }
        const messages = [body.payload];

        if (!messages) {
            res.statusCode = 200;
            res.end('empty endpoint');
            return
        }

        messages.forEach(async (message) => {
            message.name;
            let responseObj;

            responseObj = {
                type: 'text', //message.type,
                from: message.from,
                to: message.to,
                body: message.text,
                pushName: 'mari',
                messageTimestamp: Date.now(),
                timestamp: Date.now()
            };


            if (responseObj) {
                this.messageQueue.enqueue(() => this.processMessage(responseObj));
            }
        });

        res.statusCode = 200;
        res.end('Messages enqueued');
    }

    processMessage = (message) => {
        this.emit('message', message);
    }

    emptyCtrl = (_, res) => {
        res.end('');
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
            console.log(`[edge]: Agregar esta url "Webhook"`);
            console.log(`[edge]: POST http://localhost:${this.port}/webhook`);
            console.log(`[edge]: Más información en la documentación`);
        });
        this.emit('ready');
    }
};

var server = WebHookServer$1;

const { ProviderClass } = require$$0$2;
const axios = require$$1$1;
const Queue = distExports;
const WebHookServer = server;

class ProviderWebHook extends ProviderClass {
    bearer_token = undefined

    constructor(args) {
        super();
        this.bearer_token = args?.bearer_token || args?.headers?.Authorization;
        this.hook = new WebHookServer(this.bearer_token, args?.port);
        this.hook.start();

        const listEvents = this.busEvents();

        for (const { event, func } of listEvents) {
            this.hook.on(event, func);
        }

        this.queue = new Queue({
            concurrent: 1, // Cantidad de tareas que se ejecutarán en paralelo
            interval: 100, // Intervalo entre tareas
            start: true, // Iniciar la cola automáticamente
        });
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
            
            const response = await axios.post(`${args.url}/messages/send`, body, {
                headers: {
                    ...args?.headers
                },
            });

            return response.data
        } catch (error) {
            console.error(error);
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
        };
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
        
        this.sendtext(number, message);
    }
}

var provider = ProviderWebHook;

var index = /*@__PURE__*/getDefaultExportFromCjs(provider);

module.exports = index;
