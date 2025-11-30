import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AuthGuard from '../../../src/components/Layout/AuthGuard';
import RoleGuard from '../../../src/components/Layout/RoleGuard';
import SmartUploadForm from '../../../src/components/Claims/SmartUploadForm';
import dynamic from 'next/dynamic';
import api from '../../../src/lib/api';
import toast from 'react-hot-toast';

// Dynamic import to avoid SSR issues with Leaflet
const ClaimBoundaryMap = dynamic(() => import('../../../src/components/Claims/ClaimBoundaryMap'), {
    ssr: false,
    loading: () => (
        <div className="animate-pulse bg-card rounded-xl border border-border p-12 text-center">
            <p className="text-muted-foreground">Loading map...</p>
        </div>
    ),
});

function EditClaimWizard() {
    const router = useRouter();
    const { id } = router.query;
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({});
    const [boundary, setBoundary] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const steps = [
        { number: 1, name: 'Edit Details', icon: '✏️' },
        { number: 2, name: 'Update Boundary', icon: '🗺️' },
        { number: 3, name: 'Review & Update', icon: '✓' },
    ];

    useEffect(() => {
        if (router.isReady && id) {
            fetchClaim();
        }
    }, [router.isReady, id]);

    const fetchClaim = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/claims/${id}`);
            const claim = response.data;

            // Populate form data
            setFormData({
                claimantName: claim.claimantName,
                aadhaarNumber: claim.aadhaarNumber,
                village: claim.village,
                landSizeClaimed: claim.landSizeClaimed,
                surveyNumber: claim.surveyNumber,
                claimType: claim.claimType,
                reasonForClaim: claim.reasonForClaim,
                remarks: claim.remarks,
            });

            // Populate boundary if exists
            if (claim.geojson) {
                setBoundary({
                    type: claim.geojson.type,
                    coordinates: claim.geojson.coordinates,
                    area: claim.boundaryArea || claim.landSizeClaimed // Fallback
                });
            }

        } catch (err) {
            console.error('Error fetching claim:', err);
            setError('Failed to load claim data');
            toast.error('Failed to load claim data');
        } finally {
            setLoading(false);
        }
    };

    // Handle data extraction from SmartUploadForm
    const handleDataExtracted = (data) => {
        setFormData(prev => ({ ...prev, ...data }));
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

    // Submit claim update
    const handleSubmit = async () => {
        setSubmitting(true);
        setError('');

        try {
            const claimPayload = {
                ...formData,
                landSizeClaimed: Number(formData.landSizeClaimed),

                // GeoJSON boundary data
                geojson: {
                    type: boundary.type || 'Polygon',
                    coordinates: boundary.coordinates,
                },
                boundaryArea: boundary.area,

                // Reset status to Submitted if it was Rejected
                status: 'Submitted',
                rejectionReason: null // Clear rejection reason
            };

            await api.put(`/claims/${id}`, claimPayload); // Assuming PUT endpoint exists or we use POST for update

            toast.success('Claim updated successfully!');
            router.push(`/claims/${id}`);
        } catch (err) {
            console.error('Claim update error:', err);
            setError(err.response?.data?.message || 'Failed to update claim. Please try again.');
            toast.error('Failed to update claim');
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-card border-b border-border">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Edit Claim</h1>
                    <p className="text-sm sm:text-base text-muted-foreground mt-1">
                        Update your claim details and resubmit
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
                            <h2 className="text-xl font-bold text-foreground mb-6">Edit Details</h2>
                            {/* Reuse SmartUploadForm but we might need to pass initial data if supported, 
                  or just use inputs directly. For now, let's use the form inputs directly 
                  since SmartUploadForm is designed for extraction. 
                  Actually, SmartUploadForm has internal state, so we can't easily pre-fill it 
                  without modifying it. 
                  
                  Let's just render the inputs manually here for editing to ensure pre-filling works.
              */}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Claimant Name *</label>
                                    <input type="text" value={formData.claimantName || ''} onChange={(e) => setFormData({ ...formData, claimantName: e.target.value })} className="form-input w-full rounded-lg border p-3 text-foreground" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Aadhaar Number *</label>
                                    <input type="text" value={formData.aadhaarNumber || ''} onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })} className="form-input w-full rounded-lg border p-3 text-foreground" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Village *</label>
                                    <input type="text" value={formData.village || ''} onChange={(e) => setFormData({ ...formData, village: e.target.value })} className="form-input w-full rounded-lg border p-3 text-foreground" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Land Size (ha) *</label>
                                    <input type="number" value={formData.landSizeClaimed || ''} onChange={(e) => setFormData({ ...formData, landSizeClaimed: e.target.value })} className="form-input w-full rounded-lg border p-3 text-foreground" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Survey Number</label>
                                    <input type="text" value={formData.surveyNumber || ''} onChange={(e) => setFormData({ ...formData, surveyNumber: e.target.value })} className="form-input w-full rounded-lg border p-3 text-foreground" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Claim Type *</label>
                                    <select value={formData.claimType || 'Individual'} onChange={(e) => setFormData({ ...formData, claimType: e.target.value })} className="form-input w-full rounded-lg border p-3 text-foreground">
                                        <option value="Individual">Individual</option>
                                        <option value="Community">Community</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-foreground mb-1">Reason for Claim *</label>
                                    <textarea value={formData.reasonForClaim || ''} onChange={(e) => setFormData({ ...formData, reasonForClaim: e.target.value })} rows="3" className="form-input w-full rounded-lg border p-3 text-foreground" required />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-foreground mb-1">Remarks</label>
                                    <textarea value={formData.remarks || ''} onChange={(e) => setFormData({ ...formData, remarks: e.target.value })} rows="2" className="form-input w-full rounded-lg border p-3 text-foreground" />
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div>
                            <h2 className="text-xl font-bold text-foreground mb-6">Update Land Boundary</h2>
                            <ClaimBoundaryMap onBoundaryDrawn={handleBoundaryDrawn} initialBoundary={boundary} />
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div>
                            <h2 className="text-xl font-bold text-foreground mb-6">Review & Update</h2>

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
                                        {/* ... other fields ... */}
                                    </div>
                                </div>

                                {/* Important Notice */}
                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                    <h3 className="font-semibold text-blue-900 dark:text-blue-400 mb-2">ℹ️ Note</h3>
                                    <p className="text-sm text-blue-800 dark:text-blue-300">
                                        Updating this claim will reset its status to "Submitted" and it will require re-verification.
                                    </p>
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
                            {submitting ? 'Updating...' : '🔄 Update Claim'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function EditClaim() {
    return (
        <AuthGuard>
            <RoleGuard allowedRoles={['Citizen', 'Data Entry Officer']}>
                <EditClaimWizard />
            </RoleGuard>
        </AuthGuard>
    );
}
