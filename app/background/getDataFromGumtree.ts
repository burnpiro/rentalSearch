import { ListItem, Settings } from "../shared/types";
import { getGumtreeLinkBySettings } from "../shared/link_generator/linkService";

const getDataFromGumtree = async (settings: Settings) => {
  const gumtreeLink =
    settings.mode === "advanced"
      ? settings.gumtreeLink.split("\n")
      : getGumtreeLinkBySettings(settings);
  if (!gumtreeLink) {
    return false;
  }

  const promises = gumtreeLink.map(link => {
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
  const gumtreeData = responses.reduce(async (acc, response) => {
    // @ts-ignore
    return [...(await acc), ...(await parseResponseData(response))];
  }, []);

  return gumtreeData;
};

const parseResponseData = async (data): Promise<ListItem[]> => {
  const gumtreePage = await data.text();
  const parser = new DOMParser();
  const htmlDocument = parser.parseFromString(gumtreePage, "text/html");
  const offers = htmlDocument.documentElement.querySelectorAll(
    " :not(.topAdsContainer) > .tileV1"
  );

  return [...offers].map(offer => {
    const hashId = offer.querySelector(".addAdTofav").getAttribute("data-adid");
    const name = offer.querySelector(".title > a").innerHTML;
    const link = `https://www.gumtree.pl${offer
      .querySelector(".title > a")
      .getAttribute("href")}`;
    const img = offer
      .querySelector(".tile-img-section img") != null ? offer
      .querySelector(".tile-img-section img")
      .getAttribute("data-src") : null;
    // @ts-ignore innerText exists in chrome
    const price = offer.querySelector(".price-text").innerText.replace(/^(?=\n)$|^\s*|\s*$|\n\n+/gm,"");

    return {
      hashId,
      name,
      link,
      img,
      price,
      seen: false,
      isInFavourites: false,
      type: "gumtree"
    };
  });
};

export default getDataFromGumtree;
