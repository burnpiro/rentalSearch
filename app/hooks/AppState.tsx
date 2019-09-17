import * as React from "react";
import { defaultSettings, ACTIONS } from "../shared/data";
import { useReducer, useState } from "react";
import { ActionType, AppState, AppStateContextType } from "../shared/types";
import { sendSetMessage } from "../background/api";

const defaultAppState: AppState = {
  settings: {
    ...defaultSettings
  },
  list: [],
  favourites: []
};

function reducer(state: AppState, action: ActionType) {
  const { type, payload } = action;
  switch (type) {
    case ACTIONS.SET:
      return {
        ...state,
        [payload.name as string]: payload.value
      };
    case ACTIONS.SET_SETTING:
      return {
        ...state,
        settings: {
          ...state.settings,
          [payload.name as string]: payload.value
        }
      };
    case ACTIONS.TOGGLE_SEEN:
      sendSetMessage(ACTIONS.TOGGLE_SEEN, payload, () => {});
      return {
        ...state,
        list: state.list.map(element => {
          if (element.hashId === payload) {
            return {
              ...element,
              seen: !element.seen
            };
          }
          return element;
        })
      };
    case ACTIONS.ALL_SEEN:
      sendSetMessage(ACTIONS.TOGGLE_SEEN, payload, () => {});
      return {
        ...state,
        list: state.list.map(element => ({
          ...element,
          seen: true
        }))
      };
    case ACTIONS.ADD_TO_FAVOURITES:
      sendSetMessage(
        ACTIONS.ADD_TO_FAVOURITES,
        {
          ...state.list.find(el => el.hashId === payload)
        },
        () => {}
      );
      const el = state.list.find(el => el.hashId === payload);
      return {
        ...state,
        list: state.list.map(element => {
          if (element.hashId === payload) {
            return {
              ...element,
              isInFavourites: true
            };
          }
          return element;
        }),
        favourites: [
          el != null
            ? {
                ...el,
                isInFavourites: true
              }
            : undefined,
          ...state.favourites
        ]
      };
    case ACTIONS.REMOVE_FROM_FAVOURITES:
      sendSetMessage(ACTIONS.REMOVE_FROM_FAVOURITES, payload, () => {});
      return {
        ...state,
        list: state.list.map(element => {
          if (element.hashId === payload) {
            return {
              ...element,
              isInFavourites: false
            };
          }
          return element;
        }),
        favourites: state.favourites.filter(fav => fav.hashId !== payload)
      };
    default:
      throw new Error();
  }
}

const AppStateContext = React.createContext<AppStateContextType>([
  defaultAppState,
  () => {}
]);

const AppStateProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, defaultAppState);

  return (
    <AppStateContext.Provider value={[state, dispatch]}>
      {children}
    </AppStateContext.Provider>
  );
};

export { AppStateContext, AppStateProvider, ACTIONS };
