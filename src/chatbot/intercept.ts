import bot from "@bot-whatsapp/bot"

/**
 * INTERCEPTAMOS TODAS LAS INTENCIONES EN UN SOLO LUGAR Y ENVIAMOS EL FLOW
 * @param {*} flows 
 * @returns 
 */
const intercept = (flows) => {
    const flow = bot.addKeyword(`/.*/gim`, { regex: true, sensitive: false })
        .addAction(async (ctx, { gotoFlow, endFlow, flowDynamic, provider }) => {
            try {
                console.log('Running flow')
                const flow = flows.find(f => !!(//? SOLO FUNCIONA CON EXPRESIONES REGULARES
                    typeof f.ctx.keyword === 'string' &&
                    new RegExp(String(f.ctx.keyword).toLowerCase().replace(/(\/|gim)/g, '')).test(ctx.body)
                )
                )
                
                if (flow) {
                    console.log('flow founded: ', flow)
                    await gotoFlow(flow)
                }else {
                    console.log('flow not founded - Running AI ')
                    await endFlow(await provider.runnable.call(ctx.body))
                }

            } catch (error) {
                console.log('error: ', error)
            }
        })

    return flow
}

export default intercept;