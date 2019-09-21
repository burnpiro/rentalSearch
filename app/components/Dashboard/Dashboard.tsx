import * as React from "react";
import Typography from "@material-ui/core/Typography";
import { ACTIONS, AppStateContext } from "../../hooks/AppState";
import { createStyles, makeStyles, Theme } from "@material-ui/core";
import PropertyListItem from "../PropertyListItem/PropertyListItem";
import MUIList from "@material-ui/core/List";
import { List } from "react-virtualized";
import Divider from "@material-ui/core/Divider";
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

interface renderRowProps {
  key: string;
  index: number;
  isScrolling: boolean;
  isVisible: boolean;
  style: any;
}

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

  const renderRow = function({
    key,
    index,
    isScrolling,
    isVisible,
    style
  }: renderRowProps) {
    const property = list[index];
    return (
      <div style={style} key={key}>
        {index > 0 && <Divider variant="inset" component="li" />}
        <PropertyListItem
          {...property}
          onSeen={markAsSeen}
          onAddToFavourites={
            property.isInFavourites ? removeFromFavourites : addToFavourites
          }
        />
      </div>
    );
  };

  return (
    <MUIList dense className={classes.root}>
      {list.length === 0 && (
        <Typography variant="body2" color="textSecondary" align="center">
          {"Brak nieruchomości do wyświetlenia"}
        </Typography>
      )}
      <List
        height={530}
        width={600}
        rowCount={list.length}
        rowHeight={140}
        rowRenderer={renderRow}
      />
    </MUIList>
  );
}
