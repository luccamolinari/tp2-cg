// Arpejos em dó maior, lá menor, fá maior e sol maior.
const chords = [
  [48, 55, 60, 64, 67, 64, 60, 55],
  [45, 52, 57, 60, 64, 60, 57, 52],
  [41, 48, 57, 60, 65, 60, 57, 48],
  [43, 50, 55, 59, 62, 59, 55, 50],
];

function createLoop(context) {
  const rate = context.sampleRate;
  const step = 0.42;
  const notes = chords.flat();
  const buffer = context.createBuffer(1, Math.round(notes.length * step * rate), rate);
  const samples = buffer.getChannelData(0);

  notes.forEach((note, index) => {
    const start = Math.round(index * step * rate);
    const frequency = 440 * 2 ** ((note - 69) / 12);
    for (let sample = 0; sample < Math.floor(1.5 * rate); sample++) {
      const time = sample / rate;
      const phase = 2 * Math.PI * frequency * time;
      const envelope = Math.min(time / 0.025, 1) * Math.exp(-4 * time);
      const tone = Math.sin(phase) + 0.16 * Math.sin(2 * phase);
      // A cauda das últimas notas continua no começo do loop.
      samples[(start + sample) % samples.length] += 0.12 * envelope * tone;
    }
  });
  return buffer;
}

export function bindMusic(button) {
  const Audio = window.AudioContext || window.webkitAudioContext;
  if (!Audio) {
    button.hidden = true;
    return;
  }

  let context;
  let buffer;
  let source;
  button.addEventListener('click', async () => {
    if (source) {
      source.stop();
      source = null;
      button.setAttribute('aria-pressed', 'false');
      return;
    }

    button.disabled = true;
    try {
      context ??= new Audio();
      await context.resume();
      buffer ??= createLoop(context);
      const track = context.createBufferSource();
      track.buffer = buffer;
      track.loop = true;
      track.connect(context.destination);
      track.start();
      source = track;
      button.setAttribute('aria-pressed', 'true');
    } catch (error) {
      console.error('Não foi possível iniciar a música.', error);
    } finally {
      button.disabled = false;
    }
  });
}
