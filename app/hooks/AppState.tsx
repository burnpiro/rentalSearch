import * as React from "react";
import { defaultSettings, ACTIONS } from "../shared/data";
import { useReducer } from "react";
import { ActionType, AppState, AppStateContextType } from "../shared/types";
import listReducer from "../reducers/listReducer";
import favouriteReducer from "../reducers/favouriteReducer";
import settingsReducer from "../reducers/settingsReducer";
import searchReducer from "../reducers/searchReducer";

const defaultAppState: AppState = {
  settings: {
    ...defaultSettings
  },
  list: [],
  favourites: [],
  searches: [],
  selectedSearch: null
};

function reducer(state: AppState, action: ActionType) {
  return [listReducer, favouriteReducer, settingsReducer, searchReducer].reduce(
    (currentState, reducer) => reducer(currentState, action),
    state
  );
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
