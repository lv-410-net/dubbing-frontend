import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { Router } from "react-router";
import { applyMiddleware, combineReducers, createStore } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import thunk from "redux-thunk";

import App from "./App";
import * as serviceWorker from "./serviceWorker";
import audioUploadReducer from "./store/reducers/audioUploadReducer";
import sidebarReducer from "./store/reducers/sidebarReducer";
import streamReducer from "./store/reducers/streamReducer";
import history from "./util/history";

import "bootstrap/dist/css/bootstrap.css";
import "./assets/css/font-awesome.css";
import "./index.css";

import config from "react-global-configuration";
import configuration from "./config";
import SignalrManager from "./util/signalrManager";

const reducer: any = combineReducers({
    stream: streamReducer,
    sidebar: sidebarReducer,
    audioUpload: audioUploadReducer,
});

const store: any = createStore(reducer, composeWithDevTools(applyMiddleware(
    thunk,
)));

config.set(configuration);

const app: JSX.Element = (
    <Provider store={store}>
        <Router history={history}>
            <App />
        </Router>
    </Provider>
);

export const signalRManager: SignalrManager = new SignalrManager();

ReactDOM.render(app, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
