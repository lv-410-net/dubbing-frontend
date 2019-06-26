import React, { Component } from "react";
import KeyBinding from "react-keybinding-component";
import { connect } from "react-redux";

import Aux from "../../hoc/Auxiliary";
import WithClass from "../../hoc/WithClass";
import Spinner from "../UI/Spinner/Spinner";
import StreamAudios from "./StreamAudios/StreamAudios";
import StreamHead from "./StreamHead/StreamHead";

import * as actionCreators from "../../store/actions/index";
import StateType from "../../store/state/state";

import { signalRManager } from "../../index";
import ApiManager from "../../util/apiManager";
import { KeyChars } from "../../util/keyChars";
import { playbackManager } from "../../util/playbackManager";

import classes from "./Stream.module.css";

interface IStreamState {
    perfomanceId: number;
    performanceName: string;
    started: boolean;
    isWarning: boolean;
    isLoading: boolean;
}

interface IStreamProps {
    match: {
        params: {
            number: number,
        },
    };
    performanceId: number;
    connectingStatus: boolean;
    isPlaying: boolean;
    paused: boolean;
    isFirst: boolean;
    currentSpeechId: number;
    maxDuration: number;
    currentTime: number;
    speeches: Array<{
        id: number,
        text: string,
        duration: number,
    }>;
    onSavePerformanceId: Function;
    onSaveSpeeches: Function;
    onSaveCurrentSpeechId: Function;
    onChangeStreamingStatus: Function;
    onChangeStreamStateToInitial: Function;
    onChangeCurrentPlaybackTime: Function;
    onChangeConnectingStatus: Function;
    onChangeCurrentTabId: Function;
    onChangePaused: Function;
    onChangeFirst: Function;
}

interface IMapKeysBinding {
    [KeyChars.Space]: boolean;
    [key: string]: boolean;
}

class Stream extends Component<IStreamProps, IStreamState> {
    private apiManager: ApiManager = new ApiManager();
    private map: IMapKeysBinding = {
        [KeyChars.Space]: false,
    };
    private repeat: boolean = true;

    constructor(props: any) {
        super(props);
        this.state = {
            started: false,
            isWarning: false,
            perfomanceId: this.props.match.params.number,
            performanceName: "",
            isLoading: true,
        };
        signalRManager.registerEvent("Late Connect", this.onLateConnection);
    }

    public onLateConnection = async (connectionId: number) => {
        if (this.state.started && this.props.isPlaying) {
            //console.log("Late connected");
            console.log(this.props.currentTime + " " + connectionId);
            await signalRManager.sendCommand(`${this.props.performanceId}_${this.props.currentSpeechId}`, 
                this.props.currentTime, connectionId);
        }
        // else {
        //     await signalRManager.sendCommand("Start");
        // }
    }

    public changeConnectingStatus = async (event: Event) => {
        event.preventDefault();

        if (this.props.speeches !== undefined) {
            if (!this.props.connectingStatus) {
                await signalRManager.connectToHub()
                    .then(async () => {
                        await signalRManager.sendCommand("Start")
                            .then(() => {
                                this.props.onChangeConnectingStatus(true);
                                this.setState({ started: true });
                                if (this.props.isFirst && this.props.isPlaying) {
                                    this.playByIdHandler(this.props.currentSpeechId);
                                    this.props.onChangePaused(false);
                                }
                            })
                            .catch(() => alert("Виникла помилка на сервері!"));
                    })
                    .catch(() => alert("Виникла помилка на сервері!"));
            } else {
                if (this.props.isPlaying) {
                    await this.pause();
                }

                await signalRManager.sendCommand("End")
                    .then(async () => {
                        await signalRManager.disconnectFromHub()
                            .then(() => {
                                this.props.onChangeConnectingStatus(false);
                                this.setState({ started: false });
                                this.reset();
                                this.props.onChangeFirst(true);
                                this.props.onChangePaused(false);
                                this.props.onChangeStreamingStatus(false);
                                //this.props.onSaveCurrentSpeechId(0);

                                if (this.props.speeches !== undefined && this.props.speeches.length !== 0) {
                                    this.props.onSaveCurrentSpeechId(this.props.speeches[0].id);
                                }
                            })
                            .catch(() => alert("Виникла помилка на сервері. Спробуйте перевірити з'єднання!"));
                    })
                    .catch(() => alert("Виникла помилка на сервері. Спробуйте перевірити з'єднання!"));
            }
        } else {
            alert("Здається ця вистава не містить фрагментів для програвання...");
        }
    }

    public playResumeHandler = async (id: number) => {
        if (this.props.connectingStatus) {
            if (!this.props.isPlaying && this.props.paused) {

                if (this.props.currentSpeechId !== id && this.props.paused) {
                    playbackManager.reset(this.props.onChangeCurrentPlaybackTime);
                    this.props.onSaveCurrentSpeechId(id);
                    await this.playByIdHandler(id);
                    this.props.onChangePaused(false);
                    console.log('working!');
                } else {
                    await signalRManager.sendCommand("Resume");
                this.props.onChangeStreamingStatus(true);
                playbackManager.resume(this.props.onChangeCurrentPlaybackTime, this.pause.bind(this));
                this.props.onChangePaused(false);
                console.log(this.props.currentSpeechId + " and id " + id);
                console.log(this.props.isPlaying);
                }              
            } else if (this.props.isPlaying) {
                await this.pause();
            } else if (this.props.paused && this.props.currentSpeechId !== id) {
                await signalRManager.sendCommand(this.props.performanceId + "_" + id)
                .then(() => {
                    this.props.onSaveCurrentSpeechId(id);
                    this.props.onChangeStreamingStatus(true);
                    this.setState({started: true});
                    this.props.onChangePaused(false);
                    console.log('THIS IS IT!!!');

                    playbackManager.play(
                        this.props.onChangeCurrentPlaybackTime,
                        this.pause.bind(this),
                        this.reset.bind(this),
                        this.props.maxDuration, 0
                    );
                }).catch(() => alert("Виникла помилка на сервері. Спробуйте перевірити з'єднання!"));
            }
        }
    }

    public playByIdHandler = async (id: number) => {
        if (this.props.connectingStatus) {
            if (this.props.isFirst || (this.props.isPlaying && id !== this.props.currentSpeechId)) {
                await signalRManager.sendCommand(this.props.performanceId + "_" + id)
                    this.props.onSaveCurrentSpeechId(id);
                    this.props.onChangeStreamingStatus(true);
                    this.setState({ started: true });
                    this.props.onChangePaused(false);
                    console.log("here one");

                    playbackManager.reset(this.props.onChangeCurrentPlaybackTime);
                    playbackManager.play(
                        this.props.onChangeCurrentPlaybackTime,
                        this.pause.bind(this),
                        this.reset.bind(this),
                        this.props.maxDuration, 0);

                    if (this.props.isFirst) {
                        this.props.onChangeFirst(false);
                    }

            } else if (!this.props.isPlaying && !this.props.isFirst) {
                if (this.props.paused && this.props.currentSpeechId !== id) {
                    await signalRManager.sendCommand(this.props.performanceId + "_" + id);
                    this.props.onSaveCurrentSpeechId(id);
                    this.props.onChangeStreamingStatus(true);
                    this.setState({ started: true });
                    this.props.onChangePaused(false);
                    console.log("here two");

                    playbackManager.play(
                        this.props.onChangeCurrentPlaybackTime,
                        this.pause.bind(this),
                        this.reset.bind(this),
                        this.props.maxDuration, 0);
                }
            }
             else {
                await this.pause();
            }
        }
    }

    public pause = async (): Promise<void> => {
        if (!this.props.paused) {
            return await signalRManager.sendCommand("Pause", this.props.currentTime)
                .then(() => {
                    this.props.onChangeStreamingStatus(false);
                    playbackManager.pause();
                    this.props.onChangePaused(true);
                    console.log(this.props.paused + " ? " + this.props.isPlaying);
                })
                .catch(() => alert("Виникла помилка на сервері. Спробуйте перевірити з'єднання!"));
        }        
    }

    public reset = async(): Promise<void> => {
        if (this.props.currentTime >= this.props.maxDuration) {
            this.props.onChangeStreamingStatus(false);
            playbackManager.reset(this.props.onChangeCurrentPlaybackTime);
            this.props.onChangePaused(false);
            this.props.onChangeFirst(true);
        }
    }

    public resume = async (): Promise<void> => {
        if (this.props.paused) {
            return await signalRManager.sendCommand("Resume")
                .then(() => {
                    this.props.onChangeStreamingStatus(true);
                    playbackManager.resume(this.props.onChangeCurrentPlaybackTime, this.pause.bind(this));
                    this.props.onChangePaused(false);
                })
                .catch(() => alert("Виникла помилка на сервері. Спробуйте перевірити з'єднання!"));
        }      
    }

    public checkKeys = (...keys: string[]) => {
        for (const key of keys) {
            if (!this.map[key]) {
                return false;
            }
        }

        return true;
    }

    public onKeyDownUpHandler = async (event: KeyboardEvent) => {
        this.map[event.key] = event.type === "keydown";

        if (this.checkKeys(KeyChars.Space) && this.repeat) {
            if (!this.props.paused) {
                this.pause();
            } else {
                this.resume();
            }
            this.repeat = false;
        } else if (event.type === "keyup") {
            this.repeat = true;
        }
    }

    public render() {
        return (
            <Aux>
                <Spinner isShow={this.state.isLoading} />
                <StreamHead
                    name={this.state.performanceName}
                    connectingStatus={this.props.connectingStatus}
                    clicked={(event: Event) => this.changeConnectingStatus(event) } />
                <StreamAudios
                    audios={this.props.speeches !== undefined ? this.props.speeches : []}
                    connectingStatus={this.props.connectingStatus}
                    currentAudioId={this.props.currentSpeechId}
                    playByIdHandler={ !this.props.paused ? this.playByIdHandler : this.playResumeHandler }
                    isPlaying={this.props.isPlaying} />
                <KeyBinding onKey={(event: KeyboardEvent) => this.onKeyDownUpHandler(event)} type="keydown"/>
                <KeyBinding onKey={(event: KeyboardEvent) => this.onKeyDownUpHandler(event)} type="keyup"/>
            </Aux>
        );
    }

    public async componentDidMount() {
        const response = await this.apiManager.getPerformanceById(this.state.perfomanceId);
        if (response.status === 200) {
            const performance = await response.json();
            this.setState({
                performanceName: performance.title,
            });

            this.props.onSavePerformanceId(this.state.perfomanceId);
            const speechesResponse = await this.apiManager.getSpeechInfo(this.state.perfomanceId);
            if (speechesResponse.status === 200) {
                const speeches = await speechesResponse.json();
                this.props.onSaveSpeeches(speeches);
            } else {
                this.handleError(speechesResponse);
            }
        } else {
            this.handleError(response);
        }

        this.setState({
            isLoading: false,
        });

        this.props.onChangeCurrentTabId(1);

        window.onbeforeunload = (event) => {
            return this.props.connectingStatus
                    ? false
                    : null;
        };
    }

    public async componentWillUnmount() {
        if (this.props.connectingStatus) {
            if (this.props.isPlaying) {
                await this.pause();
            }

            await signalRManager.sendCommand("End")
                                .catch((error) => console.log(error));
            await signalRManager.disconnectFromHub()
                                .catch((error) => console.log(error));
        }

        this.props.onChangeStreamStateToInitial();
        window.onbeforeunload = null;
    }

    private handleError = (response: Response) => {
        if (response.status === 500) {
            alert("Виникла помилка на сервері.");
        } else {
            alert("Не вдалось підключитись до серверу. Перевірте з'єднання з сервером!");
        }
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return {
        onChangeConnectingStatus: (status: boolean) => dispatch(actionCreators.changeConnectingStatus(status)),
        onChangeCurrentPlaybackTime: (time: number) => dispatch(actionCreators.changeCurrentPlaybackTime(time)),
        onChangeStreamStateToInitial: () => dispatch(actionCreators.changeStreamStateToInitial()),
        onChangeStreamingStatus: (status: boolean) => dispatch(actionCreators.changeStreamingStatus(status)),
        onSaveSpeeches: (speeches: any) => dispatch(actionCreators.saveSpeeches(speeches)),
        onSaveCurrentSpeechId: (id: number) => dispatch(actionCreators.saveCurrentSpeechId(id)),
        onSavePerformanceId: (id: number) => dispatch(actionCreators.savePerformanceId(id)),
        onChangeCurrentTabId: (nextId: number) => dispatch(actionCreators.changeCurrentTabId(nextId)),
        onChangePaused: (paused: boolean) => dispatch(actionCreators.changePaused(paused)),
        onChangeFirst: (isFirst: boolean) => dispatch(actionCreators.changeFirst(isFirst))
    };
};

const mapStateToProps = (state: StateType) => {
    return {
        connectingStatus: state.stream.connectingStatus,
        currentSpeechId: state.stream.currentSpeechId,
        isPlaying: state.stream.isPlaying,
        maxDuration: state.stream.maxDuration,
        performanceId: state.stream.performanceId,
        speeches: state.stream.speeches,
        currentTime: state.stream.currentPlaybackTime,
        paused: state.stream.paused,
        isFirst: state.stream.isFirst,
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(WithClass(Stream, classes.stream));
