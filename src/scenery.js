import { princeSeat } from './prince.js';

export function createScenery() {
  const positions = [];
  const colors = [];
  const vents = [];

  function triangle(a, b, c, color) {
    positions.push(...a, ...b, ...c);
    colors.push(...color, ...color, ...color);
  }

  // O perfil gira em torno de Y. Pontos no eixo fecham o sólido.
  function lathe(x, z, profile, color, segments = 10) {
    for (let ring = 0; ring < profile.length - 1; ring++) {
      const [radius, height] = profile[ring];
      const [nextRadius, nextHeight] = profile[ring + 1];
      for (let i = 0; i < segments; i++) {
        const angle = i * 2 * Math.PI / segments;
        const nextAngle = (i + 1) * 2 * Math.PI / segments;
        const a = [x + radius * Math.cos(angle), height, z + radius * Math.sin(angle)];
        const b = [x + radius * Math.cos(nextAngle), height, z + radius * Math.sin(nextAngle)];
        const c = [x + nextRadius * Math.cos(angle), nextHeight, z + nextRadius * Math.sin(angle)];
        const d = [x + nextRadius * Math.cos(nextAngle), nextHeight, z + nextRadius * Math.sin(nextAngle)];
        const shade = color.map(channel => channel * (0.85 + 0.15 * Math.cos(angle)));
        if (radius > 0) triangle(a, c, b, shade);
        if (nextRadius > 0) triangle(b, c, d, shade);
      }
    }
  }

  function volcano(x, z, size, active) {
    const profile = [[0, 0], [0.6, 0], [0.43, 0.3], [0.24, 0.7], [0.15, 0.69], [0.12, 0.48], [0, 0.48]];
    lathe(x, z, profile.map(([r, y]) => [r * size, y * size]), [0.48, 0.43, 0.46]);
    if (active) {
      lathe(x, z, [[0, 0.49 * size], [0.12 * size, 0.49 * size]], [1, 0.34, 0.12]);
      vents.push([x, 0.67 * size, z]);
    }
  }

  volcano(-1.15, -0.7, 1, true);
  volcano(-0.15, -1.45, 0.75, true);
  volcano(-1.55, 0.35, 0.65, false);
  const { x, z, height } = princeSeat;
  lathe(x, z, [[0, 0], [0.24, 0], [0.22, 0.13], [0.18, height], [0, height]], [0.64, 0.58, 0.67], 7);

  // Rosa à frente, deixando o centro livre para o príncipe.
  const roseX = 0.85;
  const roseZ = 0.8;
  lathe(roseX, roseZ, [[0, 0.01], [0.3, 0.01], [0.23, 0.07], [0, 0.07]], [0.48, 0.32, 0.25]);
  lathe(roseX, roseZ, [[0, 0.07], [0.025, 0.07], [0.018, 0.65], [0, 0.65]], [0.23, 0.48, 0.24], 6);
  triangle([roseX, 0.3, roseZ], [roseX - 0.24, 0.47, roseZ], [roseX - 0.07, 0.46, roseZ + 0.08], [0.32, 0.58, 0.28]);
  triangle([roseX, 0.43, roseZ], [roseX + 0.07, 0.57, roseZ + 0.07], [roseX + 0.21, 0.55, roseZ], [0.38, 0.64, 0.3]);
  for (let i = 0; i < 5; i++) {
    const angle = i * Math.PI * 2 / 5;
    lathe(roseX + 0.09 * Math.cos(angle), roseZ + 0.09 * Math.sin(angle),
      [[0, 0.59], [0.12, 0.69], [0.1, 0.79], [0, 0.75]], [0.85, 0.16 + i * 0.015, 0.26], 5);
  }
  lathe(roseX, roseZ, [[0, 0.67], [0.075, 0.77], [0.04, 0.82], [0, 0.8]], [1, 0.32, 0.36], 5);

  lathe(1.25, -0.9, [[0, 0], [0.17, 0], [0.12, 0.35], [0.055, 0.68], [0, 0.7]], [0.55, 0.37, 0.23], 7);
  const crowns = [[1.1, -0.9, 0.53], [1.4, -0.85, 0.57], [1.25, -1, 0.72]];
  for (const [x, z, y] of crowns) {
    lathe(x, z, [[0, y - 0.1], [0.24, y], [0.2, y + 0.17], [0, y + 0.28]], [0.38, 0.57, 0.29], 7);
  }

  return { positions: new Float32Array(positions), colors: new Float32Array(colors), vents };
}
