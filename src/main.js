import { createTerrain } from './terrain.js';
import { createScenery } from './scenery.js';
import { createPinwheel, pinwheelTransforms } from './pinwheel.js';
import { createPrince } from './prince.js';
import { createFox } from './fox.js';
import { createCamera } from './camera.js';
import { faceNormals } from './normals.js';

const vertexSource = `
  attribute vec3 aPosition;
  attribute vec3 aColor;
  attribute vec3 aNormal;
  uniform mat4 uView;
  uniform mat4 uProjection;
  uniform mat4 uModel;
  varying vec3 vColor;
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    vec4 world = uModel * vec4(aPosition, 1.0);
    gl_Position = uProjection * uView * world;
    vColor = aColor;
    // Os modelos usam apenas translação e rotação.
    vNormal = (uModel * vec4(aNormal, 0.0)).xyz;
    vPosition = world.xyz;
  }
`;

const fragmentSource = `
  precision mediump float;
  varying vec3 vColor;
  varying vec3 vNormal;
  varying vec3 vPosition;
  uniform bool uLighting;
  uniform vec3 uLightDirection;
  uniform vec3 uEye;
  uniform float uSpecular;
  uniform float uShininess;

  void main() {
    vec3 color = vColor;
    if (uLighting) {
      vec3 normal = normalize(gl_FrontFacing ? vNormal : -vNormal);
      vec3 light = normalize(uLightDirection);
      float diffuse = max(dot(normal, light), 0.0);
      float specular = 0.0;
      if (diffuse > 0.0) {
        vec3 reflection = reflect(-light, normal);
        vec3 view = normalize(uEye - vPosition);
        specular = uSpecular * pow(max(dot(reflection, view), 0.0), uShininess);
      }
      color = vColor * (0.54 + 0.5 * diffuse) + vec3(specular);
    }
    gl_FragColor = vec4(color, 1.0);
  }
`;

const materials = {
  stone: { specular: 0.05, shininess: 12 },
  cloth: { specular: 0.02, shininess: 8 },
  wood: { specular: 0.08, shininess: 16 },
  paper: { specular: 0.18, shininess: 22 },
};

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
  const camera = createCamera(canvas, document.querySelector('#camera-mode'));
  const terrain = createTerrain(2.4);
  const scenery = createScenery();
  const fox = createFox();
  const pinwheel = createPinwheel();
  const princePoses = [0, 1, 2].map(createPrince);
  const princeStart = (terrain.positions.length + scenery.positions.length + fox.positions.length + pinwheel.positions.length) / 3;
  const poseStarts = [];
  let nextVertex = princeStart;
  for (const pose of princePoses) {
    poseStarts.push(nextVertex);
    nextVertex += pose.positions.length / 3;
  }
  let currentPose = 0;
  let lighting = true;
  const lightStatus = document.querySelector('#light-mode');
  window.addEventListener('keydown', event => {
    if (event.repeat || event.ctrlKey || event.altKey || event.metaKey) return;
    const key = event.key.toLowerCase();
    if (key === 'p') {
      currentPose = (currentPose + 1) % princePoses.length;
    }
    if (key === 'l') {
      lighting = !lighting;
      lightStatus.textContent = lighting ? 'L · Luz ligada' : 'L · Luz desligada';
    }
  });
  const sceneryCount = (terrain.positions.length + scenery.positions.length + fox.positions.length) / 3;
  const positions = new Float32Array([...terrain.positions, ...scenery.positions, ...fox.positions, ...pinwheel.positions, ...princePoses.flatMap(pose => pose.positions)]);
  const colors = new Float32Array([...terrain.colors, ...scenery.colors, ...fox.colors, ...pinwheel.colors, ...princePoses.flatMap(pose => pose.colors)]);
  gl.useProgram(program);
  bindAttribute(gl, program, 'aPosition', positions);
  bindAttribute(gl, program, 'aColor', colors);
  bindAttribute(gl, program, 'aNormal', faceNormals(positions));
  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0, 0, 0, 0);

  const view = gl.getUniformLocation(program, 'uView');
  const projection = gl.getUniformLocation(program, 'uProjection');
  const model = gl.getUniformLocation(program, 'uModel');
  const lightingEnabled = gl.getUniformLocation(program, 'uLighting');
  const lightDirection = gl.getUniformLocation(program, 'uLightDirection');
  const eye = gl.getUniformLocation(program, 'uEye');
  const specular = gl.getUniformLocation(program, 'uSpecular');
  const shininess = gl.getUniformLocation(program, 'uShininess');
  const identity = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);

  function drawMesh(start, count, transform, material) {
    gl.uniformMatrix4fv(model, false, transform);
    gl.uniform1f(specular, material.specular);
    gl.uniform1f(shininess, material.shininess);
    gl.drawArrays(gl.TRIANGLES, start, count);
  }

  let previousTime = null;
  function draw(time) {
    const elapsed = previousTime === null ? 0 : Math.min((time - previousTime) / 1000, 0.1);
    previousTime = time;
    if (camera.mode === 1) camera.azimuth += elapsed * 0.18;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.round(canvas.clientWidth * pixelRatio));
    const height = Math.max(1, Math.round(canvas.clientHeight * pixelRatio));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    const aspect = canvas.width / canvas.height;
    const distance = camera.distance / Math.min(aspect, 1);

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.uniformMatrix4fv(projection, false, perspective(Math.PI / 4, aspect, 0.1, distance + 30));
    const viewMatrix = viewFromOrbit(camera.azimuth, camera.elevation, distance, 0);
    gl.uniformMatrix4fv(view, false, viewMatrix);
    gl.uniform3f(eye, viewMatrix[2] * distance, viewMatrix[6] * distance, viewMatrix[10] * distance);
    gl.uniform1i(lightingEnabled, lighting);
    const sunAngle = time * 0.00015 + 0.8;
    gl.uniform3f(lightDirection, Math.sin(sunAngle), 1.3, Math.cos(sunAngle));
    drawMesh(0, sceneryCount, identity, materials.stone);
    drawMesh(poseStarts[currentPose], princePoses[currentPose].positions.length / 3, identity, materials.cloth);
    const transforms = pinwheelTransforms(time / 1000);
    drawMesh(sceneryCount, pinwheel.poleCount, transforms.pole, materials.wood);
    drawMesh(sceneryCount + pinwheel.poleCount, pinwheel.bladeCount, transforms.blades, materials.paper);
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
