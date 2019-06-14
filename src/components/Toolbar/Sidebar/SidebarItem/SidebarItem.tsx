import React from "react";
import { NavLink } from "react-router-dom";

import classes from "./SidebarItem.module.css";

interface ISidebarItemProps {
    id: number;
    imgSrc: string;
    name: string;
    clicked: any;
    path: string;
}

class SidebarItem extends React.Component<ISidebarItemProps> {
    constructor(props: ISidebarItemProps) {
        super(props);
    }

    public render() {
        return (
            <NavLink
                to={this.props.path}
                className={classes.NavItem}
                activeClassName={classes.NavItemActive}
                onClick={this.props.clicked}>
                    <img src={this.props.imgSrc} alt=""/>
                    <span>{this.props.name}</span>
            </NavLink>
        );
    }
}

export default SidebarItem;
