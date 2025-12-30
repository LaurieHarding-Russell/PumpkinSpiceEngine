import { Renderer } from '@pumkinspicegames/pumpkinSpiceEngine/renderer';
import { identityMatrix } from '@pumkinspicegames/pumpkinSpiceEngine/util';
import { initShaderProgram } from '@pumkinspicegames/pumpkinSpiceEngine/load-shader';

import { mat4 } from 'gl-matrix';
import { fragmentInstancing, vectorInstancing } from './custom-shaders';



// declare var webglUtils: any;

function main() {
    const gameWindow: HTMLCanvasElement = document.querySelector('#canvas')!;
    const webGl: WebGL2RenderingContext = gameWindow.getContext("webgl2")!;

    const program = initShaderProgram(
        webGl, vectorInstancing, fragmentInstancing);

  const positionLoc = webGl.getAttribLocation(program, 'a_position');
  const colorLoc = webGl.getAttribLocation(program, 'color');
  const matrixLoc = webGl.getAttribLocation(program, 'matrix');

  const positionBuffer = webGl.createBuffer();
  webGl.bindBuffer(webGl.ARRAY_BUFFER, positionBuffer);
  webGl.bufferData(webGl.ARRAY_BUFFER, new Float32Array([
      -0.1,  0.4,
      -0.1, -0.4,
       0.1, -0.4,
       0.1, -0.4,
      -0.1,  0.4,
       0.1,  0.4,
       0.4, -0.1,
      -0.4, -0.1,
      -0.4,  0.1,
      -0.4,  0.1,
       0.4, -0.1,
       0.4,  0.1,
    ]), webGl.STATIC_DRAW);
  const numVertices = 12;

  // setup matrices, one per instance
  const numInstances = 5;
  // make a typed array with one view per matrix
  const matrixData = new Float32Array(numInstances * 16);
  const matrices: Array<mat4> = [];
  for (let i = 0; i < numInstances; ++i) {
    const byteOffsetToMatrix = i * 16 * 4;
    const numFloatsForView = 16;
    matrices.push(new Float32Array(
        matrixData.buffer,
        byteOffsetToMatrix,
        numFloatsForView));
  }

  const matrixBuffer = webGl.createBuffer();
  webGl.bindBuffer(webGl.ARRAY_BUFFER, matrixBuffer);
  // just allocate the buffer
  webGl.bufferData(webGl.ARRAY_BUFFER, matrixData.byteLength, webGl.DYNAMIC_DRAW);

  // setup colors, one per instance
  const colorBuffer = webGl.createBuffer();
  webGl.bindBuffer(webGl.ARRAY_BUFFER, colorBuffer);
  webGl.bufferData(webGl.ARRAY_BUFFER,
      new Float32Array([
          1, 0, 0, 1,  // red
          0, 1, 0, 1,  // green
          0, 0, 1, 1,  // blue
          1, 0, 1, 1,  // magenta
          0, 1, 1, 1,  // cyan
        ]),
      webGl.STATIC_DRAW);

  function render(time: number) {
    time *= 0.001; // seconds

    
    gameWindow.width = window.innerWidth
    gameWindow.height = window.innerHeight

    // Tell WebGL how to convert from clip space to pixels
    webGl.viewport(0, 0, webGl.canvas.width, webGl.canvas.height);

    webGl.useProgram(program);

    webGl.bindBuffer(webGl.ARRAY_BUFFER, positionBuffer);
    webGl.enableVertexAttribArray(positionLoc);
    webGl.vertexAttribPointer(positionLoc, 2, webGl.FLOAT, false, 0, 0);

    // update all the matrices
    matrices.forEach((mat, ndx) => {
        mat4.translate(
            mat,
            identityMatrix(),
            [-0.5 + ndx * 0.25, 0, 0]
        );
        mat4.rotateZ(
            mat,
            mat,
            time * (0.1 + 0.1 * ndx)
        );
    });

    // upload the new matrix data
    webGl.bindBuffer(webGl.ARRAY_BUFFER, matrixBuffer);
    webGl.bufferSubData(webGl.ARRAY_BUFFER, 0, matrixData);

    // set all 4 attributes for matrix
    const bytesPerMatrix = 4 * 16;
    for (let i = 0; i < 4; ++i) {
      const loc = matrixLoc + i;
      webGl.enableVertexAttribArray(loc);
      // note the stride and offset
      const offset = i * 16;  // 4 floats per row, 4 bytes per float
      webGl.vertexAttribPointer(
          loc,              // location
          4,                // size (num values to pull from buffer per iteration)
          webGl.FLOAT,         // type of data in buffer
          false,            // normalize
          bytesPerMatrix,   // stride, num bytes to advance to get to next set of values
          offset,           // offset in buffer
      );
      // this line says this attribute only changes for each 1 instance
      webGl.vertexAttribDivisor(loc, 1);
    }

    // set attribute for color
    webGl.bindBuffer(webGl.ARRAY_BUFFER, colorBuffer);
    webGl.enableVertexAttribArray(colorLoc);
    webGl.vertexAttribPointer(colorLoc, 4, webGl.FLOAT, false, 0, 0);
    // this line says this attribute only changes for each 1 instance
    webGl.vertexAttribDivisor(colorLoc, 1);

    webGl.drawArraysInstanced(
      webGl.TRIANGLES,
      0,             // offset
      numVertices,   // num vertices per instance
      numInstances,  // num instances
    );
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

main();