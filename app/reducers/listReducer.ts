import { ActionType, AppState } from "../shared/types";
import { ACTIONS } from "../shared/data";
import { sendSetMessage } from "../background/api";

function reducer(state: AppState, action: ActionType) {
  const { type, payload } = action;
  switch (type) {
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
    default:
      return state;
  }
}

export default reducer;