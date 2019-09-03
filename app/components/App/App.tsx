import * as React from "react";
import { makeStyles } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import TabPanel from "../TabPanel/TabPanel";
import Dashboard from "../Dashboard/Dashboard";
import Settings from "../Settings/Settings";
import Link from "@material-ui/core/Link";
import Typography from "@material-ui/core/Typography";
import { AppStateProvider } from "../../hooks/AppState";
import Favourites from "../Favourites/Favourites";

const useStyles = makeStyles(theme => ({
  appBar: {
    position: "relative",
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper
  },
  layout: {
    width: "auto",
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    maxHeight: "530px",
    paddingBottom: "20px",
    overflowY: "scroll"
  },
  copyright: {
    position: "absolute",
    width: "100%",
    bottom: 0,
    backgroundColor: theme.palette.background.paper
  }
}));

function Copyright() {
  const classes = useStyles(undefined);
  return (
    <Typography
      variant="body2"
      color="textSecondary"
      align="center"
      className={classes.copyright}
    >
      {"Copyright © "}
      <Link color="inherit" href="https://erdem.pl/" target="_blank">
        Kemal Erdem
      </Link>{" "}
      {new Date().getFullYear()}
    </Typography>
  );
}

function a11yProps(index) {
  return {
    id: `tab-${index}`,
    "aria-controls": `tabpanel-${index}`
  };
}

export default function App() {
  const classes = useStyles(undefined);
  const [value, setValue] = React.useState(0);

  function handleChange(event: React.ChangeEvent<{}>, newValue: number) {
    setValue(newValue);
  }

  return (
    <React.Fragment>
      <CssBaseline />
      <AppBar position="sticky" color="default" className={classes.appBar}>
        <Tabs value={value} onChange={handleChange} aria-label="Mode switch">
          <Tab label="Lista" {...a11yProps(0)} />
          <Tab label="Ulubione" {...a11yProps(1)} />
          <Tab label="Ustawienia" {...a11yProps(2)} />
        </Tabs>
      </AppBar>
      <AppStateProvider>
        <main className={classes.layout}>
          <TabPanel value={value} index={0}>
            <Dashboard />
          </TabPanel>
          <TabPanel value={value} index={1}>
            <Favourites />
          </TabPanel>
          <TabPanel value={value} index={2}>
            <Settings />
          </TabPanel>
        </main>
        <Copyright />
      </AppStateProvider>
    </React.Fragment>
  );
}
