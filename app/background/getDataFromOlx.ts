import { ListItem, SearchItem } from "../shared/types";
import { getOlxLinkBySettings } from "../shared/link_generator/linkService";

const getDataFromOlx = async (searches: SearchItem[]) => {
  const promises = searches.filter(search => search.type !== 'gumtree').map(search => {
    const link =
      search.mode === "advanced"
        ? search.olxLink
        : getOlxLinkBySettings(search);
    if (!link) {
      return {};
    }
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
  return responses.reduce(async (acc, response) => {
    // @ts-ignore
    return [...(await acc), ...(await parseResponseData(response))];
  }, []);
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
    const img =
      offer.querySelector("a.linkWithHash img") != null
        ? offer.querySelector("a.linkWithHash img").getAttribute("src")
        : null;
    // @ts-ignore innerText exists in chrome
    const price = offer
      .querySelector("p.price strong") != null ? offer
      .querySelector("p.price strong")
      .innerText.replace(/^(?=\n)$|^\s*|\s*$|\n\n+/gm, "") : 'brak ceny';

    return <ListItem>{
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
