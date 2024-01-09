export const CONDENSE_TEMPLATE: any = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question, in its original language.

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:`

export const ANSWER_TEMPLATE: any = `Siempre debes responder las preguntas basado en el siguiente contexto:
{context}

retorna un mensaje bien detallado si no tienes la respuesta correcta

recuerda dar un breve resumen del negocio solo si es relevante dar el resumen

Tu respuesta debe ser lo mas breve, resumida y refinada posible.

Pregunta: {question}

Siempre debes responder en el idioma: {language}`