import { ModelInfo } from "@pumkinspicegames/pumpkinSpiceEngine/model-info";
import { loadPSObject } from "@pumkinspicegames/pumpkinSpiceEngine/ps.loader";

export class ModelResources {
    

    cube!: ModelInfo;
    defaultSkin!: TexImageSource
    
    constructor() {
    }

    public async load() {
        await this.loadCube();
    }

    public async loadModel(name: string, skin: TexImageSource): Promise<ModelInfo> {
        let result = await this.makeRequest("GET", name);
        return loadPSObject(result, skin);
    }

    public async loadSkin(name: string): Promise<TexImageSource> {
        const resultSkin = new Image();
        resultSkin.src = name;
        await resultSkin.decode();
        return resultSkin;
    }
    

    private async loadCube() {
        const resultSkin = await this.loadSkin("cube.png");
        this.cube = await this.loadModel("cube.ps", resultSkin);
        this.defaultSkin = await this.loadSkin("cube.png");
    }

    private makeRequest(method: string, url: string): Promise<string> {
        return new Promise(function (resolve, reject) {
            let request = new XMLHttpRequest();
            request.open(method, url);
            request.onload = function () {
                if (this.status >= 200 && this.status < 300) {
                    resolve(request.responseText);
                } else {
                    reject({
                        status: this.status,
                        statusText: request.statusText
                    });
                }
            };
            request.onerror = function () {
                reject({
                    status: this.status,
                    statusText: request.statusText
                });
            };
            request.send();
        });
    }
}

