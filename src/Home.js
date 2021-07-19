import React, { useState } from "react";
import CreateGameForm from "./components/CreateGameForm";
import Amplify from "aws-amplify";
import awsExports from "./aws-exports";
import CssBaseline from "@material-ui/core/CssBaseline";
import Typography from "@material-ui/core/Typography";
import { AppBar, Toolbar, Button, Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import MainAppBar from "./components/MainAppBar";
import { myStyles } from "./styles/componentStyles";

Amplify.configure(awsExports);
const useStyles = makeStyles((theme) => myStyles);

export default function Home() {
  const classes = useStyles();

  const [isDialogVisible, setIsDialogVisible] = useState(false);

  return (
    <div>
      <CssBaseline />
      <MainAppBar />
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
