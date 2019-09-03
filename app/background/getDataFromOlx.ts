import { ListItem, Settings } from "../shared/types";
import { getOlxLinkBySettings } from "../shared/link_generator/linkService";

const getDataFromOlx = async (settings: Settings) => {
  const olxLink =
    settings.mode === "advanced"
      ? settings.olxLink
      : getOlxLinkBySettings(settings);
  if (!olxLink) {
    return false;
  }

  const promises = olxLink.map(link => {
    return fetch(link, {
      headers: {
        Origin: "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Origin": "*"
      }
    });
  });

  const responses = await Promise.all(promises);

  // @ts-ignore
  const olxData = responses.reduce(async (acc, response) => {
    return [...acc, ...(await parseResponseData(response))];
  }, []);

  return olxData;
};

const parseResponseData = async (data): Promise<ListItem[]> => {
  const olxPage = await data.text();
  const parser = new DOMParser();
  const htmlDocument = parser.parseFromString(olxPage, "text/html");
  const offers = htmlDocument.documentElement.querySelectorAll(
    "#offers_table div.offer-wrapper"
  );

  return [...offers].map(offer => {
    const hashId = offer.querySelector("table").getAttribute("data-id");
    const name = offer.querySelector(".title-cell strong").innerHTML;
    const link = `${offer
      .querySelector("a.linkWithHash")
      .getAttribute("href")}`;
    const img = offer
      .querySelector("a.linkWithHash img") != null ? offer
      .querySelector("a.linkWithHash img")
      .getAttribute("src") : null;
    // @ts-ignore innerText exists in chrome
    const price = offer.querySelector("p.price strong").innerText.replace(/^(?=\n)$|^\s*|\s*$|\n\n+/gm,"");

    return {
      hashId,
      name,
      link,
      img,
      price,
      seen: false,
      isInFavourites: false,
      type: "olx"
    };
  });
};

export default getDataFromOlx;
