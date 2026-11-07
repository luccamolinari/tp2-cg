import { createTerrain } from './terrain.js';

const vertexSource = `
  attribute vec3 aPosition;
  attribute vec3 aColor;
  uniform mat4 uView;
  uniform mat4 uProjection;
  varying vec3 vColor;

  void main() {
    gl_Position = uProjection * uView * vec4(aPosition, 1.0);
    vColor = aColor;
  }
`;

const fragmentSource = `
  precision mediump float;
  varying vec3 vColor;

  void main() {
    gl_FragColor = vec4(vColor, 1.0);
  }
`;

function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader));
  }
  return shader;
}

function createProgram(gl) {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program));
  }
  return program;
}

function bindAttribute(gl, program, name, data) {
  const location = gl.getAttribLocation(program, name);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  gl.vertexAttribPointer(location, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(location);
}

function perspective(fov, aspect, near, far) {
  const scale = 1 / Math.tan(fov / 2);
  const depth = near - far;
  return new Float32Array([
    scale / aspect, 0, 0, 0,
    0, scale, 0, 0,
    0, 0, (far + near) / depth, -1,
    0, 0, 2 * far * near / depth, 0,
  ]);
}

function viewFromOrbit(azimuth, elevation, distance, targetY) {
  const sinA = Math.sin(azimuth);
  const cosA = Math.cos(azimuth);
  const sinE = Math.sin(elevation);
  const cosE = Math.cos(elevation);
  // Eixos da câmera em coordenadas do mundo, mirando em (0, targetY, 0).
  return new Float32Array([
    cosA, -sinA * sinE, sinA * cosE, 0,
    0, cosE, sinE, 0,
    -sinA, -cosA * sinE, cosA * cosE, 0,
    0, -targetY * cosE, -distance - targetY * sinE, 1,
  ]);
}

function start() {
  const canvas = document.querySelector('#scene');
  const gl = canvas.getContext('webgl', { antialias: true });
  if (!gl) {
    throw new Error('WebGL indisponível.');
  }

  const program = createProgram(gl);
  const terrain = createTerrain(2.4);
  gl.useProgram(program);
  bindAttribute(gl, program, 'aPosition', terrain.positions);
  bindAttribute(gl, program, 'aColor', terrain.colors);
  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0, 0, 0, 0);

  const view = gl.getUniformLocation(program, 'uView');
  const projection = gl.getUniformLocation(program, 'uProjection');

  function draw() {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(canvas.clientWidth * pixelRatio));
    canvas.height = Math.max(1, Math.round(canvas.clientHeight * pixelRatio));
    const aspect = canvas.width / canvas.height;
    const distance = 8.5 / Math.min(aspect, 1);

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.uniformMatrix4fv(projection, false, perspective(Math.PI / 4, aspect, 0.1, distance + 30));
    gl.uniformMatrix4fv(view, false, viewFromOrbit(Math.PI / 6, Math.PI / 4, distance, -0.55));
    gl.drawArrays(gl.TRIANGLES, 0, terrain.positions.length / 3);
  }

  window.addEventListener('resize', draw);
  draw();
}

try {
  start();
} catch (error) {
  console.error(error);
  const status = document.querySelector('#status');
  status.textContent = 'Não foi possível iniciar a cena em WebGL.';
  status.hidden = false;
}
