import * as React from "react";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import TextField from "@material-ui/core/TextField";
import { localDataTypes, parsedLocations } from "../../shared/data";
import Typography from "@material-ui/core/Typography";
import Switch from "@material-ui/core/Switch";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Fab from "@material-ui/core/Fab";
import Slider from "@material-ui/core/Slider";
import { Settings } from "../../shared/types";
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
      top: theme.spacing(7),
      right: theme.spacing(4)
    }
  })
);

export default function Settings(props: Props) {
  const classes = useStyles(undefined);
  const [hasChanges, setHasChanges] = React.useState(false);
  const [{ settings }, dispatch] = React.useContext(AppStateContext);
  useFetchLocalData(dispatch, localDataTypes.SETTINGS);

  function handleChange(
    event: React.ChangeEvent<{ name?: string; value: unknown }>
  ) {
    const {
      target: { name, value }
    } = event;
    handleSettingChange(ACTIONS.SET_SETTING, name as string, value);
  }
  function handleModeChange() {
    handleSettingChange(
      ACTIONS.SET_SETTING,
      "mode",
      settings.mode === "basic" ? "advanced" : "basic"
    );
  }
  function handleIntervalChange(event, value) {
    handleSettingChange(ACTIONS.SET_SETTING, "interval", value);
  }
  function handleCheckboxChange(event: React.ChangeEvent<HTMLInputElement>) {
    const {
      target: { checked, name }
    } = event;
    handleSettingChange(ACTIONS.SET_SETTING, name, checked);
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
  function saveSettings() {
    sendSetMessage(localDataTypes.SETTINGS, settings, () => {
      setHasChanges(false);
    });
  }

  return (
    <Typography className={classes.root} component="div">
      <FormControlLabel
        className={[classes.formControl, classes.fullWidth].join(" ")}
        control={
          <Switch
            checked={settings.mode === "advanced"}
            onChange={handleModeChange}
            value="checkedA"
          />
        }
        label="Tryb zaawansowany"
      />
      <Fab
        color="primary"
        aria-label="Save settings"
        className={classes.fab}
        onClick={saveSettings}
        disabled={hasChanges === false}
      >
        <i className="material-icons">save</i>
      </Fab>
      <form className={classes.form} autoComplete="off">
        {settings.mode === "advanced" && (
          <React.Fragment>
            <TextField
              label="Olx Link"
              inputProps={{
                name: "olxLink",
                id: "olxLink"
              }}
              multiline
              rowsMax="4"
              value={settings.olxLink}
              onChange={handleChange}
              className={[classes.textField, classes.fullWidth].join(" ")}
              helperText="Cały adres skopiowany z paska adresu przeglądarki z twoim wyszukiwaniem"
              margin="normal"
            />
            <TextField
              label="Gumtree Link"
              inputProps={{
                name: "gumtreeLink",
                id: "gumtreeLink"
              }}
              multiline
              rowsMax="4"
              value={settings.gumtreeLink}
              onChange={handleChange}
              className={[classes.textField, classes.fullWidth].join(" ")}
              helperText="Cały adres skopiowany z paska adresu przeglądarki z twoim wyszukiwaniem"
              margin="normal"
            />
          </React.Fragment>
        )}
        {settings.mode === "basic" && (
          <React.Fragment>
            <FormControl
              className={[classes.formControl, classes.fullWidth].join(" ")}
              error={settings.location == null || settings.location === ""}
            >
              <InputLabel htmlFor="location">Lokalizacja</InputLabel>
              <Select
                native
                value={settings.location}
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
                value={settings.priceFrom}
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
                value={settings.priceTo}
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
                value={settings.sizeFrom}
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
                value={settings.sizeTo}
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
                value={settings.sizeType}
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
                value={settings.owner}
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
            <FormControl
              className={[classes.formControl, classes.fullWidth].join(" ")}
            >
              <InputLabel htmlFor="category">Typ</InputLabel>
              <Select
                native
                value={settings.category}
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
          </React.Fragment>
        )}
        <FormControlLabel
          className={[classes.formControl, classes.fullWidth].join(" ")}
          control={
            <Switch
              onChange={handleCheckboxChange}
              name="automaticallyMarkAsSeen"
              checked={settings.automaticallyMarkAsSeen}
              value={settings.automaticallyMarkAsSeen}
            />
          }
          label="Automatycznie oznaczaj jako obejrzane"
        />
        <FormControlLabel
          className={[classes.formControl, classes.fullWidth].join(" ")}
          control={
            <Switch
              onChange={handleCheckboxChange}
              name="allowNotifications"
              checked={settings.allowNotifications}
              value={settings.allowNotifications}
            />
          }
          label="Pokazuj powiadomienia?"
        />
        <Typography
          id="interval-slider"
          gutterBottom
          className={[classes.formControl, classes.fullWidth].join(" ")}
        >
          Interwał powiadomień [min]
        </Typography>
        <Slider
          className={[classes.formControl, classes.fullWidth].join(" ")}
          aria-label="Interwał powiadomień"
          valueLabelDisplay="auto"
          aria-labelledby="interval-slider"
          min={5}
          max={60}
          step={5}
          onChange={handleIntervalChange}
          value={settings.interval}
          name="interval"
        />
      </form>
    </Typography>
  );
}
