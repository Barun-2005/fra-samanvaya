// pages/api/mock/claims/approval-queue.js
import { mockClaims } from './_data';

export default function handler(req, res) {
  // Filter for claims that are "Pending" to simulate an approval queue
  const approvalQueue = mockClaims.filter(c => c.status === 'Pending');
  res.status(200).json(approvalQueue);
}