export function createSkySphere() {
  const positions = [];
  const rings = 16;
  const segments = 32;
  const radius = 24;

  function point(ring, segment) {
    const latitude = Math.PI * (ring / rings - 0.5);
    const longitude = 2 * Math.PI * segment / segments;
    return [
      radius * Math.cos(latitude) * Math.cos(longitude),
      radius * Math.sin(latitude),
      radius * Math.cos(latitude) * Math.sin(longitude),
    ];
  }

  for (let ring = 0; ring < rings; ring++) {
    for (let segment = 0; segment < segments; segment++) {
      const a = point(ring, segment);
      const b = point(ring, segment + 1);
      const c = point(ring + 1, segment);
      const d = point(ring + 1, segment + 1);
      if (ring > 0) positions.push(...a, ...b, ...c);
      if (ring < rings - 1) positions.push(...b, ...d, ...c);
    }
  }
  return positions;
}

export function loadSkyTexture(gl) {
  const texture = gl.createTexture();
  const sky = { texture, ready: false };
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const image = new Image();
  image.onload = () => {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    sky.ready = true;
  };
  image.src = new URL('../stars.svg', import.meta.url).href;
  return sky;
}
