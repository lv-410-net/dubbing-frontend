import React from "react";
import "./Header.css";
import Logo from "./Logo/Logo";
import Logout from "./Logout/Logout";

interface IHeaderState {
    isAuthorized: boolean;
}

class Header extends React.Component<{}, IHeaderState> {

    public static getDerivedStateFromProps(props: {}, state: IHeaderState) {
        const segments = location.pathname.split("/");
        const newState = {
            ...state,
        };

        if (segments[1] === "login") {
            newState.isAuthorized = false;
        } else {
            newState.isAuthorized = true;
        }

        return newState;
    }
    constructor(props: {}) {
        super(props);
        this.state = {
            isAuthorized: false,
        };
    }

    public render() {
        const logout = this.state.isAuthorized ? <Logout /> : null;

        return (
            <header id="header">
                <Logo text="Театр ляльок" />
                {logout}
            </header>
        );
    }
}

export default Header;
