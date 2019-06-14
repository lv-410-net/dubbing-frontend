import React from "react";
import Aux from "../../../../../hoc/Auxiliary";
import WithClass from "../../../../../hoc/WithClass";
import classes from "./ButtonSection.module.css";

interface IButtonSectionProps {
    isPlaying: boolean;
    playPauseHandler: any;
    nextSpeechHandler: any;
    prevSpeechHandler: any;
    connectingStatus: boolean;
}

const buttonSection = (props: IButtonSectionProps) => {
    const mainBtnClasses = [classes.act, classes.play];
    const mainBtnIconClasses = ["fas", "fa-play"];

    if (props.isPlaying === true) {
        mainBtnClasses.pop();
        mainBtnClasses.push(classes.pause);

        mainBtnIconClasses.pop();
        mainBtnIconClasses.push("fa-pause");
    }

    const prev = [classes.prev];
    const next = [classes.next];
    if (!props.connectingStatus) {
        mainBtnClasses.push(classes.disable);

        prev.push(classes.prevNextDisable);
        next.push(classes.prevNextDisable);
    }

    return (
        <Aux>
            <a href="" className={prev.join(" ")} onClick={(event) => props.prevSpeechHandler(event)}>
                <i className="fas fa-fast-backward"></i>
            </a>

            <a href="" className={mainBtnClasses.join(" ")} onClick={(event) => props.playPauseHandler(event)}>
                <i className={mainBtnIconClasses.join(" ")} ></i>
            </a>

            <a href="" className={next.join(" ")} onClick={(event) => props.nextSpeechHandler(event)}>
                <i className="fas fa-fast-forward"></i>
            </a>
        </Aux>
    );
};

export default WithClass(buttonSection, classes.btnSection);
