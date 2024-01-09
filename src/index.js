const RunnablePassthroughChat = require("./chat_runnable");
const main = require("./chatbot/app.js");

main(new RunnablePassthroughChat());