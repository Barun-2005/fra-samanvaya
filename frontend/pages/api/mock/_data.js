// pages/api/mock/_data.js
export const mockClaims = Array.from({ length: 50 }, (_, i) => ({
    _id: `60f7e6d2c3b3e2a1d8f3b8e${i}`,
    claimId: `CLM-2024-${String(i + 1).padStart(3, '0')}`,
    claimantName: `Claimant ${i + 1}`,
    village: `Village ${i % 5}`,
    claimType: i % 2 === 0 ? 'Land Ownership' : 'Forest Rights',
    status: ['Approved', 'Pending', 'Rejected'][i % 3],
    submissionDate: new Date(2024, i % 12, (i % 28) + 1).toISOString(),
    geojson: i % 3 === 0 ? { "type": "Point", "coordinates": [77.5946, 12.9716] } : null,
}));