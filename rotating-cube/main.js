const vertexShaderSource = `
precision mediump float;

attribute vec3 vertPosition;
attribute vec3 vertColor;
varying vec3 fragColor;

uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;

void main() {
  fragColor = vertColor;
  gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);
}
`;

const fragmentShaderSource = `
precision mediump float;

varying vec3 fragColor;

void main() {
  gl_FragColor = vec4(fragColor, 1.0);
}
`;



(() => {

  const canvas = document.getElementById('canvas');
  const gl = canvas.getContext('webgl');

  if (!gl) {
    console.log('WebGL not supported. Using experimental-webgl');
    gl = canvas.getContext('experimental-webgl');
  }

  if (!gl) {
    alert('Your browser does not support WebGL');
  }

  gl.clearColor(0.75, 0.85, 0.8, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.frontFace(gl.CCW);
  gl.cullFace(gl.BACK);

  const program = initProgram(gl)

  const boxVertices =
    [ // X, Y, Z           R, G, B
      // Top
      -1.0, 1.0, -1.0, 0.5, 0.5, 0.5,
      -1.0, 1.0, 1.0, 0.5, 0.5, 0.5,
      1.0, 1.0, 1.0, 0.5, 0.5, 0.5,
      1.0, 1.0, -1.0, 0.5, 0.5, 0.5,

      // Left
      -1.0, 1.0, 1.0, 0.75, 0.25, 0.5,
      -1.0, -1.0, 1.0, 0.75, 0.25, 0.5,
      -1.0, -1.0, -1.0, 0.75, 0.25, 0.5,
      -1.0, 1.0, -1.0, 0.75, 0.25, 0.5,

      // Right
      1.0, 1.0, 1.0, 0.25, 0.25, 0.75,
      1.0, -1.0, 1.0, 0.25, 0.25, 0.75,
      1.0, -1.0, -1.0, 0.25, 0.25, 0.75,
      1.0, 1.0, -1.0, 0.25, 0.25, 0.75,

      // Front
      1.0, 1.0, 1.0, 1.0, 0.0, 0.15,
      1.0, -1.0, 1.0, 1.0, 0.0, 0.15,
      -1.0, -1.0, 1.0, 1.0, 0.0, 0.15,
      -1.0, 1.0, 1.0, 1.0, 0.0, 0.15,

      // Back
      1.0, 1.0, -1.0, 0.0, 1.0, 0.15,
      1.0, -1.0, -1.0, 0.0, 1.0, 0.15,
      -1.0, -1.0, -1.0, 0.0, 1.0, 0.15,
      -1.0, 1.0, -1.0, 0.0, 1.0, 0.15,

      // Bottom
      -1.0, -1.0, -1.0, 0.5, 0.5, 1.0,
      -1.0, -1.0, 1.0, 0.5, 0.5, 1.0,
      1.0, -1.0, 1.0, 0.5, 0.5, 1.0,
      1.0, -1.0, -1.0, 0.5, 0.5, 1.0,
    ];

  const boxIndices =
    [
      // Top
      0, 1, 2,
      0, 2, 3,

      // Left
      5, 4, 6,
      6, 4, 7,

      // Right
      8, 9, 10,
      8, 10, 11,

      // Front
      13, 12, 14,
      15, 14, 12,

      // Back
      16, 17, 18,
      16, 18, 19,

      // Bottom
      21, 20, 22,
      22, 20, 23
    ];

  const boxVertexBufferObject = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexBufferObject);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW);

  const boxIndexBufferObject = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndexBufferObject);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxIndices), gl.STATIC_DRAW);

  const positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
  const colorAttribLocation = gl.getAttribLocation(program, 'vertColor');

  // Position
  gl.vertexAttribPointer(
    positionAttribLocation, // Attribute location
    3, // Number of elements per attribute
    gl.FLOAT, // Type of elements
    gl.FALSE,
    6 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
    0 // Offset from the beginning of a single vertex to this attribute
  );

  // Color
  gl.vertexAttribPointer(
    colorAttribLocation, // Attribute location
    3, // Number of elements per attribute
    gl.FLOAT, // Type of elements
    gl.FALSE,
    6 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
    3 * Float32Array.BYTES_PER_ELEMENT // Offset from the beginning of a single vertex to this attribute
  );

  gl.enableVertexAttribArray(positionAttribLocation);
  gl.enableVertexAttribArray(colorAttribLocation);

  gl.useProgram(program);

  const matWorldUniformLocation = gl.getUniformLocation(program, "mWorld");
  const matViewUniformLocation = gl.getUniformLocation(program, "mView");
  const matProjUniformLocation = gl.getUniformLocation(program, "mProj");

  const projMatrix = new Float32Array(16);
  const viewMatrix = new Float32Array(16);
  const worldMatrix = new Float32Array(16);

  mat4.identity(worldMatrix);
  mat4.lookAt(viewMatrix, [0, 0, -8], [0, 0, 0], [0, 1, 0]);
  mat4.perspective(projMatrix, glMatrix.toRadian(45), canvas.width / canvas.height, 0.1, 1000.0);

  gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
  gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
  gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);

  const xRotationMatrix = new Float32Array(16);
  const yRotationMatrix = new Float32Array(16);

  const identityMatrix = new Float32Array(16);
  mat4.identity(identityMatrix);
  let angle = 0;
  function tick() {

    angle = performance.now() / 1000 / 6 * 2 * Math.PI;
    mat4.rotate(yRotationMatrix, identityMatrix, angle, [0, 1, 0]);
    mat4.rotate(xRotationMatrix, identityMatrix, angle / 4, [1, 0, 0]);

    mat4.mul(worldMatrix, yRotationMatrix, xRotationMatrix);

    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);

    gl.clearColor(0.75, 0.85, 0.8, 1.0);
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

    gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

})()

function initProgram(gl) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('ERROR linking program!', gl.getProgramInfoLog(program));
    return;
  }

  gl.validateProgram(program);
  if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
    console.error('ERROR validating program!', gl.getProgramInfoLog(program));
    return;
  }

  return program
}

function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  gl.shaderSource(shader, source);

  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('ERROR compiling shader!', gl.getShaderInfoLog(shader));
    return;
  }

  return shader;
}