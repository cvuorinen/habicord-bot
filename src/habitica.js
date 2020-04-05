import fetch from "node-fetch";

export const Habitica = {
  fetchPartyMembers: async () => {
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
        "x-api-key": process.env.HABITICA_API_KEY,
      },
    };

    return fetchJson(url, options).then((response) => response.data);
  },
};

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
