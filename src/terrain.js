export function createTerrain(radius) {
  const positions = [];
  const colors = [];
  const segments = 24;
  const bands = 5;
  const grass = [[0.47, 0.60, 0.40], [0.49, 0.62, 0.42], [0.46, 0.59, 0.39]];
  const rock = [[0.46, 0.38, 0.45], [0.49, 0.41, 0.48], [0.42, 0.35, 0.43]];

  function triangle(a, b, c, color, brightness = 1) {
    positions.push(...a, ...b, ...c);
    const [r, g, bChannel] = color.map(channel => channel * brightness);
    colors.push(r, g, bChannel, r, g, bChannel, r, g, bChannel);
  }

  function ringPoint(band, segment) {
    const tilt = band / bands * Math.PI / 2;
    const angle = (segment + (band % 2) * 0.5) / segments * Math.PI * 2;
    const ringRadius = radius * Math.cos(tilt);
    return [ringRadius * Math.cos(angle), -radius * Math.sin(tilt), ringRadius * Math.sin(angle)];
  }

  for (let segment = 0; segment < segments; segment++) {
    triangle([0, 0, 0], ringPoint(0, segment + 1), ringPoint(0, segment), grass[segment % grass.length]);
  }

  for (let band = 0; band < bands; band++) {
    for (let segment = 0; segment < segments; segment++) {
      const a = ringPoint(band, segment);
      const b = ringPoint(band, segment + 1);
      const brightness = 1 - band * 0.09;
      const colorIndex = (segment + 2 * band) % rock.length;
      if (band === bands - 1) {
        triangle(a, b, [0, -radius, 0], rock[colorIndex], brightness);
        continue;
      }

      const c = ringPoint(band + 1, segment);
      const d = ringPoint(band + 1, segment + 1);
      if (band % 2 === 0) {
        triangle(a, b, c, rock[colorIndex], brightness);
        triangle(b, d, c, rock[(colorIndex + 1) % rock.length], brightness);
      } else {
        triangle(a, b, d, rock[colorIndex], brightness);
        triangle(a, d, c, rock[(colorIndex + 1) % rock.length], brightness);
      }
    }
  }

  return { positions: new Float32Array(positions), colors: new Float32Array(colors) };
}
