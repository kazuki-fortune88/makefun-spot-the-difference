// Scene painters for Harbor Lights.
//
// Every scene is drawn twice, side by side, from the same code: once
// plain (the left panel) and once with a set of differences applied
// (the right panel). A difference is therefore never a second drawing —
// it is one conditional branch inside the scene, so the two panels can
// only ever differ where the level says they differ. All art is drawn
// with the canvas 2D API; there are no image assets.
//
// Coordinates inside a painter are panel-relative: u runs 0..1 across
// the panel and v runs 0..1 down it. Helpers X(u) / Y(v) convert to
// pixels for a 560 x 460 panel.

import { PANEL_H, PANEL_W } from './levels.js';

function makeHelpers(ctx) {
  const X = (u) => u * PANEL_W;
  const Y = (v) => v * PANEL_H;
  function ellipse(cx, cy, rx, ry, fill) {
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  function circle(cx, cy, r, fill) {
    ellipse(cx, cy, r, r, fill);
  }
  function rect(x, y, w, h, fill) {
    ctx.fillStyle = fill;
    ctx.fillRect(x, y, w, h);
  }
  function poly(points, fill) {
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
    ctx.closePath();
    ctx.fill();
  }
  function line(x1, y1, x2, y2, color, width) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
  function star(cx, cy, r, fill) {
    ctx.fillStyle = fill;
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      const rr = i % 2 === 0 ? r : r * 0.45;
      const px = cx + Math.cos(a) * rr;
      const py = cy + Math.sin(a) * rr;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }
  function gull(cx, cy, scale, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx - 7 * scale, cy, 7 * scale, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + 7 * scale, cy, 7 * scale, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
  }
  function cat(cx, cy, scale, body, ear) {
    // A small sitting cat, drawn facing left.
    ctx.fillStyle = body;
    ellipse(cx, cy, 13 * scale, 9 * scale, body);
    circle(cx - 9 * scale, cy - 11 * scale, 8 * scale, body);
    poly(
      [
        [cx - 15 * scale, cy - 15 * scale],
        [cx - 12 * scale, cy - 22 * scale],
        [cx - 8 * scale, cy - 16 * scale],
      ],
      ear,
    );
    poly(
      [
        [cx - 6 * scale, cy - 17 * scale],
        [cx - 3 * scale, cy - 23 * scale],
        [cx - 1 * scale, cy - 16 * scale],
      ],
      ear,
    );
    ctx.fillStyle = '#1c2430';
    circle(cx - 11 * scale, cy - 12 * scale, 1.4, '#1c2430');
    ctx.beginPath();
    ctx.moveTo(cx + 11 * scale, cy + 2 * scale);
    ctx.quadraticCurveTo(cx + 20 * scale, cy - 2 * scale, cx + 18 * scale, cy - 12 * scale);
    ctx.strokeStyle = body;
    ctx.lineWidth = 3 * scale;
    ctx.stroke();
  }
  return { X, Y, ellipse, circle, rect, poly, line, star, gull, cat };
}

function clipPanel(ctx, ox, oy) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(ox, oy, PANEL_W, PANEL_H);
  ctx.clip();
  ctx.translate(ox, oy);
}

// ---------------------------------------------------------------------------
// Level 1 — Lighthouse Cove (dusk harbour)
// ---------------------------------------------------------------------------
function drawLighthouse(ctx, ox, oy, mods) {
  clipPanel(ctx, ox, oy);
  const h = makeHelpers(ctx);
  const { X, Y } = h;

  // Sky: dusk gradient, sea below the horizon.
  const sky = ctx.createLinearGradient(0, 0, 0, Y(0.62));
  sky.addColorStop(0, '#2b3a67');
  sky.addColorStop(0.7, '#e8907c');
  sky.addColorStop(1, '#f7c489');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, PANEL_W, Y(0.62));
  const sea = ctx.createLinearGradient(0, Y(0.62), 0, PANEL_H);
  sea.addColorStop(0, '#3d6f8e');
  sea.addColorStop(1, '#1e4258');
  ctx.fillStyle = sea;
  ctx.fillRect(0, Y(0.62), PANEL_W, PANEL_H - Y(0.62));

  // Stars, moon and clouds in the upper sky.
  h.star(X(0.12), Y(0.08), 4, '#ffeec2');
  h.star(X(0.55), Y(0.06), 3, '#ffeec2');
  h.star(X(0.68), Y(0.16), 3.5, '#ffeec2');
  h.star(X(0.92), Y(0.07), 4, '#ffeec2');
  h.circle(X(0.88), Y(0.22), 22, '#fbeec3');
  h.circle(X(0.80), Y(0.09), 8, '#dfe6f2');
  h.ellipse(X(0.14), Y(0.12), 46, 12, 'rgba(255,255,255,0.75)');
  h.ellipse(X(0.62), Y(0.10), 38, 10, 'rgba(255,255,255,0.6)');

  // The lighthouse, standing on a rocky point at the left.
  h.poly(
    [
      [X(0.20), Y(0.62)],
      [X(0.40), Y(0.62)],
      [X(0.36), Y(0.30)],
      [X(0.24), Y(0.30)],
    ],
    '#f3ede0',
  );
  h.rect(X(0.235), Y(0.44), X(0.13), Y(0.045), '#d95f4b');
  h.rect(X(0.255), Y(0.335), X(0.09), Y(0.045), '#d95f4b');
  h.rect(X(0.24), Y(0.27), X(0.12), Y(0.035), '#33415c');
  h.circle(X(0.30), Y(0.245), 13, '#ffd94d');
  h.poly(
    [
      [X(0.245), Y(0.245)],
      [X(0.355), Y(0.245)],
      [X(0.30), Y(0.185)],
    ],
    '#33415c',
  );
  h.rect(X(0.295), Y(0.51), X(0.01), Y(0.11), '#33415c');
  if (mods.has('flag')) {
    // Difference: the flag flies on the right panel only.
    h.line(X(0.30), Y(0.185), X(0.30), Y(0.10), '#33415c', 2);
    h.poly(
      [
        [X(0.30), Y(0.10)],
        [X(0.385), Y(0.125)],
        [X(0.30), Y(0.15)],
      ],
      '#d95f4b',
    );
  }
  if (mods.has('beam')) {
    // Difference: the beam is switched off on the right panel.
    const beam = ctx.createLinearGradient(X(0.30), Y(0.245), X(0.72), Y(0.10));
    beam.addColorStop(0, 'rgba(255,217,77,0.55)');
    beam.addColorStop(1, 'rgba(255,217,77,0)');
    ctx.fillStyle = beam;
    ctx.beginPath();
    ctx.moveTo(X(0.30), Y(0.225));
    ctx.lineTo(X(0.72), Y(0.06));
    ctx.lineTo(X(0.72), Y(0.30));
    ctx.lineTo(X(0.30), Y(0.265));
    ctx.closePath();
    ctx.fill();
  }

  // The cottage on the far shore, right side.
  h.rect(X(0.70), Y(0.50), X(0.16), Y(0.12), '#f7ead2');
  h.poly(
    [
      [X(0.685), Y(0.50)],
      [X(0.875), Y(0.50)],
      [X(0.78), Y(0.40)],
    ],
    '#b5543f',
  );
  h.rect(X(0.735), Y(0.535), X(0.035), Y(0.05), mods.has('window') ? '#2b3a67' : '#ffd94d');
  h.rect(X(0.80), Y(0.535), X(0.035), Y(0.05), '#ffd94d');
  h.rect(X(0.765), Y(0.565), X(0.03), Y(0.055), '#7a4a35');

  // Sea: two sailboats, waves and a buoy.
  h.poly(
    [
      [X(0.44), Y(0.66)],
      [X(0.56), Y(0.66)],
      [X(0.50), Y(0.66)],
    ],
    '#7a4a35',
  );
  h.poly(
    [
      [X(0.475), Y(0.655)],
      [X(0.475), Y(0.565)],
      [X(0.525), Y(0.655)],
    ],
    '#f3ede0',
  );
  h.line(X(0.475), Y(0.565), X(0.475), Y(0.655), '#33415c', 2);
  if (mods.has('boat2')) {
    // Difference: a second, smaller sailboat on the right panel.
    h.poly(
      [
        [X(0.74), Y(0.665)],
        [X(0.83), Y(0.665)],
        [X(0.785), Y(0.665)],
      ],
      '#5c3a2e',
    );
    h.poly(
      [
        [X(0.765), Y(0.66)],
        [X(0.765), Y(0.60)],
        [X(0.80), Y(0.66)],
      ],
      '#e8b4a0',
    );
    h.line(X(0.765), Y(0.60), X(0.765), Y(0.66), '#33415c', 2);
  }
  h.line(X(0.08), Y(0.70), X(0.30), Y(0.70), 'rgba(255,255,255,0.35)', 2);
  h.line(X(0.55), Y(0.74), X(0.80), Y(0.74), 'rgba(255,255,255,0.35)', 2);
  h.line(X(0.20), Y(0.84), X(0.45), Y(0.84), 'rgba(255,255,255,0.25)', 2);
  if (mods.has('buoy')) {
    // Difference: the buoy is gone on the right panel.
    h.circle(X(0.58), Y(0.80), 9, '#d95f4b');
    h.rect(X(0.575), Y(0.775), X(0.01), Y(0.02), '#f3ede0');
  }
  h.gull(X(0.55), Y(0.20), 1, '#2b3a67');
  h.gull(X(0.66), Y(0.26), 0.8, '#2b3a67');
  if (mods.has('gull')) {
    // Difference: one more gull on the right panel.
    h.gull(X(0.80), Y(0.13), 1, '#2b3a67');
  }

  // The wooden dock along the bottom, with a cat at its end.
  h.rect(0, Y(0.88), PANEL_W, PANEL_H - Y(0.88), '#8a5a3b');
  for (let i = 0; i < 8; i++) h.line(X(i * 0.13), Y(0.88), X(i * 0.13), PANEL_H, '#6e452c', 2);
  h.line(0, Y(0.88), PANEL_W, Y(0.88), '#6e452c', 3);
  h.circle(X(0.06), Y(0.94), 6, '#5c3a2e');
  h.circle(X(0.94), Y(0.94), 6, '#5c3a2e');
  if (mods.has('cat')) {
    // Difference: the dock cat is missing on the right panel.
    h.cat(X(0.38), Y(0.85), 1.1, '#3a3a3a', '#2c2c2c');
  }
  ctx.restore();
}

// ---------------------------------------------------------------------------
// Level 2 — Grandma's Garden (sunny day)
// ---------------------------------------------------------------------------
function drawGarden(ctx, ox, oy, mods) {
  clipPanel(ctx, ox, oy);
  const h = makeHelpers(ctx);
  const { X, Y } = h;

  const sky = ctx.createLinearGradient(0, 0, 0, Y(0.55));
  sky.addColorStop(0, '#7ec3ee');
  sky.addColorStop(1, '#cdeffd');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, PANEL_W, Y(0.55));
  h.circle(X(0.12), Y(0.14), 30, '#ffd94d');
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    h.line(
      X(0.12) + Math.cos(a) * 36,
      Y(0.14) + Math.sin(a) * 36,
      X(0.12) + Math.cos(a) * 48,
      Y(0.14) + Math.sin(a) * 48,
      '#ffd94d',
      4,
    );
  }
  h.ellipse(X(0.42), Y(0.10), 40, 11, 'rgba(255,255,255,0.9)');
  if (mods.has('cloud')) {
    // Difference: a second cloud on the right panel.
    h.ellipse(X(0.82), Y(0.12), 44, 12, 'rgba(255,255,255,0.9)');
    h.ellipse(X(0.86), Y(0.15), 30, 9, 'rgba(255,255,255,0.9)');
  }

  // Grass, flower beds and the garden path.
  ctx.fillStyle = '#69a84f';
  ctx.fillRect(0, Y(0.55), PANEL_W, PANEL_H - Y(0.55));
  h.ellipse(X(0.5), Y(0.62), 150, 26, '#5d9a46');
  h.poly(
    [
      [X(0.44), Y(1.0)],
      [X(0.56), Y(1.0)],
      [X(0.52), Y(0.55)],
      [X(0.48), Y(0.55)],
    ],
    '#e8d5a8',
  );

  // The cottage on the left with its windowsill cat.
  h.rect(X(0.06), Y(0.30), X(0.30), Y(0.25), '#f7ead2');
  h.poly(
    [
      [X(0.04), Y(0.30)],
      [X(0.38), Y(0.30)],
      [X(0.21), Y(0.16)],
    ],
    '#c96f4a',
  );
  h.rect(X(0.10), Y(0.38), X(0.06), Y(0.08), '#9fd8ef');
  h.rect(X(0.25), Y(0.38), X(0.06), Y(0.08), '#9fd8ef');
  h.rect(X(0.185), Y(0.46), X(0.05), Y(0.09), '#7a4a35');
  h.line(X(0.10), Y(0.46), X(0.31), Y(0.46), '#8a5a3b', 4);
  if (mods.has('cat')) {
    // Difference: the windowsill cat is missing on the right panel.
    h.cat(X(0.24), Y(0.435), 0.9, '#e8e0d0', '#d5c9b2');
  }

  // The big apple tree on the right.
  h.rect(X(0.665), Y(0.28), X(0.035), Y(0.27), '#7a4a35');
  h.circle(X(0.68), Y(0.24), 62, '#4e9a44');
  h.circle(X(0.60), Y(0.30), 42, '#57a84d');
  h.circle(X(0.77), Y(0.30), 42, '#57a84d');
  h.circle(X(0.63), Y(0.22), 8, '#d95f4b');
  h.circle(X(0.72), Y(0.28), 8, '#d95f4b');
  h.circle(X(0.68), Y(0.17), 8, '#d95f4b');
  if (mods.has('birdhouse')) {
    // Difference: a birdhouse hangs on the tree on the right panel.
    h.rect(X(0.685), Y(0.315), X(0.035), Y(0.05), '#8a5a3b');
    h.poly(
      [
        [X(0.68), Y(0.315)],
        [X(0.725), Y(0.315)],
        [X(0.7025), Y(0.29)],
      ],
      '#b5543f',
    );
    h.circle(X(0.7025), Y(0.34), 5, '#2b3a67');
  }

  // Flowers: tulips along the bottom and one tall sunflower.
  function tulip(cx, cy, color) {
    h.line(cx, cy, cx, cy + 26, '#3f7d33', 3);
    h.ellipse(cx, cy, 9, 12, color);
    h.poly(
      [
        [cx - 9, cy - 4],
        [cx - 4, cy - 14],
        [cx, cy - 5],
        [cx + 4, cy - 14],
        [cx + 9, cy - 4],
      ],
      color,
    );
  }
  tulip(X(0.10), Y(0.68), '#e86a6a');
  tulip(X(0.22), Y(0.74), '#f2a541');
  tulip(X(0.34), Y(0.68), '#e86a6a');
  tulip(X(0.46), Y(0.72), mods.has('tulip') ? '#f2d54d' : '#e86a6a');
  tulip(X(0.60), Y(0.68), '#f2a541');
  tulip(X(0.70), Y(0.74), '#e86a6a');
  tulip(X(0.92), Y(0.72), '#f2a541');
  if (mods.has('sunflower')) {
    // Difference: a tall sunflower on the right panel.
    h.line(X(0.86), Y(0.58), X(0.86), Y(0.86), '#3f7d33', 4);
    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI) / 6;
      h.ellipse(
        X(0.86) + Math.cos(a) * 20,
        Y(0.55) + Math.sin(a) * 20,
        9,
        5,
        '#f2d54d',
      );
    }
    h.circle(X(0.86), Y(0.55), 12, '#7a4a35');
  }
  if (mods.has('can')) {
    // Difference: a watering can by the fence on the right panel.
    h.rect(X(0.115), Y(0.765), X(0.05), Y(0.05), '#5b8dbf');
    h.poly(
      [
        [X(0.115), Y(0.765)],
        [X(0.09), Y(0.735)],
        [X(0.105), Y(0.73)],
        [X(0.125), Y(0.755)],
      ],
      '#5b8dbf',
    );
    h.line(X(0.165), Y(0.775), X(0.185), Y(0.755), '#5b8dbf', 4);
  }

  // The white picket fence along the back.
  ctx.fillStyle = '#f3ede0';
  for (let i = 0; i < 14; i++) {
    const fx = X(0.02 + i * 0.07);
    ctx.fillRect(fx, Y(0.50), 8, Y(0.06));
    ctx.beginPath();
    ctx.moveTo(fx, Y(0.50));
    ctx.lineTo(fx + 4, Y(0.485));
    ctx.lineTo(fx + 8, Y(0.50));
    ctx.closePath();
    ctx.fill();
  }
  h.rect(0, Y(0.515), PANEL_W, 4, '#f3ede0');

  // A butterfly over the flower bed.
  h.ellipse(X(0.52), Y(0.64), 10, 6, '#f2a541');
  h.ellipse(X(0.545), Y(0.635), 7, 5, '#f2a541');
  if (mods.has('butterfly')) {
    // Difference: an orange butterfly on the right panel.
    h.ellipse(X(0.62), Y(0.26), 11, 7, '#e8862e');
    h.ellipse(X(0.62), Y(0.295), 8, 5, '#e8862e');
    h.circle(X(0.62), Y(0.28), 3, '#33415c');
  }
  ctx.restore();
}

// ---------------------------------------------------------------------------
// Level 3 — Lantern Market (night street market)
// ---------------------------------------------------------------------------
function drawMarket(ctx, ox, oy, mods) {
  clipPanel(ctx, ox, oy);
  const h = makeHelpers(ctx);
  const { X, Y } = h;

  // Night sky, stars, moon and the street below.
  const sky = ctx.createLinearGradient(0, 0, 0, Y(0.55));
  sky.addColorStop(0, '#141b33');
  sky.addColorStop(1, '#3a2b52');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, PANEL_W, Y(0.55));
  h.star(X(0.10), Y(0.10), 3, '#ffeec2');
  h.star(X(0.30), Y(0.07), 3.5, '#ffeec2');
  h.star(X(0.68), Y(0.08), 3, '#ffeec2');
  h.star(X(0.40), Y(0.20), 2.5, '#ffeec2');
  h.star(X(0.95), Y(0.22), 3, '#ffeec2');
  if (mods.has('star')) {
    // Difference: a shooting star on the right panel.
    h.line(X(0.50), Y(0.06), X(0.60), Y(0.14), '#ffeec2', 2.5);
    h.circle(X(0.60), Y(0.14), 4, '#ffeec2');
  }
  if (mods.has('moon')) {
    // Difference: the crescent moon is missing on the right panel.
    h.circle(X(0.86), Y(0.12), 20, '#fbeec3');
    h.circle(X(0.875), Y(0.115), 17, '#141b33');
  }
  ctx.fillStyle = '#4a3a4d';
  ctx.fillRect(0, Y(0.55), PANEL_W, PANEL_H - Y(0.55));
  h.rect(0, Y(0.55), PANEL_W, 6, '#5d4a5e');
  // Cobbles.
  ctx.fillStyle = 'rgba(255,255,255,0.07)';
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 9; c++) {
      ctx.beginPath();
      ctx.ellipse(X(0.06 + c * 0.11), Y(0.66 + r * 0.09), 18, 8, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // The tea stall on the left and the fruit stall on the right.
  h.rect(X(0.05), Y(0.42), X(0.34), Y(0.13), '#7a4a35');
  h.poly(
    [
      [X(0.03), Y(0.42)],
      [X(0.41), Y(0.42)],
      [X(0.37), Y(0.34)],
      [X(0.07), Y(0.34)],
    ],
    '#b5543f',
  );
  h.rect(X(0.08), Y(0.46), X(0.08), Y(0.05), '#f2d54d');
  h.rect(X(0.20), Y(0.46), X(0.08), Y(0.05), '#e8b4a0');
  h.rect(X(0.30), Y(0.46), X(0.06), Y(0.05), '#9fd8ef');
  h.circle(X(0.12), Y(0.485), 7, '#f2d54d');
  h.circle(X(0.24), Y(0.485), 7, '#e8b4a0');
  h.circle(X(0.33), Y(0.485), 7, '#9fd8ef');
  // Tea sign above the stall.
  h.rect(X(0.13), Y(0.26), X(0.18), Y(0.06), '#f3ede0');
  ctx.fillStyle = '#33415c';
  ctx.font = 'bold 20px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('TEA', X(0.22), Y(0.29));
  if (mods.has('cat')) {
    // Difference: a cat naps on the tea stall roof on the right panel.
    h.cat(X(0.30), Y(0.325), 0.95, '#e8e0d0', '#d5c9b2');
  }

  h.rect(X(0.60), Y(0.42), X(0.34), Y(0.13), '#7a4a35');
  h.poly(
    [
      [X(0.58), Y(0.42)],
      [X(0.96), Y(0.42)],
      [X(0.92), Y(0.34)],
      [X(0.62), Y(0.34)],
    ],
    '#3f7d5c',
  );
  h.circle(X(0.66), Y(0.485), 8, '#d95f4b');
  h.circle(X(0.72), Y(0.485), 8, '#e8b4a0');
  h.circle(X(0.78), Y(0.485), 8, '#f2d54d');
  h.circle(X(0.84), Y(0.485), 8, '#d95f4b');
  h.circle(X(0.90), Y(0.485), 8, '#e8b4a0');
  if (mods.has('basket')) {
    // Difference: a basket of apples on the ground on the right panel.
    h.ellipse(X(0.16), Y(0.74), 26, 14, '#8a5a3b');
    h.circle(X(0.14), Y(0.72), 7, '#d95f4b');
    h.circle(X(0.18), Y(0.715), 7, '#d95f4b');
    h.circle(X(0.16), Y(0.70), 7, '#e86a6a');
  }

  // The red banner strung between the stalls.
  h.line(X(0.41), Y(0.16), X(0.59), Y(0.16), '#f3ede0', 2);
  h.rect(X(0.43), Y(0.16), X(0.14), Y(0.09), mods.has('banner') ? '#3f7d5c' : '#d95f4b');
  ctx.fillStyle = '#f3ede0';
  ctx.font = 'bold 16px Georgia, serif';
  ctx.fillText('★', X(0.50), Y(0.205));

  // Paper lanterns hanging from the line, and the string lights.
  function lantern(cx, cy, lit) {
    h.ellipse(cx, cy, 14, 18, lit ? '#ff9d5c' : '#8a6a72');
    h.line(cx, cy - 18, cx, cy - 30, '#f3ede0', 2);
    h.rect(cx - 6, cy - 22, 12, 4, '#d95f4b');
    if (lit) {
      ctx.fillStyle = 'rgba(255,157,92,0.25)';
      ctx.beginPath();
      ctx.arc(cx, cy, 30, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  lantern(X(0.72), Y(0.32), !mods.has('lantern'));
  lantern(X(0.56), Y(0.30), true);
  lantern(X(0.88), Y(0.30), true);
  h.line(X(0.05), Y(0.24), X(0.95), Y(0.24), '#f3ede0', 1.5);
  for (let i = 0; i < 8; i++) {
    const bx = X(0.10 + i * 0.11);
    const lit = !(mods.has('lights') && i === 3);
    h.circle(bx, Y(0.255), 5, lit ? '#ffd94d' : '#5d4a5e');
    if (lit) {
      ctx.fillStyle = 'rgba(255,217,77,0.20)';
      ctx.beginPath();
      ctx.arc(bx, Y(0.255), 12, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

// ---------------------------------------------------------------------------
// Public entry points
// ---------------------------------------------------------------------------
export const SCENES = {
  lighthouse: drawLighthouse,
  garden: drawGarden,
  market: drawMarket,
};

export function drawScene(ctx, sceneId, ox, oy, mods) {
  const painter = SCENES[sceneId];
  if (!painter) throw new Error(`unknown scene ${sceneId}`);
  painter(ctx, ox, oy, mods);
}
