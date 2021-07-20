import React, { useState } from "react";
import CreateGameForm from "./components/CreateGameForm";
import Amplify from "aws-amplify";
import awsExports from "./aws-exports";
import CssBaseline from "@material-ui/core/CssBaseline";
import Typography from "@material-ui/core/Typography";
import { AppBar, Toolbar, Button, Box, Container } from "@material-ui/core";
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
      <Container maxWidth="xs">
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
        >
          <div>
            <Typography variant="h6">
              Create a game and track player accounts and transactions. <br />{" "}
              Play Monopoly without counting cash.
            </Typography>
          </div>
          <div>
            <CreateGameForm />
          </div>
        </Box>
      </Container>
    </div>
  );
}
