import React from "react";
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from "reactstrap";

interface IDropdownLanguageState {
    dropdownOpen: boolean;
    currentLanguage: {
        id: number,
        name: string,
    };
}
interface IDropdownLanguageProps {
    updateCurrentLang: any;
    languages: Array<{
        id: number,
        name: string,
    }>;
}

export default class DropdownLanguage extends React.Component<IDropdownLanguageProps, IDropdownLanguageState> {
    constructor(props: any) {
        super(props);

        this.toggle = this.toggle.bind(this);
        this.state = {
            currentLanguage: { id: 0, name: "Мова" },
            dropdownOpen: false,
        };
    }

    public toggle() {
        this.setState((prevState) => ({
            dropdownOpen: !prevState.dropdownOpen,
        }));
    }

    public changeCurrentLanguageHandler = (lang: any) => {
        const curLang = lang;
        this.props.updateCurrentLang(curLang);
        this.setState((state) => ({
            currentLanguage: curLang,
        }));
    }

    public compare(a: any, b: any) {
        if (a.name < b.name) {
          return -1;
        }
        if (a.name > b.name) {
          return 1;
        }
        return 0;
      }

    public render() {
        let language = null;
        const sortable = this.props.languages.sort(this.compare);

        language = (
            <div>
                {sortable.map((lang, index) => {
                    index = lang.id;
                    return <DropdownItem key={index} onClick={() => this.changeCurrentLanguageHandler(lang)}>{lang.name}</DropdownItem>;
                })}
            </div>
        );

        return (
            <Dropdown isOpen={this.state.dropdownOpen} toggle={this.toggle}>
                <DropdownToggle caret>
                    {this.state.currentLanguage.name}
                </DropdownToggle>
                <DropdownMenu>
                    {language}
                </DropdownMenu>
            </Dropdown>
        );

    }
}
