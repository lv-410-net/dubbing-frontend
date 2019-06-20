class PlaybackManager {
    public currentTime: number;
    private maxDuration: number;
    private isPause: boolean;
    private timerId: any;
    private tempTime: number;

    constructor() {
        this.currentTime = 0;
        this.maxDuration = 0;
        this.isPause = true;
        this.timerId = 0;
        this.tempTime = 0;
    }

    public play = (changeCurrentPlaybackTime: any, pause: any, reset: any, totalDuration: number, currTime: number) => {
            if (!this.timerId) {
                this.isPause = false;
                this.currentTime = currTime;
                this.maxDuration = totalDuration;
                this.timerId = setInterval(() => {
                    if (!this.isPause && this.currentTime < this.maxDuration) {
                        this.currentTime++;
                        changeCurrentPlaybackTime(this.currentTime);
                    } else if (this.currentTime >= this.maxDuration) {
                        reset();
                    }
                }, 1000);
            }
        }

    public pause = () => {
        if (this.timerId) {
            this.isPause = true;
            this.tempTime = this.currentTime;
            clearInterval(this.timerId);
        }
    }

    public resume = (changeCurrentPlaybackTime: any, reset: any) => {
        if (this.timerId) {
            this.isPause = false;
            this.currentTime = this.tempTime;
            this.timerId = setInterval(() => {
                if (!this.isPause && this.currentTime < this.maxDuration) {
                    this.currentTime++;
                    changeCurrentPlaybackTime(this.currentTime);
                } else if (this.currentTime >= this.maxDuration) {
                    reset();
                }
            }, 1000);
        }
    }

    public reset = (onChangeCurrentPlaybackTime: any) => {
        if (this.timerId) {
            this.isPause = true;
            //this.currentTime = 0;
            onChangeCurrentPlaybackTime(this.currentTime);

            clearInterval(this.timerId);
            this.timerId = 0;
        }
    }
}

export const playbackManager = new PlaybackManager();
