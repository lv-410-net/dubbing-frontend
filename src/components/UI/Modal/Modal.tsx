import React from "react";

import Aux from "../../../hoc/Auxiliary";

import classes from "./Modal.module.css";

const modal = (props: any) => {

    let content = null;
    if (props.isDisplayed) {
        content = (
            <div className={classes.Backdrop}>
                <div className={classes.Modal}>
                    {props.children}
                </div>
            </div>
        );
    }

    return (
        <Aux>
            {content}
        </Aux>
    );
};

export default modal;
