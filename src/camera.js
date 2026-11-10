export function createCamera(canvas, label) {
  const camera = { mode: 1, azimuth: Math.PI / 6, elevation: Math.PI / 4, distance: 8.5 };
  let pointer = null;
  let previousX = 0;
  let previousY = 0;

  window.addEventListener('keydown', event => {
    if (event.ctrlKey || event.altKey || event.metaKey) return;
    if (event.key !== '1' && event.key !== '2') return;
    camera.mode = Number(event.key);
    if (camera.mode === 1) camera.elevation = Math.PI / 4;
    label.textContent = camera.mode === 1 ? 'Câmera automática' : 'Câmera orbital — arraste para girar';
    canvas.style.cursor = camera.mode === 2 ? 'grab' : 'default';
  });

  canvas.addEventListener('pointerdown', event => {
    if (camera.mode !== 2 || event.button !== 0 || pointer !== null) return;
    pointer = event.pointerId;
    previousX = event.clientX;
    previousY = event.clientY;
    canvas.setPointerCapture(pointer);
    canvas.style.cursor = 'grabbing';
  });

  canvas.addEventListener('pointermove', event => {
    if (event.pointerId !== pointer || camera.mode !== 2) return;
    camera.azimuth -= (event.clientX - previousX) * 0.006;
    camera.elevation += (event.clientY - previousY) * 0.006;
    camera.elevation = Math.max(-1.35, Math.min(1.35, camera.elevation));
    previousX = event.clientX;
    previousY = event.clientY;
  });

  function endDrag(event) {
    if (event.pointerId !== pointer) return;
    if (canvas.hasPointerCapture(pointer)) canvas.releasePointerCapture(pointer);
    pointer = null;
    canvas.style.cursor = camera.mode === 2 ? 'grab' : 'default';
  }
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);
  canvas.addEventListener('lostpointercapture', endDrag);

  canvas.addEventListener('wheel', event => {
    event.preventDefault();
    let delta = event.deltaY;
    if (event.deltaMode === 1) delta *= 16;
    if (event.deltaMode === 2) delta *= canvas.clientHeight;
    camera.distance *= Math.exp(delta * 0.001);
    camera.distance = Math.max(4, Math.min(18, camera.distance));
  }, { passive: false });

  return camera;
}
