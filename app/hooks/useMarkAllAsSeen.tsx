import * as React from "react";
import { useEffect } from "react";
import { ACTIONS } from "./AppState";
import { sendSetMessage } from "../background/api";

const useMarkAllAsSeen = (dispatch) => {
  useEffect(() => {
    sendSetMessage(ACTIONS.ALL_SEEN, null,function(response) {
      if(response.payload && response.code === 200) {
        dispatch({
          type: ACTIONS.ALL_SEEN
        });
      }
    });
  }, []);
};

export default useMarkAllAsSeen;
