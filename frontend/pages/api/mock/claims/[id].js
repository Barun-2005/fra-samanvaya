// pages/api/mock/claims/[id].js
import { mockClaims } from './_data';

export default function handler(req, res) {
  const { id } = req.query;
  const claim = mockClaims.find(c => c._id === id);

  if (claim) {
    // Add more detailed mock data for a single claim
    const detailedClaim = {
      ...claim,
      claimantPhotoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAmyuaU5Wx535VTeXq4P5J7M0LjScEQ7H038jwdK7DsgK7Jg0vagyOC8ZSucqypVIZclLg8j7J_noouj0E4x_m5xZIVvRHvXqGYPN0qB22rHvE-H31Vg8gUNu2qkPPIkWKhZFv7ODDC5rjccXxvXX20UUQOGUBcBu4r3pRjC-PiCnLBFqtxBB2E5RDMbcEE0eTujjdoKjmbWR8DPA_LAbZBxeBtA7R068K3IfmyNLPc24FkS7ig7ZSBrnC58lgALQyf_xBWREnR1RyK',
      personalInfo: {
        fullName: claim.claimantName,
        dob: '1985-08-15',
        address: '123 Maple St, Anytown',
        contact: '+1 (555) 123-4567',
      },
      familyDetails: {
        spouse: 'Ethan Clark',
        dependents: 2,
      },
      documents: [
        { _id: 'doc1', filename: 'Aadhar_Card.pdf', uploadedAt: '2023-05-20T10:00:00Z', uploader: 'Sophia Clark', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
        { _id: 'doc2', filename: 'Land_Deed.pdf', uploadedAt: '2023-05-21T11:30:00Z', uploader: 'Sophia Clark', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
      ],
      // Simulate role-based access for buttons
      userPermissions: {
        canApprove: true,
        canReject: true,
      }
    };
    res.status(200).json(detailedClaim);
  } else {
    res.status(404).json({ message: 'Claim not found' });
  }
}
