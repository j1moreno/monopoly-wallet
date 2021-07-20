import React from "react";
import { useState, useEffect } from "react";
import Amplify, { API, graphqlOperation } from "aws-amplify";
import { getGame, getPlayer } from "./../graphql/queries";
import {
  updatePlayer,
  updateGame,
  addEventToGame,
} from "./../graphql/mutations";
import Cookies from "js-cookie";
import { onUpdatePlayer, onUpdateGame } from "./../graphql/subscriptions";
import MainAppBar from "./MainAppBar";
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
  Paper,
  Drawer,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Slider,
  TextField,
  InputAdornment,
  IconButton,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogActions,
  DialogTitle,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import { makeStyles } from "@material-ui/core/styles";
import { myStyles, MAIN_COLOR } from "../styles/componentStyles";

const useStyles = makeStyles((theme) => myStyles);

const initialData = {
  id: "fetching...",
  players: {
    items: [],
  },
};

const initialPlayerData = {
  id: "fetching...",
  account: 10000,
};

export default function GameDataDisplay(props) {
  const classes = useStyles();
  // state *********************************************************
  const [gameData, setGameData] = useState(initialData);
  const [playerData, setPlayerData] = useState(initialPlayerData);
  const [showTransact, setShowTransact] = useState(false);
  const [transactType, setTransactType] = useState("");
  const [transactAmount, setTransactAmount] = useState(0);
  const [transactPartners, setTransactPartners] = useState([]);
  const [events, setEvents] = useState([]);
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  // helper - server *******************************************
  async function getGameData() {
    console.log(`getting game data...`);
    try {
      let response = await API.graphql(
        graphqlOperation(getGame, { id: props.gameId })
      );
      console.log(response);
      return response.data.getGame;
    } catch (err) {
      console.log(`error getting game data:`);
      console.log(err);
      return {};
    }
  }

  async function getPlayerData(playerId) {
    console.log(`getting player data for id ${playerId}`);
    try {
      let response = await API.graphql(
        graphqlOperation(getPlayer, { id: playerId })
      );
      console.log(response);
      removeExtraFieldsFromPlayerData(response.data.getPlayer);
      return response.data.getPlayer;
    } catch (err) {
      console.log("error getting player data");
    }
  }

  async function publishEvent(gameId, message) {
    console.log("logging game event..");
    let newData = {
      id: gameId,
      message: message,
    };
    try {
      let response = await API.graphql(
        graphqlOperation(addEventToGame, { input: newData })
      );
      console.log(`done! Here's the response`);
      console.log(response);
    } catch (err) {
      console.log(`error adding event!`);
      console.log(err);
    }
  }

  async function updatePlayerDataOnServer(updateData) {
    console.log(
      `updating player data on server for player ${updateData.id}...`
    );
    try {
      let response = await API.graphql(
        graphqlOperation(updatePlayer, { input: updateData })
      );
      console.log(response);
      console.log("done");
    } catch (err) {
      console.log("error updating player data");
      console.log(err);
    }
  }

  // helper - local *******************************************
  function getUserId() {
    return Cookies.get("userId");
  }

  function updateTransactPartners(event) {
    console.log("updating transact partners!");
    console.log(event.target.name);
    console.log(`${event.target.name} checked: ${event.target.checked}`);
    let newValues = event.target.checked
      ? [...transactPartners, event.target.name]
      : [...transactPartners].filter((element) => element != event.target.name);
    console.log(`new values are: ${newValues}`);
    setTransactPartners(newValues);
  }

  function getPlayerIdByName(name) {
    for (const player of gameData.players.items) {
      if (player.name == name) return player.id;
    }
    return null;
  }

  function removeExtraFieldsFromPlayerData(data) {
    delete data.createdAt;
    delete data.updatedAt;
  }

  const handleSliderChange = (event, newValue) => {
    setTransactAmount(newValue);
  };

  function transactInputsAreValid() {
    let isAmountInRange = transactAmount <= getTransactMax();
    return (
      typeof transactAmount === "number" &&
      transactAmount > 0 &&
      isAmountInRange &&
      transactPartners.length > 0
    );
  }

  function getTransactMax() {
    if (transactType === "Pay") {
      return playerData.account;
    } else {
      // when collecting, can't collect more than the min account in selected players
      let selectedPlayers = gameData.players.items.filter((p) =>
        transactPartners.includes(p.name)
      );
      if (selectedPlayers.length === 0) {
        return playerData.account;
      } else {
        return Math.min(...selectedPlayers.map((p) => p.account));
      }
    }
  }

  // onLoad *******************************************
  useEffect(async () => {
    let fetchedGameData = await getGameData();
    setGameData(fetchedGameData);
    let fetchedPlayerData = await getPlayerData(getUserId());
    setPlayerData(fetchedPlayerData);
    const enterMessage = `${fetchedPlayerData.name} has entered the game!`;
    publishEvent(props.gameId, enterMessage);
    if (fetchedGameData.players.items.length < 2) {
      setShowInviteDialog(true);
    }
  }, []);

  // subscribe to events
  useEffect(async () => {
    // Subscribe to update of game data
    const gameSubscription = API.graphql(
      graphqlOperation(onUpdateGame, { id: props.gameId })
    ).subscribe({
      next: (newGameData) => {
        console.log(`Game update:`);
        console.log(newGameData.value.data.onUpdateGame);
        let lastEvent = newGameData.value.data.onUpdateGame.events.pop();
        console.log(lastEvent);
        // Do something with the data
        processEvent(lastEvent);
        // refresh game data players in case someone joined
        setGameData({
          id: newGameData.value.data.onUpdateGame.id,
          players: newGameData.value.data.onUpdateGame.players,
        });
      },
    });
    // Stop receiving data updates from the subscription
    return () => {
      console.log(`Unsubscribing from game events...`);
      gameSubscription.unsubscribe();
    };
  }, []);

  useEffect(async () => {
    // Subscribe to update of playerData
    const subscription = API.graphql(
      graphqlOperation(onUpdatePlayer, { id: getUserId() })
    ).subscribe({
      next: (newPlayerData) => {
        console.log(`something happened to me!!`);
        console.log(newPlayerData);
        removeExtraFieldsFromPlayerData(
          newPlayerData.value.data.onUpdatePlayer
        );
        setPlayerData(newPlayerData.value.data.onUpdatePlayer);
      },
    });
    // Stop receiving data updates from the subscription
    return () => {
      console.log(`Unsubscribing from player events...`);
      subscription.unsubscribe();
    };
  }, []);

  // onTransact *******************************************
  async function completeTransaction() {
    const flow = transactType == "Pay" ? 1 : -1;
    const preposition = transactType == "Pay" ? "to" : "from";
    let data, newAccount, updateData;
    for (const partner of transactPartners) {
      let message = `${playerData.name} ${transactType} ${preposition} ${partner} $${transactAmount}`;
      if (partner != "Bank") {
        data = await getPlayerData(getPlayerIdByName(partner));
        newAccount = data.account + flow * transactAmount;
        updateData = { id: data.id, account: newAccount };
        await updatePlayerDataOnServer(updateData);
      }
      await publishEvent(props.gameId, message);
    }
    // update self
    newAccount =
      playerData.account - flow * transactAmount * transactPartners.length;
    await updatePlayerDataOnServer({ ...playerData, account: newAccount });
    // hide view
    setShowTransact(false);
    // reset transact partners
    setTransactPartners([]);
  }

  // onReceiveEvent *****************************************
  function processEvent(newEvent) {
    console.log(`processing message...\n${newEvent}`);
    setEvents((events) => [...events, newEvent]);
    console.log(`events list now reads:`);
    console.log(events);
  }

  function getTransactMessage() {
    if (transactType == "Pay") {
      return "Who would you like to pay?";
    } else {
      return "Who would you like to collect from?";
    }
  }

  // *********************************************************

  const TransactAction = () => {
    return (
      <Drawer
        anchor="bottom"
        classes={{ paper: classes.transactDrawer }}
        open={showTransact}
        onClose={(event) => setShowTransact(false)}
      >
        <IconButton
          aria-label="close"
          className={classes.closeButton}
          onClick={(event) => setShowTransact(false)}
        >
          <CloseIcon />
        </IconButton>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          m={2}
        >
          <Typography variant="h6" className={classes.boldText}>
            {getTransactMessage()}
          </Typography>
          <h5>Choose Player(s):</h5>
          <div>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    className={classes.checkbox}
                    color="default"
                    checked={transactPartners.includes("Bank")}
                    onChange={updateTransactPartners}
                    name="Bank"
                  />
                }
                label="Bank"
              />
              {gameData.players.items
                .filter((e) => e.id != playerData.id)
                .map((player, i) => (
                  <FormControlLabel
                    key={i}
                    control={
                      <Checkbox
                        className={classes.checkbox}
                        color="default"
                        checked={transactPartners.includes(player.name)}
                        onChange={updateTransactPartners}
                        name={player.name}
                      />
                    }
                    label={player.name}
                  />
                ))}
            </FormGroup>
          </div>
          <Box mt={4}></Box>
          <Typography variant="h6" className={classes.boldText}>
            How much?
          </Typography>
          <div>
            <TextField
              value={transactAmount}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">$</InputAdornment>
                ),
              }}
              className={classes.amountField}
              inputProps={{
                style: { textAlign: "right" },
              }}
              onChange={(event) => {
                setTransactAmount(
                  event.target.value === "" ? "" : Number(event.target.value)
                );
              }}
              helperText={
                transactType === "Collect" && transactAmount > getTransactMax()
                  ? "One or more players can't afford to pay!"
                  : ""
              }
            />
            <Slider
              className={classes.slider}
              onChange={handleSliderChange}
              value={typeof transactAmount === "number" ? transactAmount : 0}
              min={0}
              max={playerData.account}
              classes={{
                thumb: classes.sliderThumb,
              }}
            />
          </div>
          <Box mt={4}></Box>
          <div>
            <Button
              className={classes.button}
              onClick={completeTransaction}
              disabled={!transactInputsAreValid()}
            >
              Confirm {transactType}
            </Button>
          </div>
        </Box>
      </Drawer>
    );
  };

  return (
    <div>
      <MainAppBar />
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        m={2}
      >
        <Typography variant="h6" className={classes.boldText}>
          My Account:
        </Typography>
        <Typography variant="h6" className={classes.boldText}>
          ${playerData.account}
        </Typography>
        <Button
          className={classes.button}
          onClick={() => {
            setTransactType("Pay");
            setShowTransact(true);
          }}
        >
          Pay
        </Button>
        <Button
          className={classes.button}
          onClick={async () => {
            let fetchedGameData = await getGameData();
            setGameData(fetchedGameData);
            setTransactType("Collect");
            setShowTransact(true);
          }}
        >
          Collect
        </Button>
        {TransactAction()}
        <Box mt={4}>
          <Typography variant="h6" className={classes.boldText}>
            Events
          </Typography>
        </Box>
        <TableContainer component={Paper} className={classes.eventTable}>
          <Table>
            <TableBody>
              {[...events].reverse().map((event, i) => (
                <TableRow key={i}>
                  <TableCell align="center">{event}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <Dialog open={showInviteDialog}>
        <DialogTitle>Welcome!</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Looks like you're the only player here. Invite other players by
            sharing this URL + password!
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            style={{ color: MAIN_COLOR }}
            onClick={() => setShowInviteDialog(false)}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
