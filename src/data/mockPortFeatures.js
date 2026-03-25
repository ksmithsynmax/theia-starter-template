export const mockPortFeatures = {
  type: 'FeatureCollection',
  features: [
    // Port Boundary
    {
      type: 'Feature',
      properties: {
        id: 'port-boundary',
        type: 'port',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [103.74, 1.25],
            [103.77, 1.25],
            [103.80, 1.25],
            [103.83, 1.25],
            [103.84, 1.23],
            [103.82, 1.21],
            [103.79, 1.21],
            [103.76, 1.22],
            [103.74, 1.23],
            [103.74, 1.25],
          ],
        ],
      },
    },
    // Terminal 1 (Brani)
    {
      type: 'Feature',
      properties: {
        id: 'brani',
        type: 'terminal',
        name: 'BRANI TERMINAL',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [103.78, 1.24],
            [103.79, 1.24],
            [103.795, 1.225],
            [103.785, 1.225],
            [103.78, 1.24],
          ],
        ],
      },
    },
    // Terminal 2 (Jurong VLCC)
    {
      type: 'Feature',
      properties: {
        id: 'jurong_vlcc',
        type: 'terminal',
        name: 'JURONG ISLAND VLCC TERMINAL',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [103.75, 1.24],
            [103.76, 1.24],
            [103.765, 1.225],
            [103.755, 1.225],
            [103.75, 1.24],
          ],
        ],
      },
    },
    // Terminal 3 (Jurong Port)
    {
      type: 'Feature',
      properties: {
        id: 'jurong_port',
        type: 'terminal',
        name: 'JURONG PORT',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [103.81, 1.24],
            [103.82, 1.24],
            [103.825, 1.225],
            [103.815, 1.225],
            [103.81, 1.24],
          ],
        ],
      },
    },
    // Berths for Brani
    {
      type: 'Feature',
      properties: {
        id: 'b1',
        type: 'berth',
        name: 'BERTH NO. B1',
        terminalId: 'brani',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [103.782, 1.238],
            [103.784, 1.238],
            [103.785, 1.235],
            [103.783, 1.235],
            [103.782, 1.238],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 'b2',
        type: 'berth',
        name: 'BERTH NO. B2',
        terminalId: 'brani',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [103.786, 1.238],
            [103.788, 1.238],
            [103.789, 1.235],
            [103.787, 1.235],
            [103.786, 1.238],
          ],
        ],
      },
    },
    // Berths for Jurong VLCC
    {
      type: 'Feature',
      properties: {
        id: 'b3',
        type: 'berth',
        name: 'BERTH NO. B3',
        terminalId: 'jurong_vlcc',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [103.755, 1.235],
            [103.758, 1.235],
            [103.759, 1.232],
            [103.756, 1.232],
            [103.755, 1.235],
          ],
        ],
      },
    },
  ],
}
