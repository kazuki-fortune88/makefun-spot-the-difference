// Level definitions for Harbor Lights: Spot the Difference.
//
// Each level names one hand-drawn scene and its seven differences. A
// difference is a point inside a panel, given in panel-relative units
// (u across, v down, both 0..1) with a click radius r in the same units.
// The left panel always shows the base scene; the right panel shows the
// same scene with every difference applied. Finding one only circles it.

export const PANEL_W = 560;
export const PANEL_H = 460;

export const LEVELS = [
  {
    id: 'lighthouse',
    name: 'Lighthouse Cove',
    subtitle: 'Dusk at the little harbour — the lamp is lit and the boats are in.',
    timeLimit: 150,
    scene: 'lighthouse',
    differences: [
      { id: 'beam', label: 'the lighthouse beam', u: 0.30, v: 0.17, r: 0.07 },
      { id: 'flag', label: 'the flag on the lighthouse', u: 0.30, v: 0.05, r: 0.04 },
      { id: 'gull', label: 'a gull in the sky', u: 0.80, v: 0.13, r: 0.045 },
      { id: 'boat2', label: 'the little sailboat', u: 0.78, v: 0.60, r: 0.065 },
      { id: 'buoy', label: 'the red buoy', u: 0.58, v: 0.80, r: 0.045 },
      { id: 'cat', label: 'the cat on the dock', u: 0.38, v: 0.82, r: 0.05 },
      { id: 'window', label: 'the cottage window light', u: 0.13, v: 0.70, r: 0.045 },
    ],
  },
  {
    id: 'garden',
    name: "Grandma's Garden",
    subtitle: 'A sunny afternoon behind the cottage — bees, tulips and one sleepy cat.',
    timeLimit: 150,
    scene: 'garden',
    differences: [
      { id: 'cloud', label: 'the puffy cloud', u: 0.82, v: 0.12, r: 0.055 },
      { id: 'butterfly', label: 'the orange butterfly', u: 0.62, v: 0.28, r: 0.045 },
      { id: 'birdhouse', label: 'the birdhouse on the tree', u: 0.70, v: 0.34, r: 0.05 },
      { id: 'cat', label: 'the cat on the windowsill', u: 0.24, v: 0.47, r: 0.05 },
      { id: 'sunflower', label: 'the tall sunflower', u: 0.86, v: 0.58, r: 0.055 },
      { id: 'tulip', label: 'the red tulip', u: 0.46, v: 0.72, r: 0.045 },
      { id: 'can', label: 'the watering can', u: 0.14, v: 0.80, r: 0.05 },
    ],
  },
  {
    id: 'market',
    name: 'Lantern Market',
    subtitle: 'Night at the street market — lanterns, tea and a cat on the roof.',
    timeLimit: 180,
    scene: 'market',
    differences: [
      { id: 'star', label: 'the shooting star', u: 0.55, v: 0.10, r: 0.05 },
      { id: 'moon', label: 'the crescent moon', u: 0.86, v: 0.12, r: 0.055 },
      { id: 'banner', label: 'the red banner', u: 0.50, v: 0.20, r: 0.055 },
      { id: 'lantern', label: 'the round paper lantern', u: 0.72, v: 0.32, r: 0.05 },
      { id: 'cat', label: 'the cat on the stall roof', u: 0.30, v: 0.44, r: 0.05 },
      { id: 'lights', label: 'the string-light bulb', u: 0.42, v: 0.56, r: 0.045 },
      { id: 'basket', label: 'the basket of apples', u: 0.16, v: 0.74, r: 0.055 },
    ],
  },
];

export function levelById(id) {
  return LEVELS.find((level) => level.id === id) ?? LEVELS[0];
}
