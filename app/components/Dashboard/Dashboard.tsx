import * as React from "react";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import { ACTIONS, AppStateContext } from "../../hooks/AppState";
import { createStyles, makeStyles, Theme } from "@material-ui/core";
import PropertyListItem from "../PropertyListItem/PropertyListItem";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import Link from "@material-ui/core/Link";
import useFetchLocalData from "../../hooks/useFetchLocalData";
import { localDataTypes } from "../../shared/data";
import useMarkAllAsSeen from "../../hooks/useMarkAllAsSeen";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: "100%",
      backgroundColor: theme.palette.background.paper
    }
  })
);

export default function Dashboard() {
  const classes = useStyles(undefined);

  const [{ list, settings }, dispatch] = React.useContext(AppStateContext);

  useFetchLocalData(dispatch, localDataTypes.LIST, settings);
  useMarkAllAsSeen(dispatch);

  const markAsSeen = (hashId: string) => {
    dispatch({
      type: ACTIONS.TOGGLE_SEEN,
      payload: hashId
    });
  };
  const addToFavourites = (hashId: string) => {
    dispatch({
      type: ACTIONS.ADD_TO_FAVOURITES,
      payload: hashId
    });
  };
  const removeFromFavourites = (hashId: string) => {
    dispatch({
      type: ACTIONS.REMOVE_FROM_FAVOURITES,
      payload: hashId
    });
  };

  return (
    <List dense className={classes.root}>
      {list.length > 0 &&
        list.map((property, index) => {
          return (
            <React.Fragment key={property.hashId}>
              {index > 0 && <Divider variant="inset" component="li" />}
              <PropertyListItem
                key={property.hashId}
                {...property}
                onSeen={markAsSeen}
                onAddToFavourites={
                  property.isInFavourites
                    ? removeFromFavourites
                    : addToFavourites
                }
              />
            </React.Fragment>
          );
        })}
      {list.length === 0 && (
        <Typography variant="body2" color="textSecondary" align="center">
          {"Brak nieruchomości do wyświetlenia"}
        </Typography>
      )}
    </List>
  );
}
