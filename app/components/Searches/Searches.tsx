import * as React from "react";
import { createStyles, makeStyles, Theme } from "@material-ui/core";
import { ACTIONS, AppStateContext } from "../../hooks/AppState";
import MUIList from "@material-ui/core/List";
import { List } from "react-virtualized";
import Divider from "@material-ui/core/Divider";
import Typography from "@material-ui/core/Typography";
import useFetchLocalData from "../../hooks/useFetchLocalData";
import { localDataTypes, parsedLocations } from "../../shared/data";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import IconButton from "@material-ui/core/IconButton";
import SearchForm from "./SearchForm";
import Fab from "@material-ui/core/Fab";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import { sendSetMessage } from "../../background/api";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: "100%",
      backgroundColor: theme.palette.background.paper,
      maxHeight: 550
    },
    form: {
      display: "flex",
      flexWrap: "wrap"
    },
    formControl: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
      minWidth: 120
    },
    selectEmpty: {
      marginTop: theme.spacing(2)
    },
    textField: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1)
    },
    fullWidth: {
      minWidth: "calc(100% - 16px)"
    },
    fieldGrid: {
      display: "grid",
      gridTemplateColumns: "auto auto"
    },
    fab: {
      position: "absolute",
      top: -theme.spacing(2),
      right: theme.spacing(4),
      zIndex: 1100
    },
    inline: {
      display: "inline"
    },
    avatar: {
      margin: 10,
      width: 80,
      height: 80
    },
    content: {
      paddingRight: theme.spacing(3)
    },
    logoContainer: {
      paddingRight: theme.spacing(1)
    },
    typeLogo: {
      height: 40,
      width: 45
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

export default function Searches() {
  const classes = useStyles(undefined);
  const [{ searches, selectedSearch }, dispatch] = React.useContext(
    AppStateContext
  );
  useFetchLocalData(dispatch, localDataTypes.SEARCHES);

  const addSearch = () => {
    dispatch({
      type: ACTIONS.ADD_SEARCH
    });
  };
  const editSearch = (searchId: string) => {
    dispatch({
      type: ACTIONS.SET_SEARCH,
      payload: searches.find(search => search.searchId === searchId)
    });
  };
  const removeSearch = (searchId: string) => {
    sendSetMessage(ACTIONS.REMOVE_SEARCH, searchId, () => {
      dispatch({
        type: ACTIONS.REMOVE_SEARCH,
        payload: searchId
      });
    });
  };

  const renderRow = function({
    key,
    index,
    isScrolling,
    isVisible,
    style
  }: renderRowProps) {
    const search = searches[index];
    const location = parsedLocations.find(
      location => location.value === search.location
    );
    return (
      <div style={style} key={key}>
        {index > 0 && <Divider variant="inset" component="li" />}
        <ListItem
          alignItems="center"
          dense
          button
          component="a"
          onClick={() => editSearch(search.searchId)}
        >
          <ListItemAvatar className={classes.logoContainer}>
            {search.type !== "olx" && (
              <img src="img/gumtree_logo.png" className={classes.typeLogo} />
            )}
            {search.type !== "gumtree" && (
              <img src="img/olx_logo.png" className={classes.typeLogo} />
            )}
          </ListItemAvatar>
          {search.mode === "basic" && (
            <ListItemText
              primary={
                location != null
                  ? `${location.label} - ${search.category}`
                  : "Brak zdefiniowanej lokalizacji"
              }
              className={classes.content}
              secondary={
                <React.Fragment>
                  <Typography
                    component="span"
                    variant="body2"
                    className={classes.inline}
                    color="textPrimary"
                  >
                    {`Cena: ${search.priceFrom || 0} - ${search.priceTo ||
                      "Max"}, Rozmiar: ${search.sizeFrom ||
                      0} - ${search.sizeTo || "Max"}`}
                  </Typography>
                </React.Fragment>
              }
            />
          )}
          {search.mode === "advanced" && (
            <ListItemText
              primary="Wyszukiwanie z linku"
              className={classes.content}
            />
          )}
          <ListItemSecondaryAction>
            <IconButton
              edge="end"
              aria-label="delete"
              onClick={() => removeSearch(search.searchId)}
            >
              <i className="material-icons">delete</i>
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      </div>
    );
  };

  return (
    <React.Fragment>
      {selectedSearch == null && (
        <MUIList dense className={classes.root}>
          {searches.length === 0 && (
            <Typography variant="body2" color="textSecondary" align="center">
              {"Nie masz jeszcze żadnych zapisanych wyszukiwań"}
            </Typography>
          )}
          <Fab
            color="primary"
            aria-label="Add search"
            className={classes.fab}
            onClick={addSearch}
          >
            <i className="material-icons">add_circle_outline</i>
          </Fab>
          <List
            height={530}
            width={600}
            rowCount={searches.length}
            rowHeight={64}
            rowRenderer={renderRow}
          />
        </MUIList>
      )}
      {selectedSearch != null && <SearchForm />}
    </React.Fragment>
  );
}
