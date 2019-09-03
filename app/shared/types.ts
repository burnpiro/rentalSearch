import { gumtreeCategories, gumtreeSizeTypes } from "./data";

interface Location {
  value: string;
  label: string;
  name: string;
}

interface Settings {
  location: string;
  sizeType: typeof gumtreeSizeTypes[keyof typeof gumtreeSizeTypes];
  category: keyof typeof gumtreeCategories;
  automaticallyMarkAsSeen: boolean;
  allowNotifications: boolean;
  mode: 'basic' | 'advanced';
  owner: 'private' | 'business' | 'both';
  priceFrom: string | null;
  priceTo: string | null;
  sizeFrom: string | null;
  sizeTo: string | null;
  interval: number;
  olxLink: string[];
  gumtreeLink: string[];
}

interface ListItem {
  img: string | null;
  name: string;
  price: string;
  seen: boolean;
  hashId: string;
  isInFavourites: boolean;
  link: string,
  type: "gumtree" | "olx";
}

interface AppState {
  settings: Settings,
  list: List,
  favourites: List
}

type List = Array<ListItem>;

export {
  Settings,
  Location,
  ListItem,
  List,
  AppState
}