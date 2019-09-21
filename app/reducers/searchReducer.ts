import { ActionType, AppState } from "../shared/types";
import { ACTIONS, defaultSearchData } from "../shared/data";

function reducer(state: AppState, action: ActionType) {
  const { type, payload } = action;
  switch (type) {
    case ACTIONS.ADD_SEARCH:
      return {
        ...state,
        selectedSearch: {
          ...defaultSearchData
        }
      };
    case ACTIONS.SAVE_SEARCH:
      const searchIndex = state.searches.findIndex(search => search.searchId === payload.searchId);
      console.log(payload, state, searchIndex);
      return {
        ...state,
        selectedSearch: null,
        searches: searchIndex > -1 ? state.searches.map( currentSearch => {
          if(currentSearch.searchId === payload.searchId) {
            return payload;
          }
          return currentSearch;
        }) : [
          {
            ...payload
          },
          ...state.searches
        ]
      };
    case ACTIONS.CLEAR_SEARCH:
      return {
        ...state,
        selectedSearch: null
      };
    case ACTIONS.SET_SEARCH:
      return {
        ...state,
        selectedSearch: {
          ...payload
        }
      };
    case ACTIONS.EDIT_SEARCH:
      return {
        ...state,
        selectedSearch: {
          ...state.selectedSearch,
          [payload.name as string]: payload.value
        }
      };
    case ACTIONS.REMOVE_SEARCH:
      return {
        ...state,
        searches: state.searches.filter(fav => fav.searchId !== payload)
      };
    default:
      return state;
  }
}

export default reducer;