import * as React from "react";
import { connect } from "react-redux";
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from "reactstrap";
import { Tooltip } from "reactstrap";
import { Dispatch } from "redux";

import * as actionCreators from "../../../store/actions/index";
import IGlobalStoreType from "../../../store/state/state";
import API from "../../../util/api";
import Spinner from "../../UI/Spinner/Spinner";
import AudioItem from "../AudioItem/AudioItem";
import "./AudioUpload.css";

enum HttpMethods {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
}

export interface IAudioUploadProps {
  onChangeIsNewFilesLoaded: Function;
  onAddNewFilesName: Function;
  onDeleteNewFilesName: Function;
  onChangeAudioUploadToInitialState: Function;
  isNewFilesLoaded: boolean;
}

export interface IAudioUploadState {
  performanceId: number;
  languages: Array<{
    id: number,
    name: string,
    isChoosed: boolean,
  }>;
  speeches: Array<{
    id: number,
    order: number,
    text?: string,
    isNew?: boolean,
    onDelete: (index: number) => void,
    onTextChange: (str: string, index: number) => void
    onFileChange: (str: string, originalText: string, index: number, speechIndex: number) => void,
  }>;
  fileToBeUploadData: Array<{
    audioId?: number,
    fileName: any,
    originalText: string,
    languageId: number,
    speechIndex: number,
    isNew: boolean,
  }>;
  tooltipAddOpen: boolean;
  dropdownOpen: boolean;
  selectedLanguage?: {
    id: number,
    name: string,
  };
  tooltipUploadBatch: boolean;
  isLoading: boolean;
}

class AudioUpload extends React.Component<IAudioUploadProps, IAudioUploadState> {
  public child = React.createRef<AudioItem>();
  private usedLanguages: Array<{ id: number, name: string }> = [];
  private isFirstLanguage: boolean = true;

  constructor(props: IAudioUploadProps) {
    super(props);

    this.state = {
      performanceId: -1,
      languages: [],
      speeches: [],
      fileToBeUploadData: [],
      tooltipAddOpen: false,
      dropdownOpen: false,
      selectedLanguage: undefined,
      tooltipUploadBatch: false,
      isLoading: true,
    };

    this.addItemHandler = this.addItemHandler.bind(this);
    this.deleteItemHandler = this.deleteItemHandler.bind(this);
    this.uploadHandler = this.uploadHandler.bind(this);
    this.textChangeHandler = this.textChangeHandler.bind(this);
    this.tooltipAddToggle = this.tooltipAddToggle.bind(this);
    // this.handleLangCheckboxChange = this.handleLangCheckboxChange.bind(this);
  }

  public onFileChange = (fileName: string, originalText: string, languageId: number, speechIndex: number) => {
    const filesToBeUploadData = [...this.state.fileToBeUploadData];

    if (this.state.fileToBeUploadData.length > 0) {
      for (let i = 0; i < filesToBeUploadData.length; i++) {
        if (filesToBeUploadData[i].speechIndex === speechIndex && filesToBeUploadData[i].languageId === languageId) {
          filesToBeUploadData[i].fileName = fileName;
          filesToBeUploadData[i].isNew = true;

          this.props.onAddNewFilesName(fileName);
          if (!this.props.isNewFilesLoaded) {
            this.props.onChangeIsNewFilesLoaded(true);
          }

          this.setState({
            fileToBeUploadData: filesToBeUploadData,
          });

          return;
        }
      }
    }
    const item = {
      fileName,
      originalText,
      languageId,
      speechIndex,
      isNew: true,
    };

    filesToBeUploadData.push(item);

    this.setState({
      fileToBeUploadData: filesToBeUploadData,
    });

    this.props.onAddNewFilesName(item.fileName);
    if (!this.props.isNewFilesLoaded) {
      this.props.onChangeIsNewFilesLoaded(true);
    }
  }

  // checking if text any speech is empty
  public isSpeechesCorrect = () => {
    // checking if number of real loaded audios equals expected loaded audios
    const reqCount = this.state.speeches.length * this.state.languages.filter((item) => item.isChoosed).length;
    const langs = [...this.state.languages.filter((i) => i.isChoosed === true).map((item) => item.id)];
    const actualCount = this.state.fileToBeUploadData.filter((item) => langs.find((i) => i === item.languageId)).length;
    if (reqCount !== actualCount) {
      return {
        errorCode: -1,
        errorMessage: "Завантажте аудіо до всіх мов!",
      };
    }

    let isSomeSpeechNullOrEmpty = false;
    this.state.speeches.filter((s) => {
      if (s.text === undefined || s.text === null || s.text === "") {
        isSomeSpeechNullOrEmpty = true;
      }
    });

    if (isSomeSpeechNullOrEmpty) {
      return {
        errorCode: -2,
        errorMessage: "Введіть текст до всіх фраз!",
      };
    }
  }

  // Uploading speeches and file data. Very massive and probably needs
  public uploadHandler = async (performanceId: number, update: boolean) => {
    // @ts-ignore
    let isError: Error = null;
    // if evertything is OK then upload
    this.props.onChangeAudioUploadToInitialState();
    if (update) {
      for (let i = 0; i < this.state.speeches.length; i++) {
        const speech = {
          id: this.state.speeches[i].id,
          text: this.state.speeches[i].text,
          order: this.state.speeches[i].order,
          isNew: this.state.speeches[i].isNew,
          performanceId,
        };

        // Cheking for new speeches
        if (!speech.isNew) {
          await API.put(`speech/${speech.id}`, speech, {
            headers: {
              "Accept": "application/json",
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          }).then(async (response) => {
            await this.uploadAndSaveAudioAsync(speech.id, i, HttpMethods.PUT)
              .catch((error) => {
                console.log(`[uploadAndSaveAudioAsync]: ${error}`);
                isError = error;
              });
          }).catch((error) => {
            console.log(`[uploadHandler] ${error}`);
            isError = error;
          });

        } else { // if speeches is new just uploading them
          // creating speech and relative to him audios

          await API.post("speech", speech, {
            headers: {
              "Accept": "application/json",
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          }).then(async (response) => {
            await this.uploadAndSaveAudioAsync(response.data.id, i, HttpMethods.POST)
              .catch((error) => {
                console.log(`[uploadAndSaveAudioAsync]: ${error}`);
                isError = error;
              });
          }).catch((error) => {
            console.log(`[uploadHandler] ${error}`);
            isError = error;
          });

        }

        if (isError !== null) {
          return {
            errorCode: -3,
            errorMessage: isError.message,
          };
        }
      }

    } else { // if it's not an update just uploading the speeches
      for (let i = 0; i < this.state.speeches.length; i++) {
        const speech = {
          id: 0,
          text: this.state.speeches[i].text,
          performanceId,
          order: this.state.speeches[i].order,
        };

        // creating speech and relative to him audios
        await API.post("speech", speech, {
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }).then(async (response) => {
          await this.uploadAndSaveAudioAsync(response.data.id, i, HttpMethods.POST)
            .catch((error) => {
              console.log(`[uploadAndSaveAudioAsync]: ${error}`);
              isError = error;
            });
        }).catch((error) => {
          console.log(`[uploadHandler] ${error}`);
          isError = error;
        });

        if (isError !== null) {
          return {
            errorCode: -3,
            errorMessage: isError.message,
          };
        }
      }
    }
  }

  // Getting all data. (languages, speeches to performance and audios to speeches)
  public async audioComponentDidMount(performanceId: number) {

    if (performanceId !== -1) {
      const performanceSpeechesResponse = await API.get("performance/" + performanceId + "/speeches");
      if (performanceSpeechesResponse.status === 200) {
        const speeches = [];
        for (let i = 0; i < performanceSpeechesResponse.data.length; i++) {
          const speechItem = {
            id: performanceSpeechesResponse.data[i].id,
            text: performanceSpeechesResponse.data[i].text,
            order: performanceSpeechesResponse.data[i].order,
            languages: this.state.languages,
            onDelete: this.deleteItemHandler,
            onTextChange: this.textChangeHandler,
            onFileChange: this.onFileChange,
          };

          speeches.push(speechItem);
        }

        this.setState({
          performanceId: performanceSpeechesResponse.data.performanceId,
          speeches,
        });
      }

      const files = [];
      for (let i = 0; i < performanceSpeechesResponse.data.length; i++) {
        const audiosToSpeech = await API.get("speech/" + performanceSpeechesResponse.data[i].id + "/audios");

        for (let j = 0; j < audiosToSpeech.data.length; j++) {
          const item = {
            audioId: audiosToSpeech.data[j].id,
            fileName: audiosToSpeech.data[j].fileName,
            originalText: audiosToSpeech.data[j].originalText,
            languageId: audiosToSpeech.data[j].languageId,
            speechIndex: audiosToSpeech.data[j].speechId,
            isNew: false,
          };

          files.push(item);
        }
      }
      const languagesResponse = await API.get("language");

      for (const lang of languagesResponse.data) {
        for (const file of files) {
          if (file.languageId === lang.id) {
            lang.isChoosed = true;
            break;
          }
          else {
            lang.isChoosed = false;
          }
        }
      }
      if (languagesResponse.status === 200) {
        this.setState({
          languages: languagesResponse.data,
        });
      }

      this.setState({
        fileToBeUploadData: files,
      });

    } else {
      const languagesResponse = await API.get("language");
      for (const lang of languagesResponse.data) {
        lang.isChoosed = true;
      }
      if (languagesResponse.status === 200) {
        this.setState({
          languages: languagesResponse.data,
        });
      }
    }

    this.setState({
      isLoading: false,
    });
  }

  public tooltipAddToggle() {
    this.setState({
      tooltipAddOpen: !this.state.tooltipAddOpen,
    });
  }

  // For batch uploading
  public toggleDropdown = () => {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen,
    });
  }

  public toggleSelectedLanguage = (id: number) => {
    if (this.state.selectedLanguage === undefined || this.state.selectedLanguage.id !== id) {
      const language = this.state.languages.find((l) => l.id === id);

      this.setState({
        selectedLanguage: language,
      });
    }
  }

  public tooltipUploadBatchOpen = () => {
    this.setState({
      tooltipUploadBatch: !this.state.tooltipUploadBatch,
    });
  }

  // triggered when click on fake batch files upload button
  public onBatchUpload = (event: any) => {
    event.preventDefault();
    if (this.state.selectedLanguage !== undefined) {
      const input = document.querySelector("#batchUpload") as HTMLInputElement;
      if (input !== null) {
        input.click();
      }
    } else {
      alert("Будь ласка виберіть мову, а тоді вже завантажте файли!");
    }
  }

  // handling batch uploading
  public batchUpload = async (event: any) => {
    this.setState({
      isLoading: true,
    });

    const files = event.target.files as FileList;
    // @ts-ignore
    if (this.isFirstLanguage || this.state.selectedLanguage.id === this.usedLanguages[0].id) {
      for (let i = 0; i < files.length; i++) {
        await this.onBatchAddItem(files[i]);
      }

      this.isFirstLanguage = false;
      this.usedLanguages.push(this.state.selectedLanguage as { id: number, name: string });
    } else {
      this.onBatchUpdateItems(files);
    }

    this.setState({
      isLoading: false,
    });
  }

  public handleChangeOrder = (newOrder: number, oldOrder: number) => {
    const speechesCount = this.state.speeches.length;
    if (newOrder <= speechesCount && newOrder > 0) {
      const speeches = this.state.speeches;
      const oldSpeech = speeches.filter((s) => s.order === oldOrder)[0];
      if (newOrder < oldOrder) {
        const requiredSpeeches = speeches.filter((s) => s.order >= newOrder && s.order < oldOrder);
        for (const requiredSpeech of requiredSpeeches) {
          requiredSpeech.order = requiredSpeech.order + 1;
        }
        oldSpeech.order = newOrder;
        requiredSpeeches.push(oldSpeech);
      } else if (newOrder > oldOrder) {
        const requiredSpeeches = speeches.filter((s) => s.order > oldOrder && s.order <= newOrder);
        for (const requiredSpeech of requiredSpeeches) {
          requiredSpeech.order = requiredSpeech.order - 1;
        }
        oldSpeech.order = newOrder;
        requiredSpeeches.push(oldSpeech);
      }
      this.setState(
        {
          speeches,
        },
      );
    } else {
      alert("Неіснуючий номер фрази!");
    }
  }

  public compare(a: any, b: any) {
    if (a.order < b.order) {
      return -1;
    }
    if (a.order > b.order) {
      return 1;
    }
    return 0;
  }

  public removeNewLoadedFiles = async () => {
    const filesNeededToBeDeleted = this.state.fileToBeUploadData
      .filter((s) => s.isNew)
      .map((f) => f.fileName);

    await this.unloadFilesAsync(filesNeededToBeDeleted);
  }

  public render() {
    const items = [...this.state.speeches].sort(this.compare);
    const langItems = [...this.state.languages].sort((a: any, b: any) => a.name < b.name ? -1 : (a.name > b.name ? 1 : 0));

    const langList = langItems.length !== 0 ?
      langItems.map((item, index) => (
        <label key={item.id}>
          <a>{item.name}: </a>
          <input
            className="langCheckbox"
            name="isGoi"
            type="checkbox"
            checked={item.isChoosed}
            onChange={this.handleLangCheckboxChange(item.id)}
          />
        </label>
      )) :
      <p style={{ color: "grey"}}> Мови відсутні. Добавте мову на початковій сторінці в менеджері мов. </p>;

    const itemsList = items.length !== 0 ?
      items.map((item, index) => (
        <AudioItem
          key={index}
          id={item.id}
          order={item.order}
          text={item.text}
          languages={this.state.languages.filter((item) => item.isChoosed)}
          onDelete={item.onDelete}
          fileToBeUploadData={this.state.fileToBeUploadData}
          onTextChange={item.onTextChange}
          onFileChange={item.onFileChange}
          handleChangeOrder={this.handleChangeOrder}
          checkIsOriginalTextEqual={this.checkIsOriginalTextInFileEqual}
          ref={this.child}
        />
      )) :
      <p style={{ color: "grey", marginTop: 10 }}> Добавте фразу або завантажте пакетом. </p>;

    const languages = this.state.languages.filter((item) => item.isChoosed === true).map((lang) => {
      return (
        <DropdownItem
          key={lang.id}
          onClick={() => this.toggleSelectedLanguage(lang.id)}>{lang.name}</DropdownItem>
      );
    });
    const selectedLanguage = this.state.selectedLanguage === undefined
      ? "Виберіть мову..." : this.state.selectedLanguage.name;
    const isDisabledBatchUpload = this.state.selectedLanguage === undefined ? true : false;

    const batchUploading = (
      <div>
        <label>Пакетом: </label>
        <Dropdown
          className="dropdown-toggle-language"
          isOpen={this.state.dropdownOpen}
          toggle={() => this.toggleDropdown()}
          size="sm">
          <DropdownToggle caret>
            {selectedLanguage}
          </DropdownToggle>
          <DropdownMenu>
            {languages}
          </DropdownMenu>
        </Dropdown>
        <input
          type="file"
          id="batchUpload"
          className="inputFile"
          onChange={this.batchUpload}
          // @ts-ignore
          onClick={(event) => event.target.value = null}
          multiple />
        <button
          id={"batchUploadBtn"}
          className={"fas fa-plus-circle btn-audio-add " + (isDisabledBatchUpload ? "disabled-btn-audio-add" : "")}
          onClick={this.onBatchUpload} />
        <Tooltip placement="top" isOpen={this.state.tooltipUploadBatch} autohide={false} target={"batchUploadBtn"} toggle={this.tooltipUploadBatchOpen}>
          Завантажити аудіо</Tooltip>
      </div>
    );

    return (
      <div className="audio-upload-section">
        <Spinner isShow={this.state.isLoading} />
        <div className="langCheckboxList">
          {langList}
        </div>
        <div className="col-sm-12 audio-header">
          <div>
            <label>Вручну: </label>

            <button className="fas fa-plus-circle btn-audio-add" onClick={this.addItemHandler} id={"addBtn"} />
            <Tooltip placement="right" isOpen={this.state.tooltipAddOpen} autohide={false} target={"addBtn"} toggle={this.tooltipAddToggle}>
              Додати фразу </Tooltip>
          </div>

          {batchUploading}
        </div>
        <div id="audio-container" className="row">
          {itemsList}
        </div>
      </div>
    );
  }

  handleLangCheckboxChange = (id: number) => (e: any) => {
    const langs: any[] = [];
    const langState = [...this.state.languages];

    for (const lang of langState) {
      if (lang.id === id) {
        lang.isChoosed = !lang.isChoosed;
        // @ts-ignore
        if (this.state.selectedLanguage !== undefined && lang.isChoosed == false && lang.id == this.state.selectedLanguage.id) {
          this.setState({
            selectedLanguage: undefined,
          });
        }

        langs.push(lang);
      } else {
        langs.push(lang);
      }
    }

    this.setState({
      languages: langs,
    });
  }

  private checkIfNewAudiosAreLoaded = (): boolean => {
    if (this.state.performanceId === -1) {
      return this.state.fileToBeUploadData.length > 0 ? true : false;
    } else {
      const newFiles = this.state.fileToBeUploadData.filter((f) => f.isNew === true);
      return newFiles.length > 0 ? true : false;
    }
  }

  // Uploading audio files and creating records in database which contain data about them
  private uploadAndSaveAudioAsync = async (speechIdentifier: number, speechIndex: number, method: HttpMethods) => {
    const langs = [...this.state.languages.filter((i) => i.isChoosed === true).map((item) => item.id)];
    const files = [...this.state.fileToBeUploadData.filter((item) => langs.find((i) => i === item.languageId))];
    const unloadFiles = [...this.state.fileToBeUploadData.filter((item) => !langs.find((i) => i === item.languageId))];

    for (let j = 0; j < files.length; j++) {
      if (files[j].speechIndex === this.state.speeches[speechIndex].id) {
        if (method === HttpMethods.POST) {

          const item = {
            fileName: files[j].fileName,
            originalText: files[j].originalText,
            languageId: files[j].languageId,
            speechId: speechIdentifier,
          };

          await API.post("audio", item, {
            headers: {
              "Accept": "application/json",
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          });
        } else if (method === HttpMethods.PUT) {
          const item = {
            fileName: files[j].fileName,
            originalText: files[j].originalText,
            languageId: files[j].languageId,
            speechId: speechIdentifier,
            id: files[j].audioId,
          };
          if (item.id === undefined) {
            await API.post("audio", item, {
              headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
              },
            });
          } else {
            await API.put("audio/" + item.id, item, {
              headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
              },
            });
          }

          const audiosToSpeech = await API.get("speech/" + item.speechId + "/audios");

          const noChoosedLangId = this.state.languages.filter((item) => item.isChoosed === false).map((x) => x.id);
          for (const file of audiosToSpeech.data) {
            if (noChoosedLangId.find((i) => i === file.languageId)) {
              await API.delete(`audio/${file.id}`, {
                headers: {
                  "Accept": "application/json",
                  "Content-Type": "application/json",
                  "Access-Control-Allow-Origin": "*",
                },
              });
            }
          }
        }
      }
    }

    this.unloadFilesAsync(unloadFiles.map((item) => item.fileName));
  }

  private onBatchAddItem = async (file: File) => {
    const speechItem = this.addItemHandler();

    this.changeAndAssignTextToSpeech(speechItem, file);

    // upload audio to file system of server

    // @ts-ignore
    const newName = `${speechItem.id}_${this.state.selectedLanguage.id}.mp3`;
    const copyAudio = new File([file], newName, { type: file.type });

    const formData = new FormData();
    formData.append("File", copyAudio);

    await API.post("audio/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }).then(() => {
      // @ts-ignore
      this.onFileChange(copyAudio.name, file.name, this.state.selectedLanguage.id, speechItem.id);
    }).catch(() => {
      alert("Sorry! Some error was occured!");
      return;
    });
  }

  private changeAndAssignTextToSpeech = (speechItem: any, file: File) => {
    // remove suffix ".mp3" from file name
    const regex = /\.mp3$/;
    const subStringIndex = file.name.search(regex);
    const originalText = file.name.substring(0, subStringIndex);

    // create cope needed speech and assign the file name
    const neededSpeechIndex = this.state.speeches.findIndex((sp) => sp.id === speechItem.id);
    const neededSpeech = { ...this.state.speeches[neededSpeechIndex] };
    neededSpeech.text = originalText;

    // update the speech
    const speeches = [...this.state.speeches];
    speeches[neededSpeechIndex] = neededSpeech;
    this.setState({
      speeches,
    });
  }

  private onBatchUpdateItems = async (files: FileList) => {
    const neededFiles = this.state.fileToBeUploadData
      // @ts-ignore
      .filter((f) => f.languageId === this.state.selectedLanguage.id)
      .map((f) => f.speechIndex);

    const neededSpeeches = this.state.speeches.filter((s) => {
      return !neededFiles.includes(s.id);
    }).sort((s1, s2) => s1.order > s2.order ? 1 : -1);

    if (files.length <= neededSpeeches.length) {
      // checking if audio filename if one language is equal to audio filename another language (must be equal!)
      let result: { isEqual: boolean, errorMessage: string } = { isEqual: true, errorMessage: "" };

      for (let i = 0; i < files.length; i++) {
        result = this.checkIsOriginalTextInFileEqual(files[i], neededSpeeches[i].id);
        if (!result.isEqual) {
          break;
        }
      }

      if (result.isEqual) {
        for (let i = 0; i < files.length; i++) {
          const audio = files[i];

          // @ts-ignore
          const newName = `${neededSpeeches[i].id}_${this.state.selectedLanguage.id}.mp3`;
          const copyAudio = new File([audio], newName, { type: audio.type });

          const formData = new FormData();
          formData.append("File", copyAudio);

          await API.post("audio/upload", formData, {
            headers: {
              "content-type": "multipart/form-data",
            },
          })
            // @ts-ignore
            .then(() => this.onFileChange(copyAudio.name, audio.name, this.state.selectedLanguage.id, neededSpeeches[i].id))
            .catch(() => alert("Sorry, some error occured..."));
        }
      } else {
        alert(result.errorMessage);
      }
    } else {
      alert("Некоретна вибрана кількість файлів.");
    }
  }

  private checkIsOriginalTextInFileEqual = (file: File, speechId: number): { isEqual: boolean, errorMessage: string } => {
    const relatedAudioFiles = [
      ...this.state.fileToBeUploadData.filter((f) => f.speechIndex === speechId),
    ];

    if (relatedAudioFiles.length > 0) {
      if (relatedAudioFiles[0].originalText !== file.name) {
        const neededSpeech = this.state.speeches.find((s) => s.id === speechId);
        if (neededSpeech !== undefined) {
          return {
            isEqual: false,
            errorMessage: `Ім'я аудіо файлу не співпадає з іменем файлу, ` +
              `що був вже завантажений до даної репліки під номером ${neededSpeech.order}.`,
          };
        } else {
          return {
            isEqual: true,
            errorMessage: "Error!",
          };
        }
      }
    }

    return {
      isEqual: true,
      errorMessage: "",
    };
  }

  private addItemHandler = () => {
    const speeches = this.state.speeches;
    const maxSpeechId = this.state.speeches.length !== 0 ? Math.max.apply(null, this.state.speeches.map((obj) => obj.id)) + 1 : 0;

    const speechItem = {
      id: maxSpeechId,
      text: "",
      order: 1,
      languages: this.state.languages,
      isNew: true,
      onDelete: this.deleteItemHandler,
      onTextChange: this.textChangeHandler,
      onFileChange: this.onFileChange,
    };
    if (speeches.length !== 0) {
      speechItem.order = this.state.speeches.length !== 0 ? Math.max.apply(null, this.state.speeches.map((obj) => obj.order)) + 1 : 1;
    }
    speeches.push(speechItem);

    this.setState({
      speeches,
    });

    return {
      ...speechItem,
    };
  }

  private deleteItemHandler = async (index: number) => {
    this.setState({
      isLoading: true,
    });
    const neededSpeech = this.state.speeches.find((s) => s.id === index);
    if (neededSpeech !== undefined) {
      if (this.state.performanceId === -1) {
        await this.removeLocalSpeechesAsync(index)
          .catch((error) => alert(error));
      } else {
        if (!neededSpeech.isNew) {
          const removeResponse = await API.delete("speech/" + index);

          if (removeResponse.status === 204) {
            const localNewFiles = this.state.fileToBeUploadData.filter((f) => f.isNew && f.speechIndex === index);

            if (localNewFiles.length > 0) {
              this.props.onDeleteNewFilesName(localNewFiles);
              await this.unloadFilesAsync(localNewFiles.map((f) => f.fileName));
            }

            const speeches = this.state.speeches.filter((obj) => {
              return obj.id !== index;
            });

            const requiredSpeeches = speeches.filter((s) => s.order > neededSpeech.order);
            for (const requiredSpeech of requiredSpeeches) {
              requiredSpeech.order = requiredSpeech.order - 1;
            }

            const audios = this.state.fileToBeUploadData.filter((obj) => {
              return obj.speechIndex !== index;
            });

            this.setState({
              speeches,
              fileToBeUploadData: audios,
            });
          } else {
            alert(removeResponse.data);
          }
        } else {
          await this.removeLocalSpeechesAsync(index)
            .catch((error) => alert(error));
        }
      }
    }

    this.setState({
      isLoading: false,
    });
  }

  private removeLocalSpeechesAsync = async (index: number): Promise<void> => {
    const speeches = this.state.speeches.filter((obj) => {
      return obj.id !== index;
    });

    const mustToBeDeletedAudios: string[] = [];
    const audios = this.state.fileToBeUploadData.filter((obj) => {
      if (obj.speechIndex !== index) {
        return obj;
      } else {
        mustToBeDeletedAudios.push(obj.fileName);
      }
    });

    this.props.onDeleteNewFilesName(mustToBeDeletedAudios);
    await this.unloadFilesAsync(mustToBeDeletedAudios);
    const neededSpeech = this.state.speeches.find((s) => s.id === index);

    // @ts-ignore
    const requiredSpeeches = speeches.filter((s) => s.order > neededSpeech.order);
    for (const requiredSpeech of requiredSpeeches) {
      requiredSpeech.order = requiredSpeech.order - 1;
    }
    this.setState({
      speeches,
      fileToBeUploadData: audios,
    });
  }

  private unloadFilesAsync = async (mustToBeDeletedAudios: string[]) => {
    if (mustToBeDeletedAudios.length > 0) {
      let query = "?";
      for (const audio of mustToBeDeletedAudios) {
        query += `files=${audio}&`;
      }
      query.slice(query.length - 1, 1);

      await API.delete("/audio/unload/" + query);
    }
  }

  private textChangeHandler = (str: string, index: number) => {
    const speeches = [...this.state.speeches];

    for (let i = 0; i < speeches.length; i++) {
      if (speeches[i].id === index) {
        speeches[i].text = str;
      }
    }

    this.setState({
      speeches,
    });
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    onChangeIsNewFilesLoaded: (nextValue: boolean) => dispatch(actionCreators.changeIsNewFilesLoaded(nextValue)),
    onAddNewFilesName: (filename: string) => dispatch(actionCreators.addNewFilesName(filename)),
    onDeleteNewFilesName: (filenames: string[]) => dispatch(actionCreators.deleteNewFilename(filenames)),
    onChangeAudioUploadToInitialState: () => dispatch(actionCreators.changeAudioUploadToInitialState()),
  };
};

const mapStateToProps = (store: IGlobalStoreType) => {
  return {
    isNewFilesLoaded: store.audioUpload.isNewFilesLoaded,
  };
};

export default connect(mapStateToProps, mapDispatchToProps, null, { forwardRef: true })(AudioUpload);
