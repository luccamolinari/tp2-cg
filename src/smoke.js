export function createSmoke(vents) {
  const perVent = 14;
  const particles = new Float32Array(vents.length * perVent * 4);

  function update(seconds) {
    let index = 0;
    for (const [x, y, z] of vents) {
      for (let i = 0; i < perVent; i++) {
        const age = (seconds / 3.8 + i / perVent) % 1;
        const sway = Math.sin(i * 2.4 + age * 3);
        particles[index++] = x + age * (0.35 + sway * 0.16);
        particles[index++] = y + age * (1.05 + (i % 3) * 0.12);
        particles[index++] = z + age * Math.cos(i * 2.4) * 0.28;
        particles[index++] = age;
      }
    }
    return particles;
  }

  return { particles, update };
}
