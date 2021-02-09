import { Habitica } from "./habitica";
import { Discord, healerMention } from "./discord";

export async function handleGroupChatReceived(params) {
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
  try {
    if (!params || !params.chat || !params.chat.text || !params.chat.uuid) {
      return { statusCode: 400, body: "Bad Request" };
    }

    if (params.chat.uuid !== "system") {
      // nothing to do since currently only interested in system messages
      return { statusCode: 200, body: "{}" };
    }

    const habiticaMessage = params.chat.unformattedText || params.chat.text;
    const habiticaMessageType = params.chat.info && params.chat.info.type;
    let discordMessage;

    switch (habiticaMessageType) {
      case "quest_start":
        discordMessage = `Get ready for a new adventure!
> ${habiticaMessage}`;
        if (habiticaMessage.indexOf("Lost Masterclasser") > 0) {
          discordMessage = `It's Anti'zinnya :scream: Everyone take care!
> ${habiticaMessage}`;
        }
        break;
      case "boss_defeated":
        discordMessage = `Hooray, the boss is defeated and the party remains victorious!
> ${habiticaMessage}`;
        break;
      case "all_items_found":
        discordMessage = `Congratulations, you have found all items and the quest has ended!
> ${habiticaMessage}`;
        break;
      case "boss_rage":
        discordMessage = `Beware brave adventurers!
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
            discordMessage = `${healerMention}s alert! Party needs some :heart:`;
          }
        }
        break;
    }

    if (discordMessage) {
      console.log(
        `Sending message to Discord "${discordMessage}"
          in reaction to Habitica message "${habiticaMessage}"`
      );
      await Discord.sendMessage(discordMessage);
    }
  } catch (err) {
    console.error(err);
  }

  return {
    statusCode: 200,
    body: "{}",
  };
}

async function checkPartyHealth(lowHpLimit = 25) {
  const members = await Habitica.fetchPartyMembers();

  return members
    .map((member) => member.stats.hp)
    .filter((hp) => hp < lowHpLimit).length;
}
