import * as React from "react";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import TextField from "@material-ui/core/TextField";
import {
  localDataTypes,
  parsedLocations,
  searchTypes
} from "../../shared/data";
import Typography from "@material-ui/core/Typography";
import Switch from "@material-ui/core/Switch";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Fab from "@material-ui/core/Fab";
import { sizeTypes, owners, categories } from "../../shared/data";
import { ACTIONS, AppStateContext } from "../../hooks/AppState";
import useFetchLocalData from "../../hooks/useFetchLocalData";
import { sendSetMessage } from "../../background/api";

interface Props {
  children?: React.ReactNode;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: "flex",
      flexWrap: "wrap",
      overflowY: "scroll",
      paddingBottom: theme.spacing(4),
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
      top: theme.spacing(3),
      right: theme.spacing(12),
      zIndex: 1100
    },
    closeButton: {
      right: theme.spacing(4)
    }
  })
);

export default function SearchForm(props: Props) {
  const classes = useStyles(undefined);
  const [hasChanges, setHasChanges] = React.useState(false);
  const [{ selectedSearch }, dispatch] = React.useContext(AppStateContext);
  useFetchLocalData(dispatch, localDataTypes.SETTINGS);

  function handleChange(
    event: React.ChangeEvent<{ name?: string; value: unknown }>
  ) {
    const {
      target: { name, value }
    } = event;
    handleSettingChange(ACTIONS.EDIT_SEARCH, name as string, value);
  }
  function handleModeChange() {
    handleSettingChange(
      ACTIONS.EDIT_SEARCH,
      "mode",
      selectedSearch.mode === "basic" ? "advanced" : "basic"
    );
  }

  function handleSettingChange(type, name, value) {
    setHasChanges(true);
    dispatch({
      type: type,
      payload: {
        name: name,
        value: value
      }
    });
  }
  function saveSearch() {
    sendSetMessage(ACTIONS.SAVE_SEARCH, selectedSearch, response => {
      setHasChanges(false);
      dispatch({
        type: ACTIONS.SAVE_SEARCH,
        payload: response.payload
      });
    });
  }
  function cancelSearch() {
    dispatch({
      type: ACTIONS.CLEAR_SEARCH
    });
  }

  return (
    <Typography className={classes.root} component="div">
      <FormControl
        className={[classes.formControl, classes.fullWidth].join(" ")}
      >
        <InputLabel htmlFor="owner">Strona</InputLabel>
        <Select
          native
          value={selectedSearch.type}
          onChange={handleChange}
          fullWidth
          inputProps={{
            name: "type",
            id: "type"
          }}
        >
          {searchTypes.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </FormControl>
      <FormControlLabel
        className={[classes.formControl, classes.fullWidth].join(" ")}
        control={
          <Switch
            checked={selectedSearch.mode === "advanced"}
            onChange={handleModeChange}
            value="checkedA"
          />
        }
        label="Tryb zaawansowany"
      />
      <Fab
        color="primary"
        aria-label="Save search"
        className={classes.fab}
        onClick={saveSearch}
        disabled={hasChanges === false}
      >
        <i className="material-icons">save</i>
      </Fab>
      <Fab
        color="secondary"
        aria-label="Close edit"
        className={[classes.fab, classes.closeButton].join(' ')}
        onClick={cancelSearch}
      >
        <i className="material-icons">close</i>
      </Fab>
      <form className={classes.form} autoComplete="off">
        {selectedSearch.mode === "advanced" && (
          <React.Fragment>
            {selectedSearch.type !== searchTypes[1].value && (
              <TextField
                label="Olx Link"
                inputProps={{
                  name: "olxLink",
                  id: "olxLink"
                }}
                multiline
                rowsMax="4"
                value={selectedSearch.olxLink}
                onChange={handleChange}
                className={[classes.textField, classes.fullWidth].join(" ")}
                helperText="Cały adres skopiowany z paska adresu przeglądarki z twoim wyszukiwaniem"
                margin="normal"
              />
            )}
            {selectedSearch.type !== searchTypes[2].value && (
              <TextField
                label="Gumtree Link"
                inputProps={{
                  name: "gumtreeLink",
                  id: "gumtreeLink"
                }}
                multiline
                rowsMax="4"
                value={selectedSearch.gumtreeLink}
                onChange={handleChange}
                className={[classes.textField, classes.fullWidth].join(" ")}
                helperText="Cały adres skopiowany z paska adresu przeglądarki z twoim wyszukiwaniem"
                margin="normal"
              />
            )}
          </React.Fragment>
        )}
        {selectedSearch.mode === "basic" && (
          <React.Fragment>
            <FormControl
              className={[classes.formControl, classes.fullWidth].join(" ")}
            >
              <InputLabel htmlFor="category">Typ</InputLabel>
              <Select
                native
                value={selectedSearch.category}
                onChange={handleChange}
                fullWidth
                inputProps={{
                  name: "category",
                  id: "category"
                }}
              >
                {categories.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl
              className={[classes.formControl, classes.fullWidth].join(" ")}
              error={
                selectedSearch.location == null ||
                selectedSearch.location === ""
              }
            >
              <InputLabel htmlFor="location">Lokalizacja</InputLabel>
              <Select
                native
                value={selectedSearch.location}
                onChange={handleChange}
                fullWidth
                inputProps={{
                  name: "location",
                  id: "location"
                }}
              >
                <option value="" />
                {parsedLocations.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </FormControl>
            <Typography
              component="div"
              role="fieldgroup"
              className={classes.fieldGrid}
            >
              <TextField
                id="priceFrom"
                label="Cena Min"
                className={classes.textField}
                value={selectedSearch.priceFrom}
                onChange={handleChange}
                inputProps={{
                  name: "priceFrom",
                  id: "priceFrom"
                }}
              />
              <TextField
                id="priceTo"
                label="Cena Max"
                className={classes.textField}
                value={selectedSearch.priceTo}
                onChange={handleChange}
                inputProps={{
                  name: "priceTo",
                  id: "priceTo"
                }}
              />
              <TextField
                id="sizeFrom"
                label="Pow. Od"
                className={classes.textField}
                value={selectedSearch.sizeFrom}
                onChange={handleChange}
                inputProps={{
                  name: "sizeFrom",
                  id: "sizeFrom"
                }}
                helperText="Tylko OLX"
              />
              <TextField
                id="sizeTo"
                label="Pow. Do"
                className={classes.textField}
                value={selectedSearch.sizeTo}
                onChange={handleChange}
                inputProps={{
                  name: "sizeTo",
                  id: "sizeTo"
                }}
                helperText="Tylko OLX"
              />
            </Typography>
            <FormControl
              className={[classes.formControl, classes.fullWidth].join(" ")}
            >
              <InputLabel htmlFor="sizeType">Pokoje</InputLabel>
              <Select
                native
                value={selectedSearch.sizeType}
                onChange={handleChange}
                fullWidth
                inputProps={{
                  name: "sizeType",
                  id: "sizeType"
                }}
              >
                {sizeTypes.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl
              className={[classes.formControl, classes.fullWidth].join(" ")}
            >
              <InputLabel htmlFor="owner">Wystawia</InputLabel>
              <Select
                native
                value={selectedSearch.owner}
                onChange={handleChange}
                fullWidth
                inputProps={{
                  name: "owner",
                  id: "owner"
                }}
              >
                {owners.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </FormControl>
          </React.Fragment>
        )}
      </form>
    </Typography>
  );
}
