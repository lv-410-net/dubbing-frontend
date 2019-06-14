import React from "react";
import Aux from "../../../../../hoc/Auxiliary";
import WithClass from "../../../../../hoc/WithClass";
import classes from "./PlaySection.module.css";

interface IPlaySectionProps {
    numAudio: number;
    totalTime: number;
    currentTime: number;
}

const playSection = (props: IPlaySectionProps) => {

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

    return (
        <Aux>
            <span className={classes.numAudio}>#{getViewNumber(props.numAudio)}</span>
            <span className={classes.playbackTime}>
                {convSecondsToMinutes(props.currentTime)} / {convSecondsToMinutes(props.totalTime)}
            </span>
            <input
                type="range"
                className={classes.playbackScale}
                value={props.currentTime}
                max={props.totalTime}
                onChange={undefined}/>
        </Aux>
    );
};

export default WithClass(playSection, classes.playSection);
