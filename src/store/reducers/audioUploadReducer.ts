import * as actionTypes from "../actions/actionTypes";

interface IStateType {
    isNewFilesLoaded: boolean;
    newFilesName: string[];
}

interface IActionType {
    type: string;
    payload: any;
}

const initialState: IStateType = {
    isNewFilesLoaded: false,
    newFilesName: [],
};

const audioUploadReducer = (state: IStateType = initialState, action: IActionType) => {
    const updatedState = {
        ...state,
    };

    switch (action.type) {
        case actionTypes.CHANGE_IS_NEW_FILES_LOADED:
            updatedState.isNewFilesLoaded = action.payload.nextValue;
            break;
        case actionTypes.ADD_NEW_FILES_NAME:
            updatedState.newFilesName.push(action.payload.filename);
            break;
        case actionTypes.DELETE_NEW_FILES_NAME:
            const updatedNewFiles = updatedState.newFilesName.filter((file) => !action.payload.filenames.includes(file));
            updatedState.newFilesName = updatedNewFiles;
            updatedState.isNewFilesLoaded = updatedNewFiles.length > 0 ? true : false;
            break;
        case actionTypes.CHANGE_AUDIO_UPLOAD_TO_INITIAL_STATE:
            updatedState.isNewFilesLoaded = false;
            updatedState.newFilesName = [];
            break;
    }

    return updatedState;
};

export default audioUploadReducer;
