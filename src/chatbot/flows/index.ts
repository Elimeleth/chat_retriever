import Bot from '@bot-whatsapp/bot'

import welcome from "./welcome.flow"
import intercept from '../intercept'

const flows = [welcome]

export default Bot.createFlow([intercept(flows)])
