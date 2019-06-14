import React from "react";

import Aux from "../../../hoc/Auxiliary";
import classes from "./Spinner.module.css";

interface ISpinnerProps {
    isShow: boolean;
}

const spinner = (props: ISpinnerProps) => {
    return (
        props.isShow ? (
            <Aux>
                <div className={classes.Backdrop}></div>
                <div className={classes.Spinner}>Loading...</div>
            </Aux>
        ) : null
    );
};

export default spinner;
