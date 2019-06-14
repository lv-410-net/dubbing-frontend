import config from "react-global-configuration";

class ApiManager {
    public backendUrl = "";

    constructor() {
        this.backendUrl = config.get("urlApi");
    }

    public async createPerformance(json: string): Promise<Response> {
        return await fetch(`${this.backendUrl}api/Performance`, {
            body: json,
            headers: {
                "Accept": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json",
            },
            method: "POST",
        }).catch((error) => {
            return error;
        });
    }

    public async updatePerformance(json: string, id: number): Promise<Response> {
        return await fetch(`${this.backendUrl}api/Performance/${id}`, {
            body: json,
            headers: {
                "Accept": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json",
            },
            method: "PUT",
        }).catch((error) => {
            return error;
        });
    }

    public async getPerformances(): Promise<Response> {
        return await fetch(`${this.backendUrl}api/Performance`, {
            headers: {
                "Accept": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json",
            },
            method: "GET",
        }).then((data) => {
            return data;
        }).catch((error) => {
            return error;
        });
    }

    public async getPerformanceById(index: number): Promise<Response> {
        return await fetch(`${this.backendUrl}api/Performance/${index}`, {
            headers: {
                "Accept": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json",
            },
            method: "GET",
        }).catch((error) => {
            return error;
        });
    }

    public async removePerformance(index: number): Promise<Response> {
        return await fetch(`${this.backendUrl}api/Performance/${index}`, {
            headers: {
                "Accept": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json",
            },
            method: "DELETE",
        }).catch((error) => {
            return error;
        });
    }

    // Using for display list of speeches on stream page
    public async getSpeechInfo(indexPerfomance: number): Promise<Response> {
        return await fetch(`${this.backendUrl}api/performance/${indexPerfomance}/speeches`, {
            headers: {
                "Accept": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json",
            },
            method: "GET",
        }).catch((error) => {
            return error;
        });
    }
}

export default ApiManager;
