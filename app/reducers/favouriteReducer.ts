import { ActionType, AppState } from "../shared/types";
import { ACTIONS } from "../shared/data";
import { sendSetMessage } from "../background/api";

function reducer(state: AppState, action: ActionType) {
  const { type, payload } = action;
  switch (type) {
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
      return state;
  }
}

export default reducer;