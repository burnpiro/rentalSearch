import * as React from "react";
import { createStyles, makeStyles, Theme } from "@material-ui/core";
import { ACTIONS, AppStateContext } from "../../hooks/AppState";
import MUIList from "@material-ui/core/List";
import { List } from "react-virtualized";
import Divider from "@material-ui/core/Divider";
import PropertyListItem from "../PropertyListItem/PropertyListItem";
import Typography from "@material-ui/core/Typography";
import useFetchLocalData from "../../hooks/useFetchLocalData";
import { localDataTypes } from "../../shared/data";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: "100%",
      backgroundColor: theme.palette.background.paper
    }
  })
);

interface renderRowProps {
  key: string;
  index: number;
  isScrolling: boolean;
  isVisible: boolean;
  style: any;
}

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

  const renderRow = function({
    key,
    index,
    isScrolling,
    isVisible,
    style
  }: renderRowProps) {
    const property = favourites[index];
    return (
      <div style={style} key={key}>
        {index > 0 && <Divider variant="inset" component="li" />}
        <PropertyListItem
          {...property}
          isInFavourites={true}
          onAddToFavourites={removeFromFavourites}
        />
      </div>
    );
  };

  return (
    <MUIList dense className={classes.root}>
      {favourites.length === 0 && (
        <Typography variant="body2" color="textSecondary" align="center">
          {"Brak nieruchomości do wyświetlenia"}
        </Typography>
      )}
      <List
        height={530}
        width={600}
        rowCount={favourites.length}
        rowHeight={110}
        rowRenderer={renderRow}
      />
    </MUIList>
  );
}
