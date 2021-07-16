import React, { useState } from "react";
import CreateGameForm from "./components/CreateGameForm";
import Amplify from "aws-amplify";
import awsExports from "./aws-exports";
import CssBaseline from "@material-ui/core/CssBaseline";
import Typography from "@material-ui/core/Typography";
import { AppBar, Toolbar, Button, Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

Amplify.configure(awsExports);
const MAIN_COLOR = "#CC2626";
const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
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
  content: {
    align: "center",
  },
  button: {
    background: MAIN_COLOR,
    marginTop: 8,
  },
}));

export default function Home() {
  const classes = useStyles();

  const [isDialogVisible, setIsDialogVisible] = useState(false);

  return (
    <div>
      <CssBaseline />
      <AppBar position="static" className={classes.appBar}>
        <Toolbar className={classes.toolbar}>
          <Typography variant="h5" className={classes.title}>
            Monopoly Wallet
          </Typography>
        </Toolbar>
      </AppBar>

      <div>
        <Box display="flex" alignItems="center" justifyContent="center">
          {!isDialogVisible && (
            <Button
              variant="contained"
              className={classes.button}
              onClick={() => setIsDialogVisible(true)}
            >
              Create Game
            </Button>
          )}
        </Box>
        <Box display="flex" alignItems="center" justifyContent="center">
          {isDialogVisible && <CreateGameForm />}
        </Box>
      </div>
    </div>
  );
}
