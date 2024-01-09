const { addKeyword } = require("@bot-whatsapp/bot")

/**
 * INTERCEPTAMOS TODAS LAS INTENCIONES EN UN SOLO LUGAR Y ENVIAMOS EL FLOW
 * @param {*} flows 
 * @returns 
 */
const intercept = (flows) => {
    const flow = addKeyword(`/.*/gim`, { regex: true, sensitive: false })
        .addAction(async (ctx, { gotoFlow, endFlow, flowDynamic, provider }) => {
            try {
                console.log({ provider })
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

module.exports = intercept