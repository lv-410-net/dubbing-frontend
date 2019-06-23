import React, { Component } from "react";
import KeyBinding from "react-keybinding-component";
import { connect } from "react-redux";
import { AnyAction, Dispatch } from "redux";

import Aux from "../../../../hoc/Auxiliary";
import WithClass from "../../../../hoc/WithClass";
import ButtonSection from "./ButtonSection/ButtonSection";
import PlaySection from "./PlaySection/PlaySection";

import { signalRManager } from "../../../../index";
import ApiManager from "../../../../util/apiManager";
import { KeyChars } from "../../../../util/keyChars";
import { playbackManager } from "../../../../util/playbackManager";

import * as actions from "../../../../store/actions/index";
import StateType from "../../../../store/state/state";

import classes from "./ActionSection.module.css";

interface IActionSectionProps {
    performanceId: number;
    isPlaying: boolean;
    paused: boolean;
    currentSpeechId: number;
    currentSpeechIndex: number;
    currentPlaybackTime: number;
    maxDuration: number;
    connectingStatus: boolean;
    speeches: Array<{
        id: number,
        text: string,
        duration: number,
    }>;
    // tslint:disable
    onChangeStreamingStatus: Function;
    onChangeCurrentSpeechId: Function;
    onChangeCurrentPlaybackTime: Function;
    onChangePaused: Function;
    onChangeFirst: Function;
    // tslint:enable
}

interface IActionSectionState {
    performanceId: number;
    currentTime: number;
}

interface IMapKeyBindings {
    [KeyChars.Ctrl]: boolean;
    [KeyChars.ArrowRight]: boolean;
    [KeyChars.ArrowLeft]: boolean;
    [key: string]: boolean;
}

class ActionSection extends Component<IActionSectionProps, IActionSectionState> {
    private apiManager = new ApiManager();
    private map: IMapKeyBindings = {
        [KeyChars.Ctrl]: false,
        [KeyChars.ArrowRight]: false,
        [KeyChars.ArrowLeft]: false,
    };
    private repeat: boolean = true;
    private timerId: any = 0;

    constructor(props: any) {
        super(props);

        this.state = {
            currentTime: 0,
            performanceId: this.props.performanceId,

        };
    }

    public playPauseHandler = async (event: Event) => {
        event.preventDefault();

        if (this.props.connectingStatus) {
            if (!this.props.isPlaying) {
                await signalRManager.sendCommand(this.props.performanceId + "_" + this.props.currentSpeechId);
                this.props.onChangePaused(false);
                this.props.onChangeStreamingStatus(true);
                this.props.onChangeFirst(false);

                playbackManager.play(
                    this.props.onChangeCurrentPlaybackTime,
                    this.pause.bind(this),
                    this.reset.bind(this),
                    this.props.maxDuration, 0);
            } else if (this.props.isPlaying) {
                await this.pause();
            } else if (this.props.paused && !this.props.currentSpeechId) {
                await this.reset();
                playbackManager.play(
                    this.props.onChangeCurrentPlaybackTime,
                    this.pause.bind(this),
                    this.reset.bind(this),
                    this.props.maxDuration, 0);
            }
        }
    }
    
    public playResumeHandler = async (event: Event) => {
        event.preventDefault();

        if (this.props.connectingStatus) {
            if (!this.props.isPlaying) {
                await signalRManager.sendCommand("Resume");
                    this.props.onChangeStreamingStatus(true);
                    playbackManager.resume(this.props.onChangeCurrentPlaybackTime, this.pause.bind(this));
                    this.props.onChangePaused(false);
            } else if (this.props.isPlaying) {
                await this.pause();
            }
        }
    }

    public pause = async () => {
        if (!this.props.paused) {
            let time = new Date().getTime();
            return await signalRManager.sendCommand("Pause", time - this.props.currentPlaybackTime * 1000)
                    .then(() => {
                        this.props.onChangeStreamingStatus(false);
                        playbackManager.pause();
                        this.props.onChangePaused(true);
                    })
                    .catch((error) => console.log(error));
        }        
    }

    public reset = async () => {
        if (this.props.currentPlaybackTime >= this.props.maxDuration) {
            this.props.onChangeStreamingStatus(false);
            playbackManager.reset(this.props.onChangeCurrentPlaybackTime);
            this.props.onChangePaused(false);
        }
    }

    public resume = async () => {
        if (this.props.paused) {
            return await signalRManager.sendCommand("Resume")
                    .then(() => {
                        this.props.onChangeStreamingStatus(true);
                        playbackManager.resume(this.props.onChangeCurrentPlaybackTime, this.pause.bind(this));
                        this.props.onChangePaused(false);
                    })
                    .catch((error) => console.log(error));
        }       
    }

    public nextSpeechHandler = async (event: Event) => {
        event.preventDefault();

        if (this.props.connectingStatus) {
            if (this.props.currentSpeechIndex !== this.props.speeches.length - 1) {
                const nextSpeechId = this.props.speeches[this.props.currentSpeechIndex + 1].id;
                this.props.onChangeCurrentSpeechId(nextSpeechId);
                playbackManager.reset(this.props.onChangeCurrentPlaybackTime);

                if (this.props.isPlaying) {
                    await signalRManager.sendCommand(this.props.performanceId + "_" + nextSpeechId);
                    playbackManager.play(
                        this.props.onChangeCurrentPlaybackTime,
                        this.pause.bind(this),
                        this.reset.bind(this),
                        this.props.maxDuration, 0);
                }
            }
        }
    }

    public prevSpeechHandler = async (event: Event) => {
        event.preventDefault();

        if (this.props.connectingStatus) {
            if (this.props.currentSpeechIndex !== 0) {
                const prevSpeechId = this.props.speeches[this.props.currentSpeechIndex - 1].id;
                this.props.onChangeCurrentSpeechId(prevSpeechId);
                playbackManager.reset(this.props.onChangeCurrentPlaybackTime);

                if (this.props.isPlaying) {
                    await signalRManager.sendCommand(this.props.performanceId + "_" + prevSpeechId);
                    playbackManager.play(
                        this.props.onChangeCurrentPlaybackTime,
                        this.pause.bind(this),
                        this.reset.bind(this),
                        this.props.maxDuration, 0);
                }
            }
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

        if (this.checkKeys(KeyChars.Ctrl, KeyChars.ArrowRight) && this.repeat) {
            this.repeat = false;
            await this.nextSpeechHandler(event);
        } else if (this.checkKeys(KeyChars.Ctrl, KeyChars.ArrowLeft) && this.repeat) {
            this.repeat = false;
            await this.prevSpeechHandler(event);
        } else if (event.type === "keyup") {
            this.repeat = true;
        }
    }

    public render() {
        return (
            <Aux>
                <ButtonSection
                    playPauseHandler={this.props.paused ? this.playResumeHandler : this.playPauseHandler}
                    nextSpeechHandler={this.nextSpeechHandler}
                    prevSpeechHandler={this.prevSpeechHandler}
                    connectingStatus={this.props.connectingStatus}
                    isPlaying={this.props.isPlaying}
                />
                <PlaySection
                    numAudio={this.props.currentSpeechIndex + 1}
                    totalTime={this.props.maxDuration}
                    currentTime={this.props.currentPlaybackTime} />
                <KeyBinding onKey={(event: KeyboardEvent) => this.onKeyDownUpHandler(event) } type="keydown"/>
                <KeyBinding onKey={(event: KeyboardEvent) => this.onKeyDownUpHandler(event) } type="keyup"/>
            </Aux>
        );
    }
}

const mapStateToProps = (state: StateType) => {
    return {
        connectingStatus: state.stream.connectingStatus,
        currentPlaybackTime: state.stream.currentPlaybackTime,
        currentSpeechId: state.stream.currentSpeechId,
        currentSpeechIndex: state.stream.currentSpeechIndex,
        isPlaying: state.stream.isPlaying,
        maxDuration: state.stream.maxDuration,
        speeches: state.stream.speeches,
        paused: state.stream.paused,
        isFirst: state.stream.isFirst
    };
};

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) => {
    return {
        onChangeCurrentPlaybackTime: (time: number) => dispatch(actions.changeCurrentPlaybackTime(time)),
        onChangeCurrentSpeechId: (id: number) => dispatch(actions.saveCurrentSpeechId(id)),
        onChangeStreamingStatus: (status: boolean) => dispatch(actions.changeStreamingStatus(status)),
        onChangePaused: (paused: boolean) => dispatch(actions.changePaused(paused)),
        onChangeFirst: (isFirst: boolean) => dispatch(actions.changeFirst(isFirst))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(WithClass(ActionSection, classes.actionSection));
