export const CONDENSE_TEMPLATE: any = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question, in its original language.

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:`

export const ANSWER_TEMPLATE: any = `Siempre debes responder las preguntas basado en el siguiente contexto:
{context}

Tu respuesta debe ser lo mas breve, resumida y refinada posible.

Pregunta: {question}

Siempre debes responder en el idioma: {language}`