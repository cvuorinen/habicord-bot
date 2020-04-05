import { handleGroupChatReceived } from "../groupChatReceived";
import { handleQuestActivity } from "../questActivity";

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const params = JSON.parse(event.body);
    console.log(params);

    switch (params.webhookType) {
      case "groupChatReceived":
        return await handleGroupChatReceived(params);
      case "questActivity":
        return await handleQuestActivity(params);
      default:
        console.error(`Unknown webhook type "${params.webhookType}"`);
    }
  } catch (err) {
    console.error(err);
  }

  return { statusCode: 200, body: "{}" };
};
