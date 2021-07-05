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

const initialData = {
  id: "fetching...",
  players: [],
};

const initialPlayerData = {
  id: "fetching...",
  account: 10000,
};

export default function GameDataDisplay(props) {
  // state *********************************************************
  const [gameData, setGameData] = useState(initialData);
  const [playerData, setPlayerData] = useState(initialPlayerData);
  const [showTransact, setShowTransact] = useState(false);
  const [transactType, setTransactType] = useState("");
  const [transactAmount, setTransactAmount] = useState(0);
  const [transactPartners, setTransactPartners] = useState([]);
  const [events, setEvents] = useState([]);

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
    console.log(event.target);
    console.log(`${event.target.id} checked: ${event.target.checked}`);
    let newValues = event.target.checked
      ? [...transactPartners, event.target.id]
      : [...transactPartners].filter((element) => element != event.target.id);
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

  // onLoad *******************************************
  useEffect(async () => {
    let fetchedGameData = await getGameData();
    setGameData(fetchedGameData);
    let fetchedPlayerData = await getPlayerData(getUserId());
    setPlayerData(fetchedPlayerData);
    const enterMessage = `${fetchedPlayerData.name} has entered the game!`;
    publishEvent(props.gameId, enterMessage);
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
      if (partner != "bank") {
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

  // *********************************************************

  const TransactAction = () => {
    return (
      <div>
        <h4>{transactType}</h4>
        <h5>Choose Player(s):</h5>
        <div>
          <input
            type="checkbox"
            id="bank"
            name="bank"
            onChange={updateTransactPartners}
          />
          <label htmlFor="bank">Bank</label>
        </div>
        {gameData.players.items
          .filter((e) => e.id != playerData.id)
          .map((player, i) => (
            <div key={i}>
              <input
                type="checkbox"
                id={player.name}
                name={player.name}
                onChange={updateTransactPartners}
              />
              <label htmlFor={player.name}>{player.name}</label>
            </div>
          ))}
        <div>
          <h4>Amount</h4>
          <input
            onChange={(event) => setTransactAmount(event.target.value)}
            value={transactAmount}
            placeholder={`enter amount to ${transactType}`}
          />
        </div>
        <div>
          <button onClick={completeTransaction}>Confirm</button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <h2>Monopoly Wallet</h2>
      <h4>My Account:</h4>
      <div>{playerData.account}</div>
      <button
        onClick={() => {
          setTransactType("Pay");
          setShowTransact(true);
        }}
      >
        Pay
      </button>
      <button
        onClick={() => {
          setTransactType("Collect");
          setShowTransact(true);
        }}
      >
        Collect
      </button>
      {showTransact && TransactAction()}
      <h4>Events</h4>
      <ul>
        {events.map((event, i) => (
          <li key={i}>{event}</li>
        ))}
      </ul>
    </div>
  );
}
