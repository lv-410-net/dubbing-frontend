import React, { Component } from "react";
import { Route, Switch } from "react-router-dom";

import Login from "./components/Login/Login";
import PerformancesPage from "./components/Performances/PerformancesPage";
import Stream from "./components/Stream/Stream";
import Header from "./components/Toolbar/Header/Header";
import Sidebar from "./components/Toolbar/Sidebar/Sidebar";
import Aux from "./hoc/Auxiliary";

class App extends Component {
  public render(): JSX.Element {
      return (
        <Aux>
          <Header />
          <main>
            <Sidebar />
            <Switch>
              <Route path="/login" component={Login} />
              <Route exact path="/" component={PerformancesPage} />
              <Route path="/performance" component={PerformancesPage} />
              <Route exact path="/stream/:number" component={Stream} />
            </Switch>
          </main>
        </Aux>
      );
  }
}

export default App;
