import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Tooltip } from "reactstrap";
import PopupConfirmationDialog from "../../PopupConfirmationDialog/PopupConfirmationDialog";
import "./Performance.css";

interface IPerformanceProps {
    deleteMethod: any;
    index: number;
    title: string;
    description: string;
}

interface IPerformanceState {
    tooltipEditOpen: boolean;
    tooltipRemoveOpen: boolean;
}
export default class Performance extends Component<IPerformanceProps, IPerformanceState> {
    public child = React.createRef<PopupConfirmationDialog>();
    constructor(props: any) {
        super(props);
        this.tooltipEditToggle = this.tooltipEditToggle.bind(this);
        this.tooltipRemoveToggle = this.tooltipRemoveToggle.bind(this);
        this.state = {
            tooltipEditOpen: false,
            tooltipRemoveOpen: false,
        };
    }

    public tooltipEditToggle() {
        this.setState({
            tooltipEditOpen: !this.state.tooltipEditOpen,
        });
    }
    public tooltipRemoveToggle() {
        this.setState({
            tooltipRemoveOpen: !this.state.tooltipRemoveOpen,
        });
    }

    public remove() {
        this.props.deleteMethod(this.props.index);
    }

    public toggleChildComponent = async (e: any) => {
        if (!this.child.current) {
            return;
        }
        this.child.current.toggle();
    }
    public render() {
        return (
            <div className="performance">
                <div className="row">
                    <p className="col-md-11 pull-left perfTitle" >{this.props.title}</p>
                    <div className="col-md-1 text-right PerformanceButtons ">
                        <Link to={"/performance/" + this.props.index} >
                            <button className="editBtn" id={"editBtn" + this.props.index}/>
                            <Tooltip placement="left" isOpen={this.state.tooltipEditOpen} autohide={false} target={"editBtn" + this.props.index} toggle={this.tooltipEditToggle}>
                                Редагувати виставу </Tooltip>
                        </Link>
                        <div>
                            <span className="close" onClick={this.toggleChildComponent} id={"actionButton" + this.props.index}>x</span>
                            <Tooltip placement="left" isOpen={this.state.tooltipRemoveOpen} autohide={true} target={"actionButton" + this.props.index} toggle={this.tooltipRemoveToggle}>
                                Видалити виставу </Tooltip>
                        </div>

                        <PopupConfirmationDialog
                            removeMethod={this.remove.bind(this)}
                            message="Видалення вистави приведе до видалення всіх фраз і аудіофайлів. Ви дійсно хочете видалити виставу?"
                            labelDangerButton="Видалити"
                            labelPrimaryButton="Відмінити"
                            ref={this.child}
                        />
                    </div>
                </div>

            <p className="perfDescr">
                {this.props.description}
            </p>
            <Link to={"/stream/" + this.props.index} className="gotoPerfLink">
                <button className="gotoPerfBtn ">Перейти до вистави <div className="gotoImage" /></button>
            </Link>
        </div>
        );
    }
}
