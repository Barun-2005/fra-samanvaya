// pages/api/mock/claims/[id]/audit.js
export default function handler(req, res) {
    const { id } = req.query;
    const auditTrail = [
      { _id: 'audit1', user: 'system', action: 'Claim Created', timestamp: '2023-05-20T09:00:00Z', notes: `Claim ${id} created by Claimant.` },
      { _id: 'audit2', user: 'verifier@gov.in', action: 'Verification', timestamp: '2023-05-22T14:30:00Z', notes: 'Initial verification complete. Documents seem to be in order.' },
      { _id: 'audit3', user: 'approver@gov.in', action: 'Review', timestamp: '2023-05-24T11:00:00Z', notes: 'Under final review.' },
    ];
    res.status(200).json(auditTrail);
}