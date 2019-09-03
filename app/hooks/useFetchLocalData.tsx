import * as React from "react";
import { useEffect } from "react";
import { ACTIONS } from "./AppState";
import { sendGetMessage, sendMessage } from "../background/api";

const useFetchLocalData = (dispatch, dataType: string) => {
  useEffect(() => {
    sendGetMessage(dataType, function(response) {
      dispatch({
        type: ACTIONS.SET,
        payload: { name: dataType, value: response.payload }
      });
    });
  }, []);
};

export default useFetchLocalData;
