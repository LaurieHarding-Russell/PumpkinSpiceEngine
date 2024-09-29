import { BufferFactory, Buffers, VALUES_PER_JOINT_ID, VALUES_PER_JOINT_WEIGHT, VALUES_PER_NORMAL, VALUES_PER_TEXTURE_COORDINATES, VALUES_PER_VERT, bufferStride } from "./buffer-factory";
import { phongVectorSource, phongFragmentSource } from "./shaders/phong-blin";

export function openGlInitMainRenderer(webGl: WebGLRenderingContext, buffers: Buffers): object {
    const shaderProgram = initShaderProgram(webGl, phongVectorSource, phongFragmentSource);

    const programInfo = {
      program: shaderProgram,
      attribLocations: {
        vertexPosition: webGl.getAttribLocation(shaderProgram, 'inputPosition'),
        inputNormal: webGl.getAttribLocation(shaderProgram, 'inputNormal'),
        texcoordLocation: webGl.getAttribLocation(shaderProgram, 'inputUV'),
      },
      uniformLocations: {
        projectionMatrix: webGl.getUniformLocation(shaderProgram, 'projection'),
        modelViewMatrix: webGl.getUniformLocation(shaderProgram, 'modelview'),
        normalMatrix: webGl.getUniformLocation(shaderProgram, 'normalMat'),
        texture: webGl.createTexture()
      },
    };
    {
      const normalize = false; // don't normalize

      // 0 = use type and numComponents above
      const offset = 0; // how many bytes inside the buffer to start from

      webGl.bindBuffer(webGl.ARRAY_BUFFER, buffers.general);
      webGl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        VALUES_PER_VERT,
        webGl.FLOAT,
        normalize,
        bufferStride,
        offset);
      webGl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

      webGl.vertexAttribPointer(
        programInfo.attribLocations.inputNormal,
        VALUES_PER_NORMAL,
        webGl.FLOAT,
        normalize,
        bufferStride,
        VALUES_PER_VERT*Float32Array.BYTES_PER_ELEMENT);
      webGl.enableVertexAttribArray(programInfo.attribLocations.inputNormal);

      webGl.vertexAttribPointer(
        programInfo.attribLocations.texcoordLocation,
        VALUES_PER_TEXTURE_COORDINATES,
        webGl.FLOAT,
        normalize,
        bufferStride,
        (VALUES_PER_VERT + VALUES_PER_NORMAL)* Float32Array.BYTES_PER_ELEMENT);
      webGl.enableVertexAttribArray(programInfo.attribLocations.texcoordLocation);
      
    }
    return programInfo;
  }

//
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram(gl: any, vsSource: any, fsSource: any) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // Create the shader program

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }

  return shaderProgram;
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl: any, type: any, source: any) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}
