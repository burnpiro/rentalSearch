import { List, ListItem, Settings } from "./shared/types";
import {
  ACTIONS,
  defaultSettings,
  gumtreeCategories,
  localDataTypes
} from "./shared/data";
import getUnseen from "./background/getUnseen";
import getDataFromGumtree from "./background/getDataFromGumtree";
import getDataFromOlx from "./background/getDataFromOlx";
import showNotification from "./background/showNotification";

declare const chrome: any;
let interval = null;
let list: List = [];
let favourites: List = [];
let settings: Settings = {
  ...defaultSettings
};
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  switch (request.get) {
    case localDataTypes.LIST:
      sendResponse({ code: 200, payload: list });
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
  list.slice(0, 500);

  setList(list);

  if (getUnseen(list) > 0 && settings.allowNotifications) {
    showNotification({
      title: getUnseen(list) + " Nowe ogłoszenia",
      message: "Masz nieprzeczytane ogłoszenia zgodne z twoimi kryteriami"
    });
  }
}

async function loadExtraData() {
  const [gumtreeData, olxData] = await Promise.all([
    getDataFromGumtree(settings),
    getDataFromOlx(settings)
  ]);

  list = [
    ...gumtreeData.filter(checkIfNotOnCurrentList).map(mapToFav),
    ...list
  ];
  list = [...olxData.filter(checkIfNotOnCurrentList).map(mapToFav), ...list];

  //limit number of elements on list array (storage limitation)
  list.slice(0, 500);

  chrome.browserAction.setBadgeText({ text: "" + getUnseen(list) + "" });

  setList(list);

  if (getUnseen(list) > 0 && settings.allowNotifications) {
    showNotification({
      title: getUnseen(list) + " Nowe ogłoszenia",
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
  getList();
  getFavourites();
  loadExtraData();

  interval = startInterval(settings.interval);
}

init();
