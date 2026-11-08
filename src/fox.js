export function createFox() {
  const positions = [];
  const colors = [];
  const orange = [0.87, 0.38, 0.12];
  const cream = [0.98, 0.88, 0.68];
  const dark = [0.19, 0.13, 0.12];

  function triangle(a, b, c, color) {
    for (const [x, y, z] of [a, b, c]) {
      // A raposa fica à esquerda da rosa.
      positions.push(x - 0.9, y, z + 1.15);
      colors.push(...color);
    }
  }

  function ellipsoid(center, scale, color) {
    const [x, y, z] = center;
    const [rx, ry, rz] = scale;
    const top = [x, y + ry, z];
    const bottom = [x, y - ry, z];
    for (let i = 0; i < 8; i++) {
      const angle = i * Math.PI / 4;
      const next = (i + 1) * Math.PI / 4;
      const a = [x + rx * Math.cos(angle), y, z + rz * Math.sin(angle)];
      const b = [x + rx * Math.cos(next), y, z + rz * Math.sin(next)];
      triangle(top, b, a, color.map(channel => channel * (0.88 + 0.1 * Math.cos(angle))));
      triangle(bottom, a, b, color.map(channel => channel * 0.78));
    }
  }

  ellipsoid([0, 0.24, 0], [0.23, 0.23, 0.19], orange);
  ellipsoid([0, 0.4, 0.08], [0.16, 0.22, 0.13], orange);
  ellipsoid([0, 0.39, 0.17], [0.115, 0.17, 0.055], cream);
  for (const side of [-1, 1]) {
    ellipsoid([side * 0.09, 0.16, 0.18], [0.045, 0.14, 0.055], orange);
    ellipsoid([side * 0.09, 0.045, 0.21], [0.06, 0.045, 0.09], dark);
  }
  ellipsoid([0, 0.62, 0.13], [0.22, 0.17, 0.17], orange);
  ellipsoid([0, 0.565, 0.28], [0.14, 0.075, 0.16], cream);
  ellipsoid([0, 0.575, 0.415], [0.04, 0.035, 0.035], dark);

  for (const side of [-1, 1]) {
    const a = [side * 0.06, 0.7, 0.14];
    const b = [side * 0.2, 0.68, 0.1];
    const tip = [side * 0.17, 0.94, 0.07];
    const back = [side * 0.13, 0.7, 0];
    triangle(a, b, tip, orange);
    triangle(b, back, tip, orange);
    triangle(back, a, tip, orange);
    triangle([side * 0.1, 0.73, 0.145], [side * 0.17, 0.72, 0.125], [side * 0.16, 0.86, 0.095], dark);
    ellipsoid([side * 0.105, 0.635, 0.25], [0.022, 0.028, 0.015], dark);
  }

  ellipsoid([0.19, 0.16, -0.16], [0.22, 0.14, 0.16], orange);
  ellipsoid([0.34, 0.14, -0.02], [0.17, 0.13, 0.25], orange);
  ellipsoid([0.34, 0.13, 0.19], [0.13, 0.11, 0.19], cream);
  return { positions, colors };
}
