import React from "react";
import Aux from "../../../../hoc/Auxiliary";
import WithClass from "../../../../hoc/WithClass";
import classes from "./StreamAudio.module.css";

interface IAudioProps {
    text: string;
    duration: number;
    isPlaying: boolean;
    playByIdHandler: any;
    currentAudioId: number;
    connectingStatus: boolean;
}

const audio = (props: IAudioProps) => {

    const getViewNumber = (num: number): string => {
        if (num < 10) {
            return `0${num}`;
        } else {
            return num.toString();
        }
    };

    const convSecondsToMinutes = (second: number): string => {
        const minutes: number = Math.floor(second / 60);
        const seconds: number = second % 60;

        return `${getViewNumber(minutes)}:${getViewNumber(seconds)}`;
    };

    const iconActionsClasses = ["fas", classes.icon, "fa-play-circle"];
    if (props.isPlaying) {
        iconActionsClasses.pop();
        iconActionsClasses.push("fa-pause-circle");
    } else {
        iconActionsClasses.pop();
        iconActionsClasses.push("fa-play-circle");
    }

    if (!props.connectingStatus) {
        iconActionsClasses.push(classes.disable);
    }

    function playHandler() {
        props.playByIdHandler(props.currentAudioId);
    }

    return (
        <Aux>
            <i className={iconActionsClasses.join(" ")} onClick={playHandler}></i>
            <span>
                {props.text}
            </span>
            <span className={classes.time}>{convSecondsToMinutes(props.duration)}</span>
        </Aux>
    );
};

export default WithClass(audio, classes.audio);
