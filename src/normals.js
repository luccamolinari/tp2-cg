export function faceNormals(positions) {
  const normals = new Float32Array(positions.length);
  for (let i = 0; i < positions.length; i += 9) {
    const ax = positions[i + 3] - positions[i];
    const ay = positions[i + 4] - positions[i + 1];
    const az = positions[i + 5] - positions[i + 2];
    const bx = positions[i + 6] - positions[i];
    const by = positions[i + 7] - positions[i + 1];
    const bz = positions[i + 8] - positions[i + 2];
    const x = ay * bz - az * by;
    const y = az * bx - ax * bz;
    const z = ax * by - ay * bx;
    const length = Math.hypot(x, y, z);
    // Cada triângulo usa a mesma normal nos três vértices.
    for (let vertex = i; vertex < i + 9; vertex += 3) {
      normals[vertex] = length ? x / length : 0;
      normals[vertex + 1] = length ? y / length : 1;
      normals[vertex + 2] = length ? z / length : 0;
    }
  }
  return normals;
}
