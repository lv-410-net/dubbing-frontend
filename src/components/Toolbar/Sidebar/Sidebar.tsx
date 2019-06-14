import React from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { Dispatch } from "redux";
import * as actionCreators from "../../../store/actions/index";

import GlobalStoreType from "../../../store/state/state";
import API from "../../../util/api";
import ActionSection from "./ActionSection/ActionSection";
import SidebarItem from "./SidebarItem/SidebarItem";

import eventLogo from "../../../assets/images/event-logo.png";
import perfomanceLogo from "../../../assets/images/perfomance-logo.png";
import streamLogo from "../../../assets/images/stream-logo.png";

import "./Sidebar.css";

interface ISidebarState {
    performanceId: number;
    isVisible: boolean;
}

interface ISidebarProps {
    isStreamConnectedToServer: boolean;
    currentTabId: number;
    isNewFilesLoaded: boolean;
    newFilesName: string[];
    onChangeCurrentTabId: Function;
    onChangeAudioUploadToInitial: Function;
}

function CountBlock() {
    return (
        <div className="countBlock">
            <p>Підключено користувачів: <span id='userCounter'>0</span></p>
        </div>
    );
}

class Sidebar extends React.Component<ISidebarProps, ISidebarState> {
    public static getDerivedStateFromProps(props: {}, state: ISidebarState) {
        const updatedState = {
            ...state,
        };
        const segments = location.pathname.split("/");

        if (segments[1] === "login") {
            updatedState.isVisible = false;
        } else if (segments[1] === "stream") {
            updatedState.performanceId = parseInt(segments[2], undefined);
        }

        if (segments[1] !== "stream" && updatedState.performanceId !== -1) {
            updatedState.performanceId = -1;
        }

        return updatedState;
    }

    constructor(props: any) {
        super(props);
        this.state = {
            isVisible: true,
            performanceId: -1,
        };
    }

    public OnPerformanceClickHandler = async (event: Event, targetTabId: number) => {
        if (targetTabId === 1 && this.props.isStreamConnectedToServer) {
            const isConfirmed = confirm("Сторінка все ще підключена до серверу. Ви справді хочете перейти на іншу сторінку");
            if (!isConfirmed) {
                event.preventDefault();
            }
        } else if (targetTabId === 0 && this.props.isNewFilesLoaded) {
            const isConfirmed = confirm("Файли завантажені на сервер, але все ще не збережені. " +
                                        "Ви справді перейти на іншу сторінку та видалити файли?");
            if (!isConfirmed) {
                event.preventDefault();
            } else {
                if (this.props.newFilesName.length > 0) {
                    let query = "?";
                    for (const audio of this.props.newFilesName) {
                      query += `files=${audio}&`;
                    }
                    query.slice(query.length - 1, 1);

                    await API.delete("/audio/unload/" + query);
                  }
                this.props.onChangeAudioUploadToInitial();
            }
        }
    }

    public onStreamClickHandler = (event: Event) => {
        event.preventDefault();
    }

    public render() {
        let actionSection = null;
        let counter = null;
        if (this.state.performanceId !== -1) {
            actionSection = <ActionSection performanceId={this.state.performanceId} />;  
            counter = <CountBlock/>
        }

        return (
            this.state.isVisible ?
                <div className="sidebar">
                    <nav className="nav">
                        <SidebarItem
                            id={0}
                            name="Вистави"
                            imgSrc={perfomanceLogo}
                            path="/performance"
                            clicked={(event: Event) => this.OnPerformanceClickHandler(event, this.props.currentTabId)} />
                        <SidebarItem
                            id={1}
                            name="Трансляції"
                            imgSrc={streamLogo}
                            path="/stream"
                            clicked={(event: Event) => this.onStreamClickHandler(event)} />
                    </nav>
                    { actionSection }
                    { counter }
                </div> : null
        );
    }
}

const mapStateToProps = (store: GlobalStoreType) => {
    return {
        isStreamConnectedToServer: store.stream.connectingStatus,
        currentTabId: store.sidebar.currentTabId,
        isNewFilesLoaded: store.audioUpload.isNewFilesLoaded,
        newFilesName: store.audioUpload.newFilesName,
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
    return {
        onChangeCurrentTabId: (nextId: number) => dispatch(actionCreators.changeCurrentTabId(nextId)),
        onChangeAudioUploadToInitial: () => dispatch(actionCreators.changeAudioUploadToInitialState()),
    };
};

// @ts-ignore
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Sidebar));
