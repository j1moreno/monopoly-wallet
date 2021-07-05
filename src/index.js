import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import Game from './Game';
import TestApi from './TestApi';
import Home from "./Home"
import reportWebVitals from './reportWebVitals';
import Amplify from "aws-amplify";
import {BrowserRouter as Router, Switch, Route} from "react-router-dom"
import awsExports from "./aws-exports";
Amplify.configure(awsExports);

ReactDOM.render(
  <React.StrictMode>
    <Router>
    <Switch>
      <Route path="/:id" children={<Game />} />
      <Route path="/">
        <Home />
      </Route>
    </Switch>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
