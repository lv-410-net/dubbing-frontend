import API from "../../util/api";
import * as actionTypes from "./actionTypes";

// changing isNewFilesLoaded status
export const changeIsNewFilesLoaded = (nextValue: boolean) => {
    return {
        type: actionTypes.CHANGE_IS_NEW_FILES_LOADED,
        payload: {
            nextValue,
        },
    };
};

// adding new filesname
export const addNewFilesName = (filename: string) => {
    return {
        type: actionTypes.ADD_NEW_FILES_NAME,
        payload: {
            filename,
        },
    };
};

// deleting new files name
export const deleteNewFilename = (filenames: string[]) => {
    return {
        type: actionTypes.DELETE_NEW_FILES_NAME,
        payload: {
            filenames,
        },
    };
};

export const changeAudioUploadToInitialState = () => {
    return {
        type: actionTypes.CHANGE_AUDIO_UPLOAD_TO_INITIAL_STATE,
        payload: {
        },
    };
};
