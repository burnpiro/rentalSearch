import { parsedLocations, gumtreeSizeTypes, gumtreeCategories } from "../data";
import { Settings, Location } from "../types";

const categorySpliter = "CatId=";
const locationSpliter = "Location=";

const getLocationByValue = function(value: string) {
  // @ts-ignore
  return parsedLocations.find(location => location.value === value);
};

const getOlxLinkBySettings = function(settings: Settings): string[] {
  if (!settings.category) {
    settings.category = "mieszkania/wynajem";
  }
  let link = "https://olx.pl/nieruchomosci/" + settings.category + "/";
  if (settings.location !== "" && settings.location != null) {
    const currentLocation = getLocationByValue(settings.location);
    link += "" + currentLocation.name + "/";
  }
  link += "?";
  if (settings.priceTo != null && settings.priceTo !== "") {
    link += "search[filter_float_price:to]=" + settings.priceTo + "&";
  }
  if (settings.priceFrom != null && settings.priceFrom !== "") {
    link += "search[filter_float_price:from]=" + settings.priceFrom + "&";
  }
  if (settings.sizeTo != null && settings.sizeTo !== "") {
    link += "search[filter_float_m:to]=" + settings.sizeTo + "&";
  }
  if (settings.sizeFrom != null && settings.sizeFrom !== "") {
    link += "search[filter_float_m:from]=" + settings.sizeFrom + "&";
  }
  if (settings.category === "stancje-pokoje") {
    if (settings.sizeType != null) {
      if (settings.sizeType === "four") {
        settings.sizeType = "three";
      }
      link += "search[filter_enum_roomsize]=" + settings.sizeType + "&";
    }
  } else if (
    settings.category === "mieszkania/wynajem" ||
    settings.category === "mieszkania/sprzedaz"
  ) {
    if (settings.sizeType != null && settings.sizeType !== "all") {
      link += "search[filter_enum_rooms]=" + settings.sizeType + "&";
    }
  }
  if (settings.owner != null && settings.owner !== "both") {
    link +=
      "search[private_business]=" +
      (settings.owner === "private" ? "private" : "business") +
      "&";
  }
  return [link];
};

const getGumtreeLinkBySettings = function(settings: Settings): string[] {
  if (!settings.category) {
    settings.category = "mieszkania/wynajem";
  }
  let link =
    "https://www.gumtree.pl/s-mieszkania-i-domy-do-wynajecia/v1c" +
    gumtreeCategories[settings.category] +
    "";
  if (settings.location !== "" && settings.location != null) {
    const currentLocation = getLocationByValue(settings.location);
    link += "l" + currentLocation.value;
  }
  link += "p1?";
  if (
    (settings.priceTo != null && settings.priceTo !== "") ||
    (settings.priceFrom != null && settings.priceFrom !== "")
  ) {
    link +=
      "pr=" + (settings.priceFrom || "") + "," + (settings.priceTo || "") + "&";
  }
  if (
    settings.sizeType != null &&
    settings.sizeType !== '' &&
    (settings.category === "mieszkania/wynajem" ||
      settings.category === "mieszkania/sprzedaz" ||
      settings.category === "stancje-pokoje")
  ) {
    link += "nr=" + gumtreeSizeTypes[settings.sizeType] + "&";
  }
  if (settings.owner != null && settings.owner !== "both") {
    link += "fr=" + (settings.owner === "private" ? "ownr" : "agncy") + "&";
  }
  return [link];
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
