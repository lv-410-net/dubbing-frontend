import React from "react";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import "../Performances/Performance/Performance.css";
import "./PopupConfirmationDialog.css";

interface IPopupConfirmationDialogProps {
  removeMethod: any;
  message: string;
  labelDangerButton: string;
  labelPrimaryButton: string;
}

interface IPopupConfirmationDialogState {
  tooltipOpen: boolean;
  modal: boolean;
}

export default class PopupConfirmationDialog extends React.Component<IPopupConfirmationDialogProps, IPopupConfirmationDialogState> {
  constructor(props: any) {
    super(props);
    this.state = {
      tooltipOpen: false,
      modal: false,
    };

    this.toggle = this.toggle.bind(this);
    this.tooltipToggle = this.tooltipToggle.bind(this);
  }

  public toggle() {
    this.setState({
      tooltipOpen: false,
      modal: !this.state.modal,
    });
  }

  public tooltipToggle() {
    this.setState({
      tooltipOpen: !this.state.tooltipOpen,
    });
  }

  public render() {
    return (
      <div>
        <Modal isOpen={this.state.modal} toggle={this.toggle} className="removePerformancePopup">
          <ModalHeader
            className="popupHeader"
            toggle={this.toggle}></ModalHeader>
          <ModalBody
            className="popupBody">
            {this.props.message}
          </ModalBody>
          <ModalFooter
            className="popupHeader">
            <Button color="danger" onClick={this.props.removeMethod}>{this.props.labelDangerButton}</Button>
            <Button color="primary" onClick={this.toggle}>{this.props.labelPrimaryButton}</Button>
          </ModalFooter>
        </Modal>
      </div >
    );
  }
}
