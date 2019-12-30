import fetch from "node-fetch";

exports.handler = async function(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const params = JSON.parse(event.body);
    console.log(params);

    /**
     * Format of the incoming params:
     * {
     *    group: {
     *      id: 'uuid-of-the-guild',
     *      name: 'Guild Name'
     *    },
     *    chat: {
     *      id: 'uuid-of-the-message',
     *      text: 'Message text',
     *      unformattedText?: 'Unformatted message text',
     *      timestamp: '2019-01-01T01:01:01.599Z',
     *      uuid: 'uuid-of-the-sender-user OR system',
     *      user?: 'Sender display name',
     *      username?: 'Sender username',
     *      info?: {
     *          type: 'spell_cast_party',
     *          user: 'Caster display name',
     *          class: 'class',
     *          spell: 'spellName'
     *      }
     *      ...
     *    },
     *    webhookType: 'groupChatReceived',
     *    user: { _id: 'uuid-of-the-webhook-owner-user' }
     * }
     */
    if (!params || !params.chat || !params.chat.text || !params.chat.uuid) {
      return { statusCode: 400, body: "Bad Request" };
    }

    if (params.chat.uuid !== "system") {
      // nothing to do since currently only interested in system messages
      return { statusCode: 200, body: "OK" };
    }

    const habiticaMessage = params.chat.unformattedText || params.chat.text;
    let discordMessage;

    if (habiticaMessage.match(/^`?You defeated/i)) {
      //console.log(`Matched "You defeated" in "${habiticaMessage}"`);
      discordMessage = `Hooray, the quest has ended and the party remains victorious!
> ${habiticaMessage}`;
    } else if (habiticaMessage.match(/^`?Your quest.+has started\.`?$/i)) {
      //console.log(`Matched "Your quest ... has started." in "${habiticaMessage}"`);
      discordMessage = `Get ready for a new adventure!
> ${habiticaMessage}`;
    }

    if (discordMessage) {
      console.log(
        `Sending message to Discord "${discordMessage}"
        in reaction to Habitica message "${habiticaMessage}"`
      );
      await sendDiscordMessage(discordMessage);
    }
  } catch (err) {
    console.error(err);
  }

  return {
    statusCode: 200,
    body: "OK"
  };
};

async function sendDiscordMessage(content) {
  const options = {
    method: "POST",
    body: JSON.stringify({ content }),
    headers: {
      "Content-Type": "application/json"
    }
  };

  const response = await fetch(process.env.DISCORD_WEBHOOK_URL, options);
  //console.log(`Sent message to Discord "${content}"`, { options, response });

  if (!response.ok) {
    throw Error(
      `${response.status} ${response.statusText} "${await response.text()}"`
    );
  }
}
