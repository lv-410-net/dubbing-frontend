export default interface IState {
    stream: {
        performanceId: number,
        speeches: Array<{
            id: number,
            text: string,
            duration: number,
        }>,
        connectingStatus: boolean,
        isPlaying: boolean,
        currentSpeechId: number,
        currentSpeechIndex: number,
        currentPlaybackTime: number,
        maxDuration: number,
        paused: boolean,
        isFirst: boolean,
    };
    audioUpload: {
        isNewFilesLoaded: boolean,
        newFilesName: string[],
    };
    sidebar: {
        currentTabId: number,
    };
}
