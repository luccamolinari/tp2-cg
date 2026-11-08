export function createPrince(pose) {
  const positions = [];
  const colors = [];
  const green = [0.27, 0.53, 0.36];
  const gold = [0.98, 0.76, 0.28];
  const skin = [0.95, 0.77, 0.59];
  const boots = [0.35, 0.23, 0.19];
  const sitting = pose === 1;
  const hip = sitting ? 0.23 : 0.43;

  function point(x, y, z) {
    if (pose === 2) return [x - 0.45, z + 0.22, -y + 0.65];
    const angle = sitting ? -0.6 : 0.55;
    return [x * Math.cos(angle) + z * Math.sin(angle) - 0.25,
      y, -x * Math.sin(angle) + z * Math.cos(angle) + 0.45];
  }

  function box(x, y, z, width, height, depth, color) {
    const vertices = [
      [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
      [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1],
    ].map(([a, b, c]) => point(x + a * width / 2, y + b * height / 2, z + c * depth / 2));
    const faces = [[0, 3, 2, 1], [4, 5, 6, 7], [0, 4, 7, 3], [1, 2, 6, 5], [3, 7, 6, 2], [0, 1, 5, 4]];
    for (let face = 0; face < faces.length; face++) {
      const [a, b, c, d] = faces[face];
      for (const index of [a, b, c, a, c, d]) {
        positions.push(...vertices[index]);
        colors.push(...color.map(channel => channel * (0.8 + face * 0.035)));
      }
    }
  }

  for (const side of [-1, 1]) {
    const x = side * 0.085;
    if (sitting) {
      box(x, 0.24, 0.12, 0.12, 0.12, 0.32, green);
      box(x, 0.13, 0.25, 0.1, 0.2, 0.1, green);
      box(x, 0.045, 0.3, 0.12, 0.09, 0.2, boots);
    } else {
      box(x, 0.25, 0, 0.12, 0.36, 0.13, green);
      box(x, 0.06, 0.04, 0.13, 0.12, 0.22, boots);
    }
    box(side * 0.21, hip + 0.15, 0.03, 0.1, 0.26, 0.12, green);
    box(side * 0.21, hip, 0.04, 0.085, 0.09, 0.09, skin);
  }

  box(0, hip + 0.16, 0, 0.31, 0.34, 0.2, green);
  box(0, hip + 0.04, 0, 0.32, 0.035, 0.21, boots);
  box(0, hip + 0.38, 0, 0.09, 0.1, 0.09, skin);
  box(0, hip + 0.55, 0, 0.29, 0.29, 0.25, skin);
  box(0, hip + 0.7, -0.015, 0.32, 0.12, 0.29, gold);
  box(-0.13, hip + 0.62, -0.025, 0.08, 0.17, 0.26, gold);
  box(0.13, hip + 0.64, -0.025, 0.08, 0.14, 0.26, gold);
  box(-0.065, hip + 0.75, -0.02, 0.1, 0.1, 0.19, gold);
  box(0.08, hip + 0.72, 0.05, 0.09, 0.11, 0.2, gold);
  for (const x of [-0.065, 0.065]) {
    box(x, hip + 0.55, 0.128, 0.025, 0.035, 0.012, [0.15, 0.19, 0.2]);
  }
  box(0, hip + 0.35, 0, 0.24, 0.065, 0.24, gold);
  box(0.2, hip + 0.34, -0.1, 0.32, 0.065, 0.08, gold);
  box(0.38, hip + 0.3, -0.1, 0.12, 0.13, 0.08, gold);
  for (const offset of [0.14, 0.24]) {
    box(0, hip + offset, 0.104, 0.025, 0.025, 0.012, gold);
  }

  return { positions, colors };
}
