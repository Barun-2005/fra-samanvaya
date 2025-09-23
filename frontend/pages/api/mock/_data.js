// frontend/pages/api/mock/_data.js

// This is a comprehensive mock data structure that includes all the fields
// required by the ClaimDetailPage, ClaimOverviewCard, and ClaimTabs components.
export const mockClaims = Array.from({ length: 50 }, (_, i) => ({
    _id: i.toString(), // Use string IDs for consistency with database IDs.
    claimId: `CLM-2024-${String(i + 1).padStart(3, '0')}`,
    claimantName: `Claimant ${i + 1}`,
    village: `Village ${i % 5}`,
    claimType: i % 2 === 0 ? 'Land Ownership' : 'Forest Rights',
    status: ['Approved', 'Pending', 'Rejected'][i % 3],
    submissionDate: new Date(2024, i % 12, (i % 28) + 1).toISOString(),
    geojson: i % 3 === 0 ? { "type": "Point", "coordinates": [77.5946, 12.9716] } : null,
    
    // Detailed fields required by the claim detail page components
    claimantPhotoUrl: `https://i.pravatar.cc/150?u=${i}`,
    personalInfo: {
      fullName: `Claimant ${i + 1}`,
      dob: '1985-08-15',
      address: `123 Maple St, Village ${i % 5}`,
      contact: `+1 (555) 123-45${String(i).padStart(2, '0')}`,
    },
    familyDetails: {
      spouse: `Spouse ${i + 1}`,
      dependents: i % 4,
    },
    documents: [
      { _id: `doc${i}-1`, filename: 'Aadhar_Card.pdf', uploadedAt: '2023-05-20T10:00:00Z', uploader: `Claimant ${i + 1}`, url: '#' },
      { _id: `doc${i}-2`, filename: 'Land_Deed.pdf', uploadedAt: '2023-05-21T11:30:00Z', uploader: `Claimant ${i + 1}`, url: '#' },
      { _id: `doc${i}-3`, filename: 'Ration_Card.pdf', uploadedAt: '2023-05-22T12:00:00Z', uploader: `Claimant ${i + 1}`, url: '#' },
    ],
    auditTrail: [
        { event: 'Claim Submitted', user: `Claimant ${i + 1}`, timestamp: '2023-05-22T12:00:00Z', details: 'Initial submission' },
        { event: 'Documents Verified', user: 'Verifier Officer', timestamp: '2023-05-23T14:00:00Z', details: 'Aadhar and Land Deed verified' },
    ],
    dssRecommendations: {
        score: 85 - (i % 20),
        recommendation: (i % 3 === 0) ? 'Approve' : 'Further Review Required',
        reason: 'High probability of authentic claim based on historical data.',
        confidence: `${90 - (i % 15)}%`,
    },
    userPermissions: {
      canApprove: true,
      canReject: true,
    }
}));
