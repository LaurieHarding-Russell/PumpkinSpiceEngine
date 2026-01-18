import { Renderer } from '@pumkinspicegames/pumpkinSpiceEngine/renderer';

import { ModelResources } from './models';
import { Vector3 } from '@pumkinspicegames/pumpkinSpiceEngine/model/vector';
import { ShadersType } from '@pumkinspicegames/pumpkinSpiceEngine/model/model-reference';
import { lookAtPerspective, getPerspective } from "@pumkinspicegames/pumpkinSpiceEngine/util";
import { BufferFactory } from '@pumkinspicegames/pumpkinSpiceEngine/shaders/buffer-factory';

const maxZoom = -1;
const minZoom = -20;

var renderer: Renderer = new Renderer();

let camera = {
    position: {
        x: 10,
        y: 10,
        z: 10
    }, 
    rotation: {
        x: 0,
        y: 0,
        z: 0
    }
}

function main() {
    const gameWindow: HTMLCanvasElement = document.querySelector("#screen")!;
    const stats: HTMLDivElement = document.querySelector("#states")!;
    const webGl: WebGL2RenderingContext = gameWindow.getContext("webgl2")!;

    let modelResources = new ModelResources();
    modelResources.load().then(() => {

        let bufferFactory = new BufferFactory();
        bufferFactory
            .addModel("Cube", modelResources.cube, ShadersType.main)
            .defaultSkin = modelResources.defaultSkin;

        renderer.setWebGl(webGl);

        renderer.initialize(bufferFactory).then(() => {
            initializeMovementListeners();

            // setup colors, one per instance
            const colorBuffer = webGl.createBuffer();
            webGl.bindBuffer(webGl.ARRAY_BUFFER, colorBuffer);

            renderer.getShader(ShadersType.main).setTexture(bufferFactory.modelReferences.get("Cube")!);

            let render = () => {
                gameWindow.width = window.innerWidth
                gameWindow.height = window.innerHeight

                renderer.setProjectionMatrix(lookAtPerspective(camera, {x: 0, y:0, z: 20}, {x: 0, y:1, z: 0}, getPerspective(webGl)));
            
                renderer.renderMain({x: 0,y: 0, z: 0}, {x: 0,y: 0,z: 0}, bufferFactory.modelReferences.get("Cube")!);

                requestAnimationFrame(render);

                stats.innerHTML = `
                    camera x: ${camera.position.x}
                    camera y: ${camera.position.y}
                    camera z: ${camera.position.z}

                    camera rx: ${camera.rotation.x}
                    camera ry: ${camera.rotation.y}
                    camera rz: ${camera.rotation.z}
                , ` 
            }
            requestAnimationFrame(render);
        });
    });
}

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

        if (event.key == 'z') {
            camera.position.z += 0.1;
        }

        if (event.key == 'x') {
            camera.position.z -= 0.1;
        }

    }, false);
    
    document.onwheel = (event: WheelEvent) => {
        event.preventDefault();
        camera.position.z += event.deltaY * -0.01;
        camera.position.z = Math.min(Math.max(minZoom, camera.position.z), 0);
    }
}

// FIXME, time hack
setTimeout(() => {
    main();
});