import React from 'react';
import Aux from '../../../hoc/Auxiliary';
import classes from './StreamWarning.module.css';

interface StreamWarningProps { }

const streamWarning = (props: StreamWarningProps) => {

    const yesBtn = [classes.Btn, classes.Red];
    const notbtn = [classes.Btn, classes.Green];

    return (
        <Aux>
            <p className={classes.Content}>
                Трансляція все ще триває, ви справді хочете зупинити трансляцію та
                покинути сторінку?
            </p>
            <div className={classes.BtnContainer}>
                <button className={yesBtn.join(' ')}>Так</button>
                <button className={notbtn.join(' ')}>Ні</button>
            </div>
        </Aux>
    )
}

export default streamWarning;