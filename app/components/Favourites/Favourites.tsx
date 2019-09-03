import * as React from "react";
import { createStyles, makeStyles, Theme } from "@material-ui/core";
import { ACTIONS, AppStateContext } from "../../hooks/AppState";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import PropertyListItem from "../PropertyListItem/PropertyListItem";
import Typography from "@material-ui/core/Typography";
import useFetchLocalData from "../../hooks/useFetchLocalData";
import { localDataTypes } from "../../shared/data";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    width: "100%",
    backgroundColor: theme.palette.background.paper
  })
);

export default function Favourites() {
  const classes = useStyles(undefined);
  const [{ favourites }, dispatch] = React.useContext(AppStateContext);
  useFetchLocalData(dispatch, localDataTypes.FAVOURITES);

  const removeFromFavourites = (hashId: string) => {
    dispatch({
      type: ACTIONS.REMOVE_FROM_FAVOURITES,
      payload: hashId
    });
  };

  return (
    <List dense className={classes.root}>
      {favourites.length > 0 &&
        favourites.map((property, index) => {
          return (
            <React.Fragment key={property.hashId}>
              {index > 0 && <Divider variant="inset" component="li" />}
              <PropertyListItem
                key={property.hashId}
                {...property}
                isInFavourites={true}
                onAddToFavourites={removeFromFavourites}
              />
            </React.Fragment>
          );
        })}
      {favourites.length === 0 && (
        <Typography variant="body2" color="textSecondary" align="center">
          {"Brak nieruchomości do wyświetlenia"}
        </Typography>
      )}
    </List>
  );
}
