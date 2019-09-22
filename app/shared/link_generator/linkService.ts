import { parsedLocations, gumtreeSizeTypes, gumtreeCategories } from "../data";
import { Settings, Location, SearchItem } from "../types";

const categorySpliter = "CatId=";
const locationSpliter = "Location=";

const getLocationByValue = function(value: string) {
  // @ts-ignore
  return parsedLocations.find(location => location.value === value);
};

const getOlxLinkBySettings = function(search: SearchItem): string {
  if (!search.category) {
    search.category = "mieszkania/wynajem";
  }
  let link = "https://olx.pl/nieruchomosci/" + search.category + "/";
  if (search.location !== "" && search.location != null) {
    const currentLocation = getLocationByValue(search.location);
    link += "" + currentLocation.name + "/";
  }
  link += "?";
  if (search.priceTo != null && search.priceTo !== "") {
    link += "search[filter_float_price:to]=" + search.priceTo + "&";
  }
  if (search.priceFrom != null && search.priceFrom !== "") {
    link += "search[filter_float_price:from]=" + search.priceFrom + "&";
  }
  if (search.sizeTo != null && search.sizeTo !== "") {
    link += "search[filter_float_m:to]=" + search.sizeTo + "&";
  }
  if (search.sizeFrom != null && search.sizeFrom !== "") {
    link += "search[filter_float_m:from]=" + search.sizeFrom + "&";
  }
  if (search.category === "stancje-pokoje") {
    if (search.sizeType != null) {
      if (search.sizeType === "four") {
        search.sizeType = "three";
      }
      link += "search[filter_enum_roomsize]=" + search.sizeType + "&";
    }
  } else if (
    search.category === "mieszkania/wynajem" ||
    search.category === "mieszkania/sprzedaz"
  ) {
    if (search.sizeType != null && search.sizeType !== "all") {
      link += "search[filter_enum_rooms]=" + search.sizeType + "&";
    }
  }
  if (search.owner != null && search.owner !== "both") {
    link +=
      "search[private_business]=" +
      (search.owner === "private" ? "private" : "business") +
      "&";
  }
  return link;
};

const getGumtreeLinkBySettings = function(search: SearchItem): string {
  if (!search.category) {
    search.category = "mieszkania/wynajem";
  }
  let link =
    "https://www.gumtree.pl/s-mieszkania-i-domy-do-wynajecia/v1c" +
    gumtreeCategories[search.category] +
    "";
  if (search.location !== "" && search.location != null) {
    const currentLocation = getLocationByValue(search.location);
    link += "l" + currentLocation.value;
  }
  link += "p1?";
  if (
    (search.priceTo != null && search.priceTo !== "") ||
    (search.priceFrom != null && search.priceFrom !== "")
  ) {
    link +=
      "pr=" + (search.priceFrom || "") + "," + (search.priceTo || "") + "&";
  }
  if (
    search.sizeType != null &&
    search.sizeType !== '' &&
    Object.keys(gumtreeSizeTypes).includes(search.sizeType as string) &&
    (search.category === "mieszkania/wynajem" ||
      search.category === "mieszkania/sprzedaz" ||
      search.category === "stancje-pokoje")
  ) {
    link += "nr=" + gumtreeSizeTypes[search.sizeType] + "&";
  }
  if (search.owner != null && search.owner !== "both") {
    link += "fr=" + (search.owner === "private" ? "ownr" : "agncy") + "&";
  }
  return link;
};

export {
  getGumtreeLinkBySettings,
  getOlxLinkBySettings,
  parsedLocations,
  gumtreeCategories,
  gumtreeSizeTypes,
  Settings,
  Location
};
