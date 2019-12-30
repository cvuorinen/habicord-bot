# habicord-bot

Serverless function that connects a Habitica webhook to a Discord webhook

Runs as a serverless lambda function on [Netlify](https://www.netlify.com/docs/functions/).

Features:

- Webhook (`type: groupChatReceived`) needs to be set up and pointed to the URL of the function
- Bot reacts to different types of messages, currently mainly system messages
  - See code at [habicord.js](src/functions/habicord.js) for more details
