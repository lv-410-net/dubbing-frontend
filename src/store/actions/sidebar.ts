import * as actionTypes from "./actionTypes";

// Change id in central store
export const changeCurrentTabId = (nextId: number) => {
    return {
        type: actionTypes.CHANGE_CURRENT_TAB_ID,
        payload: {
            nextId,
        },
    };
};
