import * as actionTypes from "../actions/actionTypes";

interface IActionType {
    type: string;
    payload: any;
}

interface IStateType {
    performanceId: number;
    speeches?: Array<{
        id: number,
        text: string,
        duration: number,
        order: number,
    }>;
    connectingStatus: boolean;
    isPlaying: boolean;
    currentSpeechId: number;
    currentSpeechIndex: number;
    currentPlaybackTime: number;
    maxDuration: number;
}

const initialState = {
    connectingStatus: false,
    currentPlaybackTime: 0,
    currentSpeechId: -1,
    currentSpeechIndex: -1,
    isPlaying: false,
    maxDuration: 0,
    performanceId: -1,
    speeches: undefined,
};

const reducer = (state: IStateType = initialState, action: IActionType) => {
    let updatedState = {
        ...state,
    };

    switch (action.type) {
        case actionTypes.SAVE_PERFORMANCE_ID:
            updatedState.performanceId = action.payload.id;
            break;
        case actionTypes.LOAD_SPEECHES:
            if (action.payload.speeches.length !== 0) {
                updatedState.speeches = action.payload.speeches.sort((s1: any, s2: any) => s1.order > s2.order ? 1 : -1);
                updatedState.currentSpeechId = action.payload.speeches[0].id;

                updatedState.currentSpeechIndex = 0;
                updatedState.maxDuration = action.payload.speeches[0].duration;
            }
            break;
        case actionTypes.SAVE_CURRENT_SPEECH_ID:
            updatedState.currentSpeechId = action.payload.currentSpeechId;
            updatedState.currentSpeechIndex = state.speeches !== undefined ?
                state.speeches.findIndex((speech) => speech.id === action.payload.currentSpeechId) : -1;

            const currentSpeech = state.speeches !== undefined ?
                state.speeches.find((s) => s.id === action.payload.currentSpeechId) : undefined;
            updatedState.maxDuration = currentSpeech !== undefined ? currentSpeech.duration : 0;
            break;
        case actionTypes.CHANGE_STREAMING_STATUS:
            updatedState.isPlaying = action.payload.isPlaying;
            break;
        case actionTypes.CHANGE_CURRENT_PLAYBACK_TIME:
            updatedState.currentPlaybackTime = action.payload.currentPlaybackTime;
            break;
        case actionTypes.CHANGE_STREAM_STATE_TO_INITIAL:
            updatedState = initialState;
            break;
        case actionTypes.CHANGE_CONNECTING_STATUS:
            updatedState.connectingStatus = action.payload.status;
            break;
        default:
            break;
    }

    return updatedState;
};

export default reducer;
