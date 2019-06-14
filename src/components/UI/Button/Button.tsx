import Radium from "radium";
import React from "react";

interface IButtonProps {
    width: string;
    height: string;
    backgroundColor: string;
    borderRadius: string;
    fontSize: string;
    transitionDuration: string;
    className: string;
    text: string;
    hover?: object;
    clicked?: any;
}

class Button extends React.Component<IButtonProps> {

    public render() {
        const style = {
            ":hover": {
                ...this.props.hover,
            },
            "backgroundColor": this.props.backgroundColor,
            "borderRadius": this.props.borderRadius,
            "fontSize": this.props.fontSize,
            "height": this.props.height,
            "transition": "all " + this.props.transitionDuration,
            "width": this.props.width,
        };

        return (
            <button style={style} className={this.props.className} onClick={this.props.clicked}>
                {this.props.children}
                <span>{this.props.text}</span>
            </button>
        );
    }
}

export default Radium(Button);
