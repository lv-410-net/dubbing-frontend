import * as actionTypes from "../actions/actionTypes";

interface ISidebarStateType {
    currentTabId: number;
}

interface IActionType {
    type: string;
    payload: any;
}

const initialState: ISidebarStateType = {
    currentTabId: 0,
};

const sidebar = (state: ISidebarStateType = initialState, action: IActionType) => {
    const updatedState = {
        ...state,
    };

    switch (action.type) {
        case actionTypes.CHANGE_CURRENT_TAB_ID:
            updatedState.currentTabId = action.payload.nextId;
            break;
    }

    return updatedState;
};

export default sidebar;
