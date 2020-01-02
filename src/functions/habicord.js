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
    const habiticaMessageType = params.chat.info && params.chat.info.type;
    let discordMessage;

    switch (habiticaMessageType) {
      case "quest_start":
        discordMessage = `Get ready for a new adventure!
> ${habiticaMessage}`;
        break;
      case "boss_defeated":
        discordMessage = `Hooray, the boss is defeated and the party remains victorious!
  > ${habiticaMessage}`;
        break;
      case "all_items_found":
        discordMessage = `Congratulations, you have found all items and the quest has ended!
> ${habiticaMessage}`;
        break;
      case "boss_damage":
        if (
          params.chat.info.bossDamage &&
          parseFloat(params.chat.info.bossDamage) > 20
        ) {
          const attackMessage = habiticaMessage.match(/\. (.+\.)`?$/i);
          discordMessage = `Send help, we are taking a beating here!
> ${attackMessage.length ? attackMessage[1] : habiticaMessage}`;
        } else {
          const lowHpCount = await checkPartyHealth();
          if (lowHpCount > 2) {
            discordMessage = `Alert the @Healer! Party needs some :heart:`;
          }
        }
        break;
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

async function checkPartyHealth(lowHpLimit = 25) {
  const members = await fetchPartyMembers();

  return members.map(member => member.stats.hp).filter(hp => hp < lowHpLimit)
    .length;
}

async function fetchPartyMembers() {
  const url =
    process.env.HABITICA_API_URL +
    "/groups/party/members?includeAllPublicFields=true";
  const options = {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      // X-Client header as per instructions here: https://habitica.fandom.com/wiki/Guidance_for_Comrades#X-Client_Header
      "x-client": process.env.HABITICA_X_CLIENT,
      "x-api-user": process.env.HABITICA_USER_ID,
      "x-api-key": process.env.HABITICA_API_KEY
    }
  };

  return fetchJson(url, options).then(response => response.data);
}

async function fetchJson(url, options) {
  //console.log("fetch", { url, options });
  const response = await fetch(url, options);

  if (!response.ok) {
    throw Error(
      `${response.status} ${response.statusText} "${await response.text()}"`
    );
  }

  return response.json();
}
