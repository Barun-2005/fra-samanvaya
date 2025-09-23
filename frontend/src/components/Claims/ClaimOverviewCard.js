const ClaimOverviewCard = ({ claim }) => {
    const { claimantPhotoUrl, personalInfo, familyDetails, claimType, status, submissionDate, claimId } = claim;
    
    const getStatusBadgeClass = (status) => {
        switch (status) {
          case 'Approved':
            return 'bg-success/10 text-success';
          case 'Pending':
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
          case 'In Review':
             return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
          case 'Rejected':
            return 'bg-danger-light/10 text-danger-light';
          default:
            return 'bg-gray-100 text-gray-800';
        }
      };

    return (
      <div className="p-6 space-y-6 rounded-lg bg-card dark:bg-card-dark shadow-soft">
        <div className="flex flex-col items-center space-y-4">
          <img alt={personalInfo.fullName} className="w-32 h-32 rounded-full shadow-soft" src={claimantPhotoUrl || '/default-avatar.png'} />
          <div className="text-center">
            <h2 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">{personalInfo.fullName}</h2>
            <p className="text-sm text-text-secondary dark:text-text-secondary-dark">Claimant ID: {claimId}</p>
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="font-bold text-primary dark:text-accent">Personal Information</h3>
          <div className="space-y-3 text-sm">
            {/* Personal info fields */}
            <div className="flex justify-between"><span className="text-text-secondary dark:text-text-secondary-dark">Full Name</span><span className="font-medium text-text-primary dark:text-text-primary-dark">{personalInfo.fullName}</span></div>
            <div className="flex justify-between"><span className="text-text-secondary dark:text-text-secondary-dark">Date of Birth</span><span className="font-medium text-text-primary dark:text-text-primary-dark">{personalInfo.dob}</span></div>
            <div className="flex justify-between"><span className="text-text-secondary dark:text-text-secondary-dark">Address</span><span className="font-medium text-text-primary dark:text-text-primary-dark text-right">{personalInfo.address}</span></div>
            <div className="flex justify-between"><span className="text-text-secondary dark:text-text-secondary-dark">Contact</span><span className="font-medium text-text-primary dark:text-text-primary-dark">{personalInfo.contact}</span></div>
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="font-bold text-primary dark:text-accent">Family Details</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-text-secondary dark:text-text-secondary-dark">Spouse</span><span className="font-medium text-text-primary dark:text-text-primary-dark">{familyDetails.spouse}</span></div>
            <div className="flex justify-between"><span className="text-text-secondary dark:text-text-secondary-dark">Dependents</span><span className="font-medium text-text-primary dark:text-text-primary-dark">{familyDetails.dependents}</span></div>
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="font-bold text-primary dark:text-accent">Claim Details</h3>
          <div className="space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-text-secondary dark:text-text-secondary-dark">Claim Type</span><span className="font-medium text-text-primary dark:text-text-primary-dark">{claimType}</span></div>
            <div className="flex justify-between items-center"><span className="text-text-secondary dark:text-text-secondary-dark">Status</span><span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(status)}`}>{status}</span></div>
            <div className="flex justify-between"><span className="text-text-secondary dark:text-text-secondary-dark">Submitted</span><span className="font-medium text-text-primary dark:text-text-primary-dark">{new Date(submissionDate).toLocaleDateString()}</span></div>
          </div>
        </div>
      </div>
    );
  };
  
  export default ClaimOverviewCard;