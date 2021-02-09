import fetch from "node-fetch";
import { Discord } from "./discord";

export async function handleQuestActivity(params) {
  /**
   * Format of the incoming params:
   * {
   *    type: 'questInvited',
   *    group: {
   *      id: 'uuid-of-the-guild',
   *      name: 'Guild Name'
   *    },
   *    quest: {
   *      key: 'quest',
   *    },
   *    webhookType: 'questActivity',
   *    user: { _id: 'uuid-of-the-webhook-owner-user' }
   * }
   */
  try {
    if (!params || !params.type) {
      return { statusCode: 400, body: "Bad Request" };
    }

    switch (params.type) {
      case "questFinished":
        await callGoogleScript(params);
        break;
      case "questInvited":
        await Discord.sendMessage(
          "Hello adventurers! New quest is up, @everyone please join."
        );
        break;
    }
  } catch (err) {
    console.error(err);
  }

  return { statusCode: 200, body: "{}" };
}

function callGoogleScript(params) {
  const options = {
    method: "POST",
    body: JSON.stringify(params),
    headers: {
      "Content-Type": "application/json",
    },
  };

  // need to await even though we don't need the response, otherwise it just doesn't work
  return fetch(process.env.GOOGLE_SCRIPT_URL, options);
}
