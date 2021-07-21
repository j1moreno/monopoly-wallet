import React from "react";
import { useParams } from "react-router-dom";
import Amplify, { API, graphqlOperation } from "aws-amplify";
import { getGame, getPlayer } from "./graphql/queries";
import { createPlayer, updatePlayer } from "./graphql/mutations";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import GameDataDisplay from "./components/GameDataDisplay";
import { v4 as uuidv4 } from "uuid";
import { Box, Button, Typography, Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { myStyles, MAIN_COLOR } from "./styles/componentStyles";
import MainAppBar from "./components/MainAppBar";

const USER_IN_GAME = 0;
const INVALID_GAME_ID = 1;
const NEED_PASSWORD = 2;
const INCORRECT_PASSWORD = 3;
const LOADING_DATA = 4;

const useStyles = makeStyles((theme) => myStyles);

export default function Game() {
  let { id } = useParams();

  const classes = useStyles();

  const [gameState, setGameState] = useState(LOADING_DATA);

  const UserGameData = <div>User is in Game!</div>;
  const InvalidGameId = <div>Game ID is invalid!</div>;
  const ProgressIndicator = <div>Loading Data...</div>;

  // ***************************************************************
  const initialState = {
    username: "",
    password: "",
  };

  const [formState, setFormState] = useState(initialState);

  function setInput(key, value) {
    setFormState({ ...formState, [key]: value });
  }
  const PasswordPrompt = (isRetry) => {
    return (
      <div>
        <MainAppBar />
        <Box
          className={classes.passwordEnter}
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
        >
          <Typography
            variant="h6"
            className={classes.headerText}
            style={{
              marginTop: 32,
              marginLeft: 64,
              marginRight: 64,
              fontWeight: "bold",
            }}
          >
            Choose a user name and enter the game password
          </Typography>

          <input
            onChange={(event) => setInput("username", event.target.value)}
            value={formState.username}
            placeholder="create a user name"
            style={{ marginTop: 32 }}
          />
          <input
            onChange={(event) => setInput("password", event.target.value)}
            value={formState.password}
            placeholder="enter game password"
            style={{ marginTop: 24 }}
          />
          <Button
            className={classes.button}
            onClick={validatePassword}
            style={{ margin: 32 }}
          >
            Submit
          </Button>
          {isRetry && (
            <div style={{ color: MAIN_COLOR }}>Incorrect Password!</div>
          )}
        </Box>
      </div>
    );
  };
  // ***************************************************************
  async function validatePassword() {
    let response = await API.graphql(graphqlOperation(getGame, { id: id }));
    console.log(response);
    console.log(formState.password);
    if (formState.password == response.data.getGame.password) {
      await addUserToGame();
      setGameState(USER_IN_GAME);
    } else {
      setGameState(INCORRECT_PASSWORD);
    }
  }

  function createNewPlayerData() {
    return {
      id: Cookies.get("userId"),
      gameId: id,
      name: formState.username,
      account: 1500,
    };
  }

  async function isPlayerOnServer() {
    console.log(`is player on server?...`);
    let response = await API.graphql(
      graphqlOperation(getPlayer, { id: getUserId() })
    );
    console.log(response);
    return response.data.getPlayer != null;
  }

  async function createPlayerOnServer() {
    console.log(`createing new player data on server...`);
    const createData = createNewPlayerData();
    let createResponse = await API.graphql(
      graphqlOperation(createPlayer, { input: createData })
    );
    console.log(createResponse);
  }

  async function updatePlayerOnServer() {
    console.log(`updating player data...`);
    const updateData = createNewPlayerData();
    let updateResponse = await API.graphql(
      graphqlOperation(updatePlayer, { input: updateData })
    );
    console.log(updateResponse);
  }

  async function addUserToGame() {
    if (!(await isPlayerOnServer())) {
      await createPlayerOnServer();
    } else {
      await updatePlayerOnServer();
    }
  }

  async function gameIdExists(id) {
    let response = await API.graphql(graphqlOperation(getGame, { id: id }));
    console.log(response);
    return !(response.data.getGame == null);
  }

  function userExists() {
    let userId = Cookies.get("userId");
    console.log("current userID: " + userId);
    return userId != undefined;
  }

  function getUserId() {
    return Cookies.get("userId");
  }

  async function userIsInGame() {
    const playerId = getUserId();
    console.log(`checking if player is in game, id: ${playerId}`);
    let response = await API.graphql(
      graphqlOperation(getPlayer, { id: playerId })
    );
    console.log(response);
    if (response.data.getPlayer == null) return false;
    let isInGame = response.data.getPlayer.gameId == id;
    console.log(`player in game: ${isInGame}`);
    return isInGame;
  }

  function setUserId() {
    let userId = uuidv4();
    Cookies.set("userId", userId);
    return userId;
  }

  async function determineGameState() {
    let newState = INVALID_GAME_ID;
    if (await gameIdExists(id)) {
      if (await userExists()) {
        if (await userIsInGame(id)) {
          newState = USER_IN_GAME;
        } else {
          newState = NEED_PASSWORD;
        }
      } else {
        console.log("creating userId...");
        console.log("new userID: " + setUserId());
        newState = NEED_PASSWORD;
      }
    }
    setGameState(newState);
  }

  useEffect(determineGameState, []);

  function displayData() {
    switch (gameState) {
      case USER_IN_GAME:
        return <GameDataDisplay gameId={id} />;
      case NEED_PASSWORD:
        return PasswordPrompt(false);
      case INCORRECT_PASSWORD:
        return PasswordPrompt(true);
      case INVALID_GAME_ID:
        return InvalidGameId;
      default:
        return ProgressIndicator;
    }
  }

  return <div>{displayData()}</div>;
}
