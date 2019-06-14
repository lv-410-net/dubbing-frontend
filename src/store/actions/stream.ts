import ApiManager from "../../util/apiManager";
import * as actionTypes from "./actionTypes";

// Save performance Id in central Store
export const savePerformanceId = (id: number) => {
    return {
        payload: {
            id,
        },
        type: actionTypes.SAVE_PERFORMANCE_ID,
    };
};

// Load Speeches and store them in central store
export const saveSpeeches = (data: any) => {
    return {
        payload: {
            speeches: data,
        },
        type: actionTypes.LOAD_SPEECHES,
    };
};

// Save new current speech id in central store
export const saveCurrentSpeechId = (id: number) => {
    return {
        payload: {
            currentSpeechId: id,
        },
        type: actionTypes.SAVE_CURRENT_SPEECH_ID,
    };
};

// Change streaming status to the opposite previous
export const changeStreamingStatus = (status: boolean) => {
    return {
        payload: {
            isPlaying: status,
        },
        type: actionTypes.CHANGE_STREAMING_STATUS,
    };
};

// Change stream state to initial
export const changeStreamStateToInitial = () => {
    return {
        type: actionTypes.CHANGE_STREAM_STATE_TO_INITIAL,
    };
};

// Change current playback time
export const changeCurrentPlaybackTime = (currentPlaybackTime: number) => {
    return {
        payload: {
            currentPlaybackTime,
        },
        type: actionTypes.CHANGE_CURRENT_PLAYBACK_TIME,
    };
};

// Change connecting status
export const changeConnectingStatus = (status: boolean) => {
    return {
        payload: {
            status,
        },
        type: actionTypes.CHANGE_CONNECTING_STATUS,
    };
};
