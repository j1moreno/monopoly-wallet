import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import Cookies from "js-cookie";
import Amplify, { API, graphqlOperation } from "aws-amplify";
import { createGame, createPlayer, updatePlayer } from "./../graphql/mutations";
import { getPlayer } from "./../graphql/queries";
import awsExports from "./../aws-exports";
import { useHistory } from "react-router";
import { Box, Button, CircularProgress, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { myStyles } from "../styles/componentStyles";
Amplify.configure(awsExports);

const useStyles = makeStyles((theme) => myStyles);

const initialState = {
  username: "",
  password: "",
};

export default function CreateGameForm() {
  const classes = useStyles();
  let history = useHistory();

  const [formState, setFormState] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);

  function setInput(key, value) {
    setFormState({ ...formState, [key]: value });
  }

  function inputsAreValid() {
    return !(!formState.username || !formState.password);
  }

  function generateGameId() {
    return uuidv4();
  }

  function setUserId() {
    let userId = uuidv4();
    Cookies.set("userId", userId);
    return userId;
  }

  function getUserId() {
    let userId = Cookies.get("userId");
    if (!userId) {
      userId = setUserId();
    }
    return userId;
  }

  function createNewPlayerData(gameIdToJoin) {
    return {
      id: getUserId(),
      gameId: gameIdToJoin,
      name: formState.username,
      account: 1500,
    };
  }

  function createNewGameData() {
    return {
      id: generateGameId(),
      password: formState.password,
    };
  }

  async function createPlayerOnServer(playerData) {
    try {
      console.log("creating player...");
      let createPlayerResponse = await API.graphql(
        graphqlOperation(createPlayer, { input: playerData })
      );
      console.log(createPlayerResponse);
    } catch (err) {
      console.log("error creating player:", err);
      alert("error creating player!");
    }
  }

  async function updatePlayerOnServer(playerData) {
    try {
      console.log("updating player...");
      let updatePlayerResponse = await API.graphql(
        graphqlOperation(updatePlayer, { input: playerData })
      );
      console.log(updatePlayerResponse);
    } catch (err) {
      console.log("error updating player:", err);
      alert("error updating player!");
    }
  }

  async function playerExistsOnServer(playerId) {
    try {
      console.log("attempting to get player " + playerId);
      let response = await API.graphql(
        graphqlOperation(getPlayer, { id: playerId })
      );
      console.log(response);
      const isValidData = response.data.getPlayer !== null;
      console.log(`valid response: ${isValidData}`);
      return isValidData;
    } catch (err) {
      console.log("error, so not found");
      return false;
    }
  }

  async function upsertPlayerToGame(createdGameId) {
    const playerData = createNewPlayerData(createdGameId);
    if (await playerExistsOnServer(playerData.id)) {
      await updatePlayerOnServer(playerData);
    } else {
      await createPlayerOnServer(playerData);
    }
  }

  const addGame = async () => {
    if (!inputsAreValid()) {
      alert("invalid inputs!");
      return;
    }
    // alert(`username is: ${formState.username}\npwd is: ${formState.password}`)
    try {
      setIsLoading(true);
      const newGameData = createNewGameData();
      console.log("creating game...");
      let createGameResponse = await API.graphql(
        graphqlOperation(createGame, { input: newGameData })
      );
      console.log(createGameResponse);
      const createdGameId = createGameResponse.data.createGame.id;
      console.log("created game id " + createdGameId);
      Cookies.set("username", formState.username);
      console.log("set username to: " + formState.username);
      await upsertPlayerToGame(createdGameId);
      console.log(`redirecting to ${createdGameId}...`);
      history.push(`/${createdGameId}`);
      setIsLoading(false);
    } catch (err) {
      console.log("error creating game or player:", err);
      alert("error creating game or player!");
    }
  };

  return (
    <div>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        m={2}
      >
        <Typography variant="h6" className={classes.boldText}>
          Create Game
        </Typography>
        <Box m={1}>
          <input
            onChange={(event) => setInput("username", event.target.value)}
            value={formState.username}
            placeholder="create a user name"
          />
        </Box>
        <Box m={1}>
          <input
            onChange={(event) => setInput("password", event.target.value)}
            value={formState.password}
            placeholder="create a password"
          />
        </Box>
        <Button
          variant="contained"
          className={classes.button}
          onClick={addGame}
          disabled={!inputsAreValid()}
        >
          Create Game
        </Button>
        {isLoading && <CircularProgress className={classes.progress} />}
      </Box>
    </div>
  );
}
