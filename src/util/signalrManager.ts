import * as signalR from "@aspnet/signalr";
import config from "react-global-configuration";

class SignalrManager {
    public connection: signalR.HubConnection;

    constructor() {
        const backendURL = config.get("urlApi");

        this.connection = new signalR.HubConnectionBuilder()
            .withUrl(`${backendURL}StreamHub`)
            .build();

        this.connection.on("updateCount", (number: string) => {
            const counterBlock: any = document.getElementById("userCounter");

            counterBlock.innerHTML = number;
        });
    }

    public registerEvent(eventName: string, eventAction: any): void {
        this.connection.on(eventName, eventAction);
    }

    public async connectToHub(): Promise<void> {
        console.log("Try to connect to SignalR Hub");

        return await this.connection.start();
    }

    public async disconnectFromHub(): Promise<void> {
        console.log("Try to disconnect from SignalR Hub");

        return await this.connection.stop();
    }

    public async sendCommand(command: string, startTime: number = 0): Promise<void> {
        console.log("Try send to SignalR Hub:" + command);
        
        let time = new Date().getTime();
        console.log(startTime);

        if (startTime !== 0)
            return await this.connection.send("SendMessageAndTime", command, time, startTime);

        return await this.connection.send("SendMessage", command, time);
    }

    public async sendCommandToUser(command: string, startTime: number, connectionId: any) {
        console.log("Try send to SignalR Hub:" + command);

        let time = new Date().getTime();

        return await this.connection.send("SendMessageToUser", command, time, startTime, connectionId);
    }
}

export default SignalrManager;
