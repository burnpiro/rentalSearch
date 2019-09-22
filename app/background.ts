import { List, ListItem, SearchItem, Settings } from "./shared/types";
import {
  ACTIONS,
  defaultSettings,
  gumtreeCategories, gumtreeSizeTypes,
  localDataTypes
} from "./shared/data";
import getUnseen from "./background/getUnseen";
import getDataFromGumtree from "./background/getDataFromGumtree";
import getDataFromOlx from "./background/getDataFromOlx";
import showNotification from "./background/showNotification";
import uuid from 'uuid/v4';

declare const chrome: any;
let interval = null;
let list: List = [];
let favourites: List = [];
let settings: Settings = {
  ...defaultSettings
};
let searches: SearchItem[] = [];
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  switch (request.get) {
    case localDataTypes.LIST:
      sendResponse({ code: 200, payload: list });
      break;
    case localDataTypes.SEARCHES:
      sendResponse({ code: 200, payload: searches });
      break;
    case localDataTypes.FAVOURITES:
      sendResponse({ code: 200, payload: favourites });
      break;
    case localDataTypes.SETTINGS:
      sendResponse({ code: 200, payload: settings });
      break;
  }
  switch (request.set) {
    case ACTIONS.TOGGLE_SEEN:
      if (request.payload != null) {
        list = list.map(el => {
          if (el.hashId === request.payload) {
            el.seen = !el.seen;
          }
          return el;
        });
        chrome.browserAction.setBadgeText({ text: "" + getUnseen(list) + "" });
        setList(list);
      }
      sendResponse({ code: 200 });
      break;
    case ACTIONS.SAVE_SEARCH:
      if (request.payload != null) {
        const search = searches.find(search => search.searchId === request.payload.searchId);
        if(search != null) {
          searches.map(currentSearch => {
            if(currentSearch.searchId === search.searchId) {
              return request.payload;
            }
            return currentSearch;
          })
        } else {
          request.payload.searchId = uuid();
          searches = [
            {
              ...request.payload
            },
            ...searches
          ]
        }
        setSearches(searches);
      }
      sendResponse({ code: 200, payload: request.payload });
      break;
    case ACTIONS.REMOVE_SEARCH:
      if (request.payload != null) {
        searches = searches.filter(search => search.searchId !== request.payload);
        setSearches(searches);
      }
      sendResponse({ code: 200 });
      break;
    case ACTIONS.ADD_TO_FAVOURITES:
      if (request.payload != null) {
        list = list.map(element => {
          if (element.hashId === request.payload.hashId) {
            return {
              ...element,
              isInFavourites: true
            };
          }
          return element;
        });
        if (
          favourites.find(fav => fav.hashId === request.payload.hashId) == null
        ) {
          favourites = [
            ...favourites,
            {
              ...request.payload
            }
          ];
        }
        chrome.browserAction.setBadgeText({ text: "" + getUnseen(list) + "" });
        setList(list);
        setFavourites(favourites);
      }
      sendResponse({ code: 200 });
      break;
    case ACTIONS.REMOVE_FROM_FAVOURITES:
      if (request.payload != null) {
        list = list.map(element => {
          if (element.hashId === request.payload) {
            return {
              ...element,
              isInFavourites: false
            };
          }
          return element;
        });
        favourites = favourites.filter(fav => fav.hashId !== request.payload);
        chrome.browserAction.setBadgeText({ text: "" + getUnseen(list) + "" });
        setList(list);
        setFavourites(favourites);
      }
      sendResponse({ code: 200 });
      break;
    case ACTIONS.ALL_SEEN:
      if (settings.automaticallyMarkAsSeen === true) {
        list = list.map(el => {
          el.seen = true;
          return el;
        });
        chrome.browserAction.setBadgeText({ text: "" + getUnseen(list) + "" });
        setList(list);
        sendResponse({ code: 200, payload: true });
      } else {
        sendResponse({ code: 200, payload: false });
      }
      break;
    case localDataTypes.SETTINGS:
      setSettings(request.payload);
      loadNewData();
      clearInterval(interval);
      interval = startInterval(request.payload.interval);
      sendResponse({ code: 200 });
      break;
  }
});

const setSettings = function(newSettings: Settings) {
  chrome.storage.sync.set({ settings: newSettings }, function() {
    settings = newSettings;
    loadNewData();
  });
};

const getSettings = function() {
  chrome.storage.sync.get(localDataTypes.SETTINGS, function(storedSettings: {
    settings: Settings | undefined;
  }) {
    if (storedSettings.settings == null) {
      setSettings(settings);
    } else {
      settings = storedSettings.settings;
    }
  });
};

const setList = function(newList: ListItem[]) {
  chrome.storage.local.set({ list: newList }, function() {
    list = newList;
  });
};

const getList = function() {
  chrome.storage.local.get(localDataTypes.LIST, function(storedData: {
    list: List | undefined;
  }) {
    if (storedData.list != null) {
      list = storedData.list;
    }
  });
};

const setSearches = function(newSearches: SearchItem[]) {
  chrome.storage.sync.set({ searches: newSearches }, function() {
    searches = newSearches;
  });
};

const getSearches = function() {
  chrome.storage.sync.get(localDataTypes.SEARCHES, function(storedData: {
    searches: SearchItem[] | undefined;
  }) {
    if (storedData.searches != null) {
      searches = storedData.searches;
    }
  });
};

const setFavourites = function(newFavourites: ListItem[]) {
  chrome.storage.sync.set({ favourites: newFavourites }, function() {
    favourites = newFavourites;
  });
};

const getFavourites = function() {
  chrome.storage.sync.get(localDataTypes.FAVOURITES, function(storedData: {
    favourites: List | undefined;
  }) {
    if (storedData.favourites != null) {
      favourites = storedData.favourites;
    }
  });
};

function checkIfNotOnCurrentList(el): boolean {
  return list.find(currentEl => currentEl.hashId === el.hashId) == null;
}

function checkIfInFav(el): boolean {
  return favourites.find(currentEl => currentEl.hashId === el.hashId) != null;
}

function mapToFav(el) {
  return {
    ...el,
    isInFavourites: checkIfInFav(el)
  };
}

async function loadNewData() {
  const [gumtreeData, olxData] = await Promise.all([
    getDataFromGumtree(settings),
    getDataFromOlx(settings)
  ]);
  list = [...gumtreeData.map(mapToFav), ...olxData.map(mapToFav)];

  chrome.browserAction.setBadgeText({ text: "" + getUnseen(list) + "" });

  //limit number of elements on list array (storage limitation)
  if (list.length > 500) {
    list = list.reduce((acc, el, index) => {
      if (index < 500) {
        acc.push(el);
      }
      return acc;
    }, []);
  }

  setList(list);

  if (getUnseen(list) > 0 && settings.allowNotifications) {
    showNotification({
      title: getUnseen(list) + " Nowe ogłoszenie/a",
      message: "Masz nieprzeczytane ogłoszenia zgodne z twoimi kryteriami"
    });
  }
}

async function loadExtraData() {
  const [gumtreeData, olxData] = await Promise.all([
    getDataFromGumtree(settings),
    getDataFromOlx(settings)
  ]) as [ListItem[], ListItem[]];

  const newGumtreeItems = gumtreeData.filter(checkIfNotOnCurrentList).map(mapToFav);
  const newOlxItems = olxData.filter(checkIfNotOnCurrentList).map(mapToFav);

  list = [
    ...newGumtreeItems,
    ...newOlxItems,
    ...list
  ];

  //limit number of elements on list array (storage limitation)
  if (list.length > 500) {
    list = list.reduce((acc, el, index) => {
      if (index < 500) {
        acc.push(el);
      }
      return acc;
    }, []);
  }

  chrome.browserAction.setBadgeText({ text: "" + getUnseen(list) + "" });

  setList(list);

  if ((newGumtreeItems.length + newOlxItems.length) > 0 && settings.allowNotifications) {
    showNotification({
      title: (newGumtreeItems.length + newOlxItems.length) + " Nowe ogłoszenie/a",
      message: "Masz nieprzeczytane ogłoszenia zgodne z twoimi kryteriami"
    });
  }
}

function startInterval(time: number): any {
  return setInterval(function() {
    loadExtraData();
  }, time * 60 * 1000);
}

function init() {
  getSettings();
  convertSettingsToSearch();
  getSearches();
  getList();
  getFavourites();

  setTimeout(() => {
    loadExtraData();
  }, 2000);

  interval = startInterval(settings.interval);
}

function convertSettingsToSearch() {
  if(settings.gumtreeLink != null && searches.length === 0) {
    searches = [
      ...searches,
      {
        searchId: uuid(),
        location: settings.location,
        sizeType: settings.sizeType,
        category: settings.category,
        type: 'both',
        mode: settings.mode,
        owner: settings.owner,
        priceFrom: settings.priceFrom,
        priceTo: settings.priceTo,
        sizeFrom: settings.sizeFrom,
        sizeTo: settings.sizeTo,
        olxLink: settings.olxLink,
        gumtreeLink: settings.gumtreeLink,
      }
    ]
    setSearches(searches);
  }
}

init();
