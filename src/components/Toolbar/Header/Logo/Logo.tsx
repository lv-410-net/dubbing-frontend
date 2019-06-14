import React from "react";
import "./Logo.css";

interface ILogoProps {
    text: string;
}

class Logo extends React.PureComponent<ILogoProps> {
    public render() {
        return (
            <button className="header-logo">
                {this.props.text}
            </button>
        );
    }
}

export default Logo;
