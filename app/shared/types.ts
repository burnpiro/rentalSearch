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
  type: "gumtree" | "olx";
}

interface OLXList {
  items: ListItem[];
}

interface GumtreeList {
  items: ListItem[];
}

type List = Array<ListItem>;

interface Favourites {
  items: ListItem[];
}

export {
  Settings,
  Location,
  ListItem,
  List,
  Favourites
}