import * as React from "react";
import { useEffect } from "react";
import { ACTIONS } from "./AppState";
import { sendGetMessage } from "../background/api";

const useFetchLocalData = (dispatch, dataType: string, watch?: any) => {
  useEffect(() => {
    sendGetMessage(dataType, function(response) {
      dispatch({
        type: ACTIONS.SET,
        payload: { name: dataType, value: response.payload }
      });
    });
  }, [watch]);
};

export default useFetchLocalData;
