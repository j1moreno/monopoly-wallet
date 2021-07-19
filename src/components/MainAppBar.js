import React, { useState } from "react";
import Typography from "@material-ui/core/Typography";
import { AppBar, Toolbar, Button, Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const MAIN_COLOR = "#CC2626";
const useStyles = makeStyles((theme) => ({
  appBar: {
    background: MAIN_COLOR,
    alignItems: "center",
  },
  toolbar: {
    // align: "center",
  },
  title: {
    // align: "center",
  },
}));

const MainAppBar = () => {
  const classes = useStyles();
  return (
    <AppBar position="static" className={classes.appBar}>
      <Toolbar className={classes.toolbar}>
        <Typography variant="h5" className={classes.title}>
          Monopoly Wallet
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default MainAppBar;
