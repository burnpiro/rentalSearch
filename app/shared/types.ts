import { gumtreeCategories, gumtreeSizeTypes } from "./data";

interface Location {
  value: string;
  label: string;
  name: string;
}

interface Settings {
  automaticallyMarkAsSeen: boolean;
  allowNotifications: boolean;
  interval: number;
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

interface SearchItem {
  searchId?: string,
  location: string;
  sizeType: typeof gumtreeSizeTypes[keyof typeof gumtreeSizeTypes];
  category: keyof typeof gumtreeCategories;
  type: 'gumtree' | 'olx' | 'both';
  mode: 'basic' | 'advanced';
  owner: 'private' | 'business' | 'both';
  priceFrom: string | null;
  priceTo: string | null;
  sizeFrom: string | null;
  sizeTo: string | null;
  olxLink: string;
  gumtreeLink: string;
}

interface AppState {
  settings: Settings,
  list: List,
  favourites: List,
  searches: SearchItem[],
  selectedSearch: SearchItem | null
}

type ActionType = {
  type: string,
  payload: any
}


type AppStateContextType = [
  AppState,
  (ActionType) => void
]
type List = Array<ListItem>;

export {
  Settings,
  Location,
  ListItem,
  List,
  AppState,
  AppStateContextType,
  ActionType,
  SearchItem
}