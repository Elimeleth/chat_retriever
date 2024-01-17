import Bot from "@bot-whatsapp/bot"

/**
  La modalidad de interceptar todos los flows en un solo lugar nos da la posibilidad de ser creativos
  y poder editar el state de un usuario y pueda viajar
  esto da incluso para colocar algun otro servicio o middleware

  ESTE INTECEPTOR FUNCIONA COMO HIBRIDO, me explico: 

  tiene un flow que se activa con => hola pero de no ser lo que el usuario escribio alli actua la AI
 */
const intercept = (flows) => {
    const flow = Bot.addKeyword(`/.*/gim`, { regex: true, sensitive: false })
        .addAction(async (ctx, { gotoFlow, endFlow, provider }) => {
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
                    // de no encontrar el flujo procedemos a usar nuestro RAG
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