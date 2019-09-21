import * as React from "react";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import { localDataTypes } from "../../shared/data";
import Typography from "@material-ui/core/Typography";
import Switch from "@material-ui/core/Switch";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Fab from "@material-ui/core/Fab";
import Slider from "@material-ui/core/Slider";
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
      top: theme.spacing(3),
      right: theme.spacing(4),
      zIndex: 1100
    }
  })
);

export default function Settings(props: Props) {
  const classes = useStyles(undefined);
  const [hasChanges, setHasChanges] = React.useState(false);
  const [{ settings }, dispatch] = React.useContext(AppStateContext);
  useFetchLocalData(dispatch, localDataTypes.SETTINGS);

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
