import { Buffers, VALUES_PER_NORMAL, VALUES_PER_TEXTURE_COORDINATES, VALUES_PER_VERT, bufferStride } from "./buffer-factory";

// FIXME, maybe change this to a factory
export function openGlInitRenderer(webGl: WebGL2RenderingContext, buffers: Buffers, vShaderCode:string, fShader: string): ShaderProgramInfo {
    const shaderProgram = initShaderProgram(webGl, vShaderCode, fShader);

    const programInfo: ShaderProgramInfo = {
      program: shaderProgram,
      attribLocations: {
        vertexPosition: webGl.getAttribLocation(shaderProgram, 'inputPosition'),
        inputNormal: webGl.getAttribLocation(shaderProgram, 'inputNormal'),
        texcoordLocation: webGl.getAttribLocation(shaderProgram, 'inputUV'),
      },
      uniformLocations: {
        projectionMatrix: webGl.getUniformLocation(shaderProgram, 'projection')!,
        modelViewMatrix: webGl.getUniformLocation(shaderProgram, 'modelview')!,
        normalMatrix: webGl.getUniformLocation(shaderProgram, 'normalMat')!,
        texture: webGl.createTexture()!
      },
    };
    {
      const normalize = false;

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

export function initShaderProgram(gl: WebGL2RenderingContext, vsSource: string, fsSource: string): WebGLProgram {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  const shaderProgram: WebGLProgram = gl.createProgram()!;
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    throw new Error("Could not initialize shader");
  }

  return shaderProgram;
}

function loadShader(gl: WebGL2RenderingContext, type: GLint, source: string): WebGLShader {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    throw new Error("Could not load shader");
  }

  return shader;
}

export interface ShaderProgramInfo {
  program: WebGLProgram;
  attribLocations: AttributeLocations;
  uniformLocations: UniformLocation;
}

export interface AttributeLocations {
  vertexPosition: GLint;
  inputNormal: GLint;
  texcoordLocation: GLint;
}

export interface UniformLocation {
  projectionMatrix: WebGLUniformLocation;
  modelViewMatrix: WebGLUniformLocation;
  normalMatrix: WebGLUniformLocation;
  texture: WebGLTexture;
}