import { Renderer } from '@pumkinspicegames/pumpkinSpiceEngine/renderer';
import { Vector3 } from "@pumkinspicegames/pumpkinSpiceEngine/model/vector";
import { BufferFactory, tileModalReference } from "@pumkinspicegames/pumpkinSpiceEngine/buffer-factory";
import { ShadersType } from "@pumkinspicegames/pumpkinSpiceEngine/model/model-reference";
import { ModelResources } from './models';
import { wavyFragmentSource, wavyVectorSource } from './custom-shaders';

const maxZoom = -1;
const minZoom = -20;

var map: Array<string> = ["1"];
var selectedType = '0';


var renderer: Renderer;
let position:Vector3 = {
    x: 0,
    y: 0,
    z: 0
}
let camera = {
    position: {
        x: 0,
        y: 0,
        z: -20
    }, 
    rotation: {
        x: 0,
        y: 0,
        z: 0
    }
}

// FIXME, time hack
setTimeout(() => {

    initializeMovementListeners();

    const gameWindow: HTMLCanvasElement | null = document.querySelector("#screen")    

    if (gameWindow == null) {
        throw "couldn't find things and magic and stuff";
    }

    const webGl: WebGL2RenderingContext | null = gameWindow.getContext("webgl2");
    if (webGl == null) throw "oh no! uggg";

    let modelResources = new ModelResources();
    modelResources.load().then(() => {
      let bufferFactory = new BufferFactory();
      bufferFactory
        .addModel("Cube", modelResources.cube, "Custom")
        .defaultSkin = modelResources.defaultSkin;

        renderer = new Renderer(webGl);
        renderer.start(bufferFactory).then(() => {
            renderer.addShader("Custom", {vectorSource: wavyVectorSource, fragSource: wavyFragmentSource})
            // FIXME, loading
            setInterval(() => {
                gameWindow.width = window.innerWidth
                gameWindow.height = window.innerHeight

                renderer.setProjectionMatrix(camera);

                renderer.renderMain(position, 
                    bufferFactory.modelReferences.get("Cube")!
                );
            }, 33)
        });
    });
}, 1000);

function initializeMovementListeners() {
    document.addEventListener('keydown', (event: KeyboardEvent) => {

        if (event.key == '8') {
            camera.rotation.x += 0.1;
        }

        if (event.key == '2') {
            camera.rotation.x -= 0.1;
        }

        if (event.key == '4') {
            camera.rotation.z -= 0.1;
        }

        if (event.key == '6') {
            camera.rotation.z += 0.1;
        }

        if (event.key == 'a') {
            camera.position.x += 0.1;
        }

        if (event.key == 'd') {
            camera.position.x -= 0.1;
        }

        if (event.key == 'w') {
            camera.position.y -= 0.1;
        }

        if (event.key == 's') {
            camera.position.y += 0.1;
        }
    }, false);
    
    document.onwheel = (event: WheelEvent) => {
        event.preventDefault();
        camera.position.z += event.deltaY * -0.01;
        camera.position.z = Math.min(Math.max(minZoom, camera.position.z), 0);
    }
}