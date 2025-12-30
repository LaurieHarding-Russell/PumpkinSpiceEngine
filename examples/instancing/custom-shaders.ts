export const vectorInstancing = 
`attribute vec4 a_position;
attribute vec4 color;
attribute mat4 matrix;

varying vec4 v_color;

void main() {
  // Multiply the position by the matrix.
  gl_Position = matrix * a_position;

  // Pass the vertex color to the fragment shader.
  v_color = color;
}
`;

export const fragmentInstancing = 
`precision mediump float;

// Passed in from the vertex shader.
varying vec4 v_color;

void main() {
  gl_FragColor = v_color;
}
`;