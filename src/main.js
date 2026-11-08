import { createTerrain } from './terrain.js';
import { createScenery } from './scenery.js';
import { createPinwheel, pinwheelTransforms } from './pinwheel.js';
import { createPrince } from './prince.js';

const vertexSource = `
  attribute vec3 aPosition;
  attribute vec3 aColor;
  uniform mat4 uView;
  uniform mat4 uProjection;
  uniform mat4 uModel;
  varying vec3 vColor;

  void main() {
    gl_Position = uProjection * uView * uModel * vec4(aPosition, 1.0);
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
  const scenery = createScenery();
  const pinwheel = createPinwheel();
  const princePoses = [0, 1, 2].map(createPrince);
  const princeStart = (terrain.positions.length + scenery.positions.length + pinwheel.positions.length) / 3;
  const poseStarts = [];
  let nextVertex = princeStart;
  for (const pose of princePoses) {
    poseStarts.push(nextVertex);
    nextVertex += pose.positions.length / 3;
  }
  let currentPose = 0;
  window.addEventListener('keydown', event => {
    if (event.key.toLowerCase() === 'p' && !event.repeat) {
      currentPose = (currentPose + 1) % princePoses.length;
    }
  });
  const sceneryCount = (terrain.positions.length + scenery.positions.length) / 3;
  const positions = new Float32Array([...terrain.positions, ...scenery.positions, ...pinwheel.positions, ...princePoses.flatMap(pose => pose.positions)]);
  const colors = new Float32Array([...terrain.colors, ...scenery.colors, ...pinwheel.colors, ...princePoses.flatMap(pose => pose.colors)]);
  gl.useProgram(program);
  bindAttribute(gl, program, 'aPosition', positions);
  bindAttribute(gl, program, 'aColor', colors);
  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0, 0, 0, 0);

  const view = gl.getUniformLocation(program, 'uView');
  const projection = gl.getUniformLocation(program, 'uProjection');
  const model = gl.getUniformLocation(program, 'uModel');
  const identity = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);

  function draw(time) {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.round(canvas.clientWidth * pixelRatio));
    const height = Math.max(1, Math.round(canvas.clientHeight * pixelRatio));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    const aspect = canvas.width / canvas.height;
    const distance = 8.5 / Math.min(aspect, 1);

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.uniformMatrix4fv(projection, false, perspective(Math.PI / 4, aspect, 0.1, distance + 30));
    gl.uniformMatrix4fv(view, false, viewFromOrbit(Math.PI / 6, Math.PI / 4, distance, -0.55));
    gl.uniformMatrix4fv(model, false, identity);
    gl.drawArrays(gl.TRIANGLES, 0, sceneryCount);
    gl.drawArrays(gl.TRIANGLES, poseStarts[currentPose], princePoses[currentPose].positions.length / 3);
    const transforms = pinwheelTransforms(time / 1000);
    gl.uniformMatrix4fv(model, false, transforms.pole);
    gl.drawArrays(gl.TRIANGLES, sceneryCount, pinwheel.poleCount);
    gl.uniformMatrix4fv(model, false, transforms.blades);
    gl.drawArrays(gl.TRIANGLES, sceneryCount + pinwheel.poleCount, pinwheel.bladeCount);
    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);
}

try {
  start();
} catch (error) {
  console.error(error);
  const status = document.querySelector('#status');
  status.textContent = 'Não foi possível iniciar a cena em WebGL.';
  status.hidden = false;
}
