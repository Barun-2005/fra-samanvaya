import { useState } from 'react';
import { useRouter } from 'next/router';
import AuthGuard from '../src/components/Layout/AuthGuard';
import RoleGuard from '../src/components/Layout/RoleGuard';
import SmartUploadForm from '../src/components/Claims/SmartUploadForm';
import dynamic from 'next/dynamic';
import api from '../src/lib/api';

// Dynamic import to avoid SSR issues with Leaflet
const ClaimBoundaryMap = dynamic(() => import('../src/components/Claims/ClaimBoundaryMap'), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse bg-card rounded-xl border border-border p-12 text-center">
      <p className="text-muted-foreground">Loading map...</p>
    </div>
  ),
});

function CreateClaimWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [boundary, setBoundary] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const steps = [
    { number: 1, name: 'Upload & Details', icon: '📄' },
    { number: 2, name: 'Land Boundary', icon: '🗺️' },
    { number: 3, name: 'Review & Submit', icon: '✓' },
  ];

  // Handle data extraction from SmartUploadForm
  const handleDataExtracted = (data) => {
    setFormData(data);
  };

  // Handle boundary drawing from map
  const handleBoundaryDrawn = (boundaryData) => {
    setBoundary(boundaryData);
  };

  // Validation for each step
  const canProceed = (step) => {
    switch (step) {
      case 1:
        return formData.claimantName && formData.aadhaarNumber && formData.village && formData.landSizeClaimed && formData.reasonForClaim;
      case 2:
        return boundary !== null;
      default:
        return true;
    }
  };

  // Navigate to next step
  const nextStep = () => {
    if (canProceed(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
      setError('');
    } else {
      setError(getStepErrorMessage(currentStep));
    }
  };

  // Navigate to previous step (disabled on step 3)
  const prevStep = () => {
    if (currentStep > 1 && currentStep !== 3) {
      setCurrentStep((prev) => Math.max(prev - 1, 1));
      setError('');
    }
  };

  // Get error message for current step
  const getStepErrorMessage = (step) => {
    switch (step) {
      case 1:
        return 'Please fill all required fields (marked with *)';
      case 2:
        return 'Please draw your land boundary on the map';
      default:
        return '';
    }
  };

  // Submit claim
  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');

    try {
      const claimPayload = {
        // Personal details from formData
        claimantName: formData.claimantName,
        aadhaarNumber: formData.aadhaarNumber,
        village: formData.village,
        landSizeClaimed: Number(formData.landSizeClaimed),
        surveyNumber: formData.surveyNumber,
        claimType: formData.claimType,
        reasonForClaim: formData.reasonForClaim,
        remarks: formData.remarks,

        // GeoJSON boundary data
        geojson: {
          type: boundary.type || 'Polygon',
          coordinates: boundary.coordinates,
        },
        boundaryArea: boundary.area,

        // Status and metadata
        status: 'Submitted',
        dateSubmitted: new Date().toISOString(),
      };

      const response = await api.post('/claims', claimPayload);

      // Success - redirect to claims page
      router.push(`/claims/${response.data.claim?._id || response.data._id}`);
    } catch (err) {
      console.error('Claim submission error:', err);
      setError(err.response?.data?.message || 'Failed to submit claim. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Create New Claim</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Submit your land claim application with AI-assisted form filling
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-card border-b border-border sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col sm:flex-row items-center sm:gap-3 flex-1">
                  {/* Step Circle */}
                  <div
                    className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full font-bold transition-colors ${step.number === currentStep
                      ? 'bg-primary text-primary-foreground scale-110'
                      : step.number < currentStep
                        ? 'bg-green-500 text-white'
                        : 'bg-muted text-muted-foreground'
                      }`}
                  >
                    {step.number < currentStep ? '✓' : step.icon}
                  </div>

                  {/* Step Name */}
                  <div className="hidden sm:block text-left">
                    <p className="text-xs text-muted-foreground">Step {step.number}</p>
                    <p
                      className={`text-sm font-semibold ${step.number === currentStep ? 'text-foreground' : 'text-muted-foreground'
                        }`}
                    >
                      {step.name}
                    </p>
                  </div>

                  {/* Mobile: Show only current step name */}
                  {step.number === currentStep && (
                    <p className="sm:hidden text-xs font-medium text-foreground mt-1">{step.name}</p>
                  )}
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div
                    className={`hidden sm:block h-1 flex-1 mx-4 rounded transition-colors ${step.number < currentStep ? 'bg-green-500' : 'bg-border'
                      }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-400">⚠️ {error}</p>
          </div>
        )}

        {/* Step Content */}
        <div className="bg-card rounded-xl border border-border p-4 sm:p-6 shadow-soft">
          {currentStep === 1 && (
            <div>
              <h2 className="text-xl font-bold text-foreground mb-6">Upload Documents & Fill Details</h2>
              <SmartUploadForm onDataExtracted={handleDataExtracted} />
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h2 className="text-xl font-bold text-foreground mb-6">Mark Your Land Boundary</h2>
              <ClaimBoundaryMap onBoundaryDrawn={handleBoundaryDrawn} initialBoundary={boundary} />
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h2 className="text-xl font-bold text-foreground mb-6">Review Your Claim</h2>

              <div className="space-y-6">
                {/* Personal Details */}
                <div className="bg-muted rounded-lg p-4">
                  <h3 className="font-semibold text-foreground mb-3">Personal Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Name:</span>
                      <span className="ml-2 font-medium text-foreground">{formData.claimantName}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Aadhaar:</span>
                      <span className="ml-2 font-medium text-foreground">{formData.aadhaarNumber}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Village:</span>
                      <span className="ml-2 font-medium text-foreground">{formData.village}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Claim Type:</span>
                      <span className="ml-2 font-medium text-foreground">{formData.claimType}</span>
                    </div>
                  </div>
                </div>

                {/* Land Details */}
                <div className="bg-muted rounded-lg p-4">
                  <h3 className="font-semibold text-foreground mb-3">Land Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Land Size:</span>
                      <span className="ml-2 font-medium text-foreground">{formData.landSizeClaimed} hectares</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Boundary Area:</span>
                      <span className="ml-2 font-medium text-foreground">{boundary?.area} hectares</span>
                    </div>
                    {formData.surveyNumber && (
                      <div>
                        <span className="text-muted-foreground">Survey Number:</span>
                        <span className="ml-2 font-medium text-foreground">{formData.surveyNumber}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Reason */}
                <div className="bg-muted rounded-lg p-4">
                  <h3 className="font-semibold text-foreground mb-2">Reason for Claim</h3>
                  <p className="text-sm text-foreground">{formData.reasonForClaim}</p>
                </div>

                {/* Remarks */}
                {formData.remarks && (
                  <div className="bg-muted rounded-lg p-4">
                    <h3 className="font-semibold text-foreground mb-2">Additional Remarks</h3>
                    <p className="text-sm text-foreground">{formData.remarks}</p>
                  </div>
                )}

                {/* Important Notice */}
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-900 dark:text-yellow-400 mb-2">⚠️ Important</h3>
                  <ul className="text-sm text-yellow-800 dark:text-yellow-300 space-y-1 list-disc list-inside">
                    <li>Once submitted, you cannot go back to previous steps</li>
                    <li>Your claim will be reviewed by our verification team</li>
                    <li>You will be notified of the status via the dashboard</li>
                    <li>Make sure all information is accurate before submitting</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 1 || currentStep === 3}
            className="px-6 py-3 border border-border rounded-lg font-semibold text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>

          {currentStep < steps.length ? (
            <button
              onClick={nextStep}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Submitting...
                </span>
              ) : (
                '🚀 Submit Claim'
              )}
            </button>
          )}
        </div>

        {/* Progress Indicator (Mobile) */}
        <div className="mt-4 sm:hidden text-center text-sm text-muted-foreground">
          Step {currentStep} of {steps.length}
        </div>
      </div>
    </div>
  );
}

export default function CreateClaim() {
  return (
    <AuthGuard>
      <RoleGuard allowedRoles={['Citizen', 'Data Entry Officer']}>
        <CreateClaimWizard />
      </RoleGuard>
    </AuthGuard>
  );
}
