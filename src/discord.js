import fetch from "node-fetch";

export const healerMention = `<@&${process.env.DISCORD_HEALER_ROLE_ID}>`;
export const Discord = {
  sendMessage: async (content) => {
    const options = {
      method: "POST",
      body: JSON.stringify({ content }),
      headers: {
        "Content-Type": "application/json",
      },
    };

    const response = await fetch(process.env.DISCORD_WEBHOOK_URL, options);
    //console.log(`Sent message to Discord "${content}"`, { options, response });

    if (!response.ok) {
      throw Error(
        `${response.status} ${response.statusText} "${await response.text()}"`
      );
    }
  },
};
