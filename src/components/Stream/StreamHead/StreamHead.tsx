import React from "react";

import Aux from "../../../hoc/Auxiliary";
import WithClass from "../../../hoc/WithClass";
import Button from "../../UI/Button/Button";

import classes from "./StreamHead.module.css";

interface IStreamHeadProps {
    name: string;
    connectingStatus: boolean;
    clicked: Function;
}

const streamHead = (props: IStreamHeadProps) => {
    const btnStyles = {
        backgroundColor: "#0057c6",
        borderRadius: "25px",
        className: classes.btn,
        fontSize: "18px",
        height: "45px",
        hover: {
            backgroundColor: "#083d81",
            cursor: "pointer",
        },
        text: "Приєднатись до сервера",
        transitionDuration: "0.3s",
        width: "auto"
    };
    let icon = <i className="fas fa-play-circle"></i>;

    if (props.connectingStatus) {
        btnStyles.backgroundColor = "#da4453";
        btnStyles.text = "Відключитись від сервера!";
        btnStyles.hover.backgroundColor = "#cf1225";
        icon = <i className="fas fa-stop-circle"></i>;
    }

    return (
        <Aux>
            <span className={classes.title}>{props.name}</span>
                <Button {...btnStyles} clicked={props.clicked}>
                    {icon}
                </Button>
        </Aux>
    );
};

export default WithClass(streamHead, classes.streamHead);
