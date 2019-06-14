import React from "react";
import { Button, Form, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import PopupConfirmationDialog from "../PopupConfirmationDialog/PopupConfirmationDialog";
import apiManager from "./apiManagerLanguage";
import DropdownLanguage from "./DropdownLanguage";
import "./LanguageSelectionPopup.css";
interface ILanguageState {
    modal: boolean;
    radioState: string;
    currentLang: {
        id: number,
        name: string,
    };
    languages: Array<{
        id: number,
        name: string,
    }>;
}

interface ILanguageProps {
    buttonLabel: string;
}

export default class LanguageSelectionPopup extends React.Component<ILanguageProps, ILanguageState> {
    public apiManager = new apiManager();
    public child = React.createRef<PopupConfirmationDialog>();

    constructor(props: any) {
        super(props);
        this.state = {
            currentLang: { id: -1, name: "" },
            languages: [],
            modal: false,
            radioState: "",
        };
        this.toggle = this.toggle.bind(this);
    }

    public getLang = async () => {
        const resp = await this.apiManager.getLang();
        const data = await resp.json();
        this.setState(
            {
                languages: data,
            });
    }

    public onAddLang = async (lang: any) => {
        const resp = await this.apiManager.createLang(JSON.stringify(lang));
        this.getLang();
    }

    public onDelLang = async (lang: any) => {
        const resp = await this.apiManager.removeLang(lang.id);
        this.getLang();
    }

    public onUpdateLang = async (lang: any) => {
        const resp = await this.apiManager.updateLang(lang.id, JSON.stringify(lang));
        this.getLang();
    }

    public toggle() {
        this.setState({
            modal: !this.state.modal,
            radioState: "",
            currentLang: { id: -1, name: "" },
        });
    }

    public radioHandler = (event: any) => {
        const radioState = event.target.value;
        this.setState({ radioState });
    }

    public updateCurrentLang = (value: any) => {
        this.setState({ currentLang: value });
    }

    public nameUpdateHandler = () => {
        if (this.state.currentLang.id !== -1) {
            if (!this.state.languages.find((item) => item.name === this.state.currentLang.name)) {
                this.onUpdateLang(this.state.currentLang);
                this.setState({
                    currentLang: { id: -1, name: "" },
                });
                this.toggle();
            } else{
                alert(`Мова з назвою "${this.state.currentLang.name}" вже існує`);
            }
        } else {
            alert("Виберіть мову");
        }
    }

    public nameChangedHandler = (event: any) => {
        this.setState({ currentLang: { id: this.state.currentLang.id, name: event.target.value } });
    }

    public languageDeleteHandler = () => {
        if (this.state.currentLang.id !== -1) {
            this.onDelLang(this.state.currentLang);
            this.setState({
                currentLang: { id: -1, name: "" },
            });
            this.toggle();
        } else {
            alert("Виберіть мову");
        }

    }

    public languageAddHandler = () => {
        if (this.state.currentLang.name === "") {
            alert("Введіть назву мови");
        } else if (this.state.languages.find((item) => item.name === this.state.currentLang.name)) {
            alert(`Мова з назвою "${this.state.currentLang.name}" вже існує`);
        } else {

            const newLanguage = {
                id: 0,
                name: this.state.currentLang.name,
            };
            this.onAddLang(newLanguage);
            this.toggle();
        }
    }

    public toggleChildComponent = async (e: any) => {
        if (this.state.currentLang.id !== -1) {
            if (!this.child.current) {
                return;
            }
            this.child.current.toggle();
        } else {
            alert("Виберіть мову");
        }
    }

    public componentDidMount() {
        this.getLang();
    }

    public render() {

        const currentLangName = this.state.currentLang.name;
        let inputs = null;
        if (this.state.radioState === "add") {
            inputs = (
                <div>
                    <Form>
                        <Label >Введіть назву мови щоб додати</Label>
                        <Input
                            className="inputLang"
                            placeholder="Назва мови"
                            onChange={this.nameChangedHandler} /><br />
                        <Button
                            color="primary"
                            onClick={() => this.languageAddHandler()} >Додати мову</Button>
                    </Form>
                </div>
            );
        } else if (this.state.radioState === "update") {
            inputs = (
                <div>
                    <DropdownLanguage
                        updateCurrentLang={this.updateCurrentLang}
                        languages={this.state.languages}></DropdownLanguage> <br></br>
                    <Form >
                        <Label >Оберіть мову для редагування</Label>
                        <Input
                            className="inputLang"
                            onChange={this.nameChangedHandler}
                            value={this.state.currentLang.name}
                        /><br />
                        <Button
                            color="primary"
                            onClick={() => this.nameUpdateHandler()} >Редагувати</Button>
                    </Form>
                </div>
            );
        } else if (this.state.radioState === "delete") {
            inputs = (
                <div>
                    <DropdownLanguage
                        updateCurrentLang={this.updateCurrentLang}
                        languages={this.state.languages}></DropdownLanguage> <br></br>
                    <Form>
                        <Button
                            color="danger"
                            onClick={this.toggleChildComponent} >Видалити мову</Button><br />
                        <PopupConfirmationDialog
                            removeMethod={this.languageDeleteHandler.bind(this)}
                            message="Видалення мови приведе до видалення усіх аудіозаписів звязаних з цією мовою. Ви дійсно хочете видалити виставу?"
                            labelDangerButton="Видалити"
                            labelPrimaryButton="Відмінити"
                            ref={this.child}
                        />
                    </Form>
                </div>
            );
        }

        return (

            <div className="languageButton">
                <Button
                    color="primary"
                    onClick={this.toggle}>{this.props.buttonLabel}</Button>
                <Modal
                    isOpen={this.state.modal}
                    toggle={this.toggle}>
                    <ModalHeader
                        toggle={this.toggle}
                        className="popupHeader">Керування мовами дубляжу</ModalHeader>
                    <ModalBody className="popupBody">
                        <div>
                            <FormGroup tag="fieldset">
                                <FormGroup check>
                                    <Label check>
                                        <Input type="radio" name="radioLang" value="add" onChange={this.radioHandler} />{" "}
                                        Додати нову мову дубляжу</Label>
                                </FormGroup>
                                <FormGroup check>
                                    <Label check>
                                        <Input type="radio" name="radioLang" value="update" onChange={this.radioHandler} />{" "}
                                        Змінити назву мови дубляжу</Label>
                                </FormGroup>
                                <FormGroup check >
                                    <Label check>
                                        <Input type="radio" name="radioLang" value="delete" onChange={this.radioHandler} />{" "}
                                        Видалити мову дубляжу</Label>
                                </FormGroup>
                            </FormGroup>
                        </div>
                        {inputs}
                    </ModalBody>
                    <ModalFooter className="popupHeader">
                        <Button color="secondary" onClick={this.toggle}>Закрити</Button>
                    </ModalFooter>
                </Modal>
            </div >
        );
    }
}
