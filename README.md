# habicord-bot

Serverless function that connects a Habitica webhook to a Discord webhook

Runs as a serverless lambda function on [Netlify](https://www.netlify.com/docs/functions/).

Features:

- Webhook (type: `groupChatReceived` and `questActivity`) needs to be set up and pointed to the URL of the function
- Bot announces new quests and reacts to different types of messages, mainly system messages
- See code for more details
