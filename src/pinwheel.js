export function createPinwheel() {
  const positions = [];
  const colors = [];

  function triangle(a, b, c, color) {
    positions.push(...a, ...b, ...c);
    colors.push(...color, ...color, ...color);
  }

  for (let i = 0; i < 8; i++) {
    const angle = i * Math.PI / 4;
    const next = (i + 1) * Math.PI / 4;
    const a = [0.035 * Math.cos(angle), 0, 0.035 * Math.sin(angle)];
    const b = [0.035 * Math.cos(next), 0, 0.035 * Math.sin(next)];
    const c = [a[0], 1.05, a[2]];
    const d = [b[0], 1.05, b[2]];
    const wood = [0.55 + i * 0.015, 0.36, 0.22];
    triangle(a, c, b, wood);
    triangle(b, c, d, wood);
    triangle(c, [0, 1.05, 0], d, wood);
  }
  const poleCount = positions.length / 3;
  const palette = [[0.95, 0.69, 0.26], [0.82, 0.35, 0.3], [0.46, 0.68, 0.68], [0.88, 0.8, 0.53]];
  for (let i = 0; i < 4; i++) {
    const angle = i * Math.PI / 2;
    function rotate(x, y, z) {
      return [x * Math.cos(angle) - y * Math.sin(angle), x * Math.sin(angle) + y * Math.cos(angle), z];
    }
    const tip = rotate(0.12, 0.39, 0);
    const corner = rotate(-0.2, 0.32, 0);
    const fold = rotate(-0.06, 0.17, 0.09);
    triangle([0, 0, 0.04], tip, fold, palette[i]);
    triangle(tip, corner, fold, palette[i].map(value => value * 0.8));
  }

  return { positions, colors, poleCount, bladeCount: positions.length / 3 - poleCount };
}

export function pinwheelTransforms(seconds) {
  const x = 1.7;
  const z = 0.05;
  const cos = Math.cos(seconds * 1.2);
  const sin = Math.sin(seconds * 1.2);
  const pole = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, 0, z, 1]);
  // Matriz do pai × deslocamento até o eixo × rotação local das pás.
  const blades = new Float32Array([cos, sin, 0, 0, -sin, cos, 0, 0, 0, 0, 1, 0, x, 1.05, z + 0.06, 1]);
  return { pole, blades };
}
