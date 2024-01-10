import bot from "@bot-whatsapp/bot"

/**
 * INTERCEPTAMOS TODAS LAS INTENCIONES EN UN SOLO LUGAR Y ENVIAMOS EL FLOW
 * @param {*} flows 
 * @returns 
 */
const intercept = (flows) => {
    const flow = bot.addKeyword(`/.*/gim`, { regex: true, sensitive: false })
        .addAction(async (ctx, { gotoFlow, endFlow, flowDynamic }) => {
            try {
                
                const flow = flows.find(f => !!(//? SOLO FUNCIONA CON EXPRESIONES REGULARES
                    typeof f.ctx.keyword === 'string' &&
                    new RegExp(String(f.ctx.keyword).toLowerCase().replace(/(\/|gim)/g, '')).test(ctx.body)
                )
                )
                
                if (flow) {
                    await gotoFlow(flow)
                }else {
                    await flowDynamic('hola')
                }

            } catch (error) {
                endFlow('')
            }
        })

    return flow
}

export default intercept;