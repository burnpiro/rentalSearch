import { ActionType, AppState } from "../shared/types";
import { ACTIONS } from "../shared/data";

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
    default:
      return state;
  }
}

export default reducer;