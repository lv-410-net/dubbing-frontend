import config from "react-global-configuration";
class ApiManagerLanguage {
    public backendUrl = "";
    constructor() {
        this.backendUrl = config.get("urlApi");
    }
    public async createLang(json: string): Promise<Response> {
        const response = await fetch(`${this.backendUrl}api/Language`, {
            method: "POST",
            headers: {
              "Accept": "application/json",
              "Access-Control-Allow-Origin": "*",
              "Content-Type": "application/json",
            },
            body: json,
        });
        return response;
    }

    public async updateLang(index: number, json: string): Promise<Response> {
        const response = await fetch(`${this.backendUrl}api/Language/${index}`, {
            method: "PUT",
            headers: {
              "Accept": "application/json",
              "Access-Control-Allow-Origin": "*",
              "Content-Type": "application/json",
            },
            body: json,
        });
        return response;
    }
    public async getLang(): Promise<Response> {
        const response = await fetch(`${this.backendUrl}api/Language`, {

            method: "GET",
            headers: {
              "Accept": "application/json",
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
        });
        return response;
    }
    public async getLangById(index: number): Promise<Response> {
        const response = await fetch(`${this.backendUrl}api/Language/${index}`);
        return response;
    }
    public async removeLang(index: number): Promise<Response> {
        const response = await fetch(`${this.backendUrl}api/Language/${index}`, {

            method: "DELETE",
            headers: {
              "Accept": "application/json",
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            }});
        return response;
    }
}
export default ApiManagerLanguage;
