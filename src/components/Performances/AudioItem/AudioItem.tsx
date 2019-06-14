import * as React from "react";
import { Button, Tooltip } from "reactstrap";
import API from "../../../util/api";
import "./AudioItem.css";

export interface IAudioItemProps {
  id: number;
  order: number;
  text?: string;

  languages: Array<{
    id: number,
    name: string,
    isChoosed: boolean,
  }>;

  fileToBeUploadData: Array<{
    audioId?: number,
    fileName: any,
    languageId: number,
    speechIndex: number,
  }>;

  onDelete: (index: number) => void;
  onTextChange: (str: string, index: number) => void;
  onFileChange: (fileName: string, originalText: string, languageId: number, speechIndex: number) => void;
  handleChangeOrder: (newOrder: number, oldOrder: number) => void;
  checkIsOriginalTextEqual: (file: File, speechId: number) => { isEqual: boolean, errorMessage: string };
}

interface IAudioItemState {
  tooltipRemoveOpen: boolean;
  order: number;
}

export default class AudioItem extends React.Component<IAudioItemProps, IAudioItemState> {
  constructor(props: IAudioItemProps) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
    this.deleteHandler = this.deleteHandler.bind(this);
    this.tooltipRemoveToggle = this.tooltipRemoveToggle.bind(this);
    this.state = {
      tooltipRemoveOpen: false,
      order: this.props.order,
    };
  }

  public handleUploadClick(event: any) {
    const parent = event.target.parentElement.parentElement as HTMLElement;
    const ch = parent.getElementsByClassName("choose-audio-btn").namedItem(event.target.id.toString()) as HTMLElement;
    ch.click();
  }

  public tooltipRemoveToggle() {
    this.setState({
      tooltipRemoveOpen: !this.state.tooltipRemoveOpen,
    });
  }

  public render() {
    const languages = [...this.props.languages];
    const filesToUpload = [...this.props.fileToBeUploadData];
    const langList = languages.map((item, index) => (
      <div className="row" key={item.id} id={index.toString()}>
        <div className="col-sm-2 vertical-middle">
          {item.name}:
        </div>

        <input
          key={index}
          className="choose-audio-btn"
          id={item.id.toString()}
          type="file"
          accept="audio/*"
          onChange={this.onChange}
          // @ts-ignore
          onClick={(e) => e.target.value = null}
        />
        <button id={item.id.toString()} className="btn-audio-upload" onClick={this.handleUploadClick}>Завантажити</button>

        <div className="col-sm-6 vertical-middle">
          {filesToUpload.map((file) => {
            if (file.speechIndex === this.props.id && file.languageId === item.id) {
              return <span key={file.speechIndex}>{file.fileName}</span>;
            }
          })}
        </div>
      </div>
    ));

    return (
      <div className="container">
        <div className="row">
          <div className="delete-item">
            <button onClick={this.deleteHandler} className="btn-audio-item-delete" id={"removeButton" + this.props.id}>
              <i id={this.props.id.toString()} className="fas fa-times" ></i>
            </button>
            <Tooltip placement="left" isOpen={this.state.tooltipRemoveOpen} autohide={true} target={"removeButton" + this.props.id} toggle={this.tooltipRemoveToggle}>
              Видалити фразу </Tooltip>
          </div>
          <div className="audio-item">
            <div className="col-sm-12">
              <div className="spanOrder">№ - {this.props.order}</div>
              <textarea
                id={this.props.id.toString()}
                onChange={this.handleChange}
                className="audio-text"
                placeholder="Введіть оригінал тексту до аудіо."
                value={this.props.text}
              />
            </div>
            <div className="col-sm-8" id={this.props.id.toString()}>

              {langList.length > 0 ? langList : <p style={{ color: "red" }}>Виберіть мову</p>}
              <Button outline color="primary" size="sm" onClick={() => {
                this.props.handleChangeOrder(this.state.order, this.props.order);
              }}>Змістити в</Button>
              <input className="inputOrder" type="number" pattern="[0-9]*" onInput={this.onChangeOrderState.bind(this)} />

            </div>

          </div>
        </div>
      </div>
    );
  }

  private onChangeOrderState = (event: any) => {
    this.setState({
      order: parseInt(event.target.value, 10),
    },
    );
  }

  private onChange = async (event: any) => {
    const audio = event.target.files[0];
    const languageId = parseInt(event.target.id, undefined);
    const speechIndex = parseInt(event.target.parentNode.parentNode.id, undefined);

    const result = this.props.checkIsOriginalTextEqual(audio, speechIndex);

    if (result.isEqual) {
      const newName = `${speechIndex}_${languageId}.mp3`;
      const copyAudio = new File([audio], newName, { type: audio.type });
      const formData = new FormData();
      formData.append("File", copyAudio);

      await API.post("audio/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }).then((response) => {
        this.props.onFileChange(copyAudio.name, audio.name, languageId, speechIndex);
      });
    } else {
      alert(result.errorMessage);
    }
  }

  private handleChange = (event: any) => {
    this.props.onTextChange(event.target.value, parseInt(event.target.id, undefined));
  }

  private deleteHandler = (event: any) => {
    const deleteItemId = parseInt(event.target.id, undefined);
    this.props.onDelete(deleteItemId);
  }
}
