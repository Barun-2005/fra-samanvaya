import { useState, useRef } from 'react';
import api from '../../lib/api';

/**
 * SmartUploadForm - Gemini OCR + Voice Input
 * Allows users to upload documents (Aadhar, land docs) and auto-fills form fields
 * Includes voice input for accessibility
 */
export default function SmartUploadForm({ onDataExtracted }) {
    const [file, setFile] = useState(null);
    const [extractedData, setExtractedData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [activeVoiceField, setActiveVoiceField] = useState(null);
    const fileInputRef = useRef(null);
    const recognitionRef = useRef(null);

    // Form fields
    const [formData, setFormData] = useState({
        claimantName: '',
        aadhaarNumber: '',
        village: '',
        landSizeClaimed: '',
        surveyNumber: '',
        claimType: 'Individual',
        reasonForClaim: '',
        remarks: '',
    });

    // Track which fields were auto-filled (for yellow highlight)
    const [autoFilledFields, setAutoFilledFields] = useState(new Set());
    const [missingFields, setMissingFields] = useState(new Set());

    // Handle file selection
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setError('');
        }
    };

    // Handle form field changes - CRITICAL: This syncs data to parent
    const handleChange = (e) => {
        const { name, value } = e.target;
        const updatedFormData = {
            ...formData,
            [name]: value
        };
        setFormData(updatedFormData);

        // IMMEDIATELY notify parent component so validation works!
        if (onDataExtracted) {
            onDataExtracted(updatedFormData);
        }

        // Remove from missing fields if user fills it manually
        if (missingFields.has(name)) {
            const updated = new Set(missingFields);
            updated.delete(name);
            setMissingFields(updated);
        }
    };

    // Upload and extract data from document
    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file first');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const formDataObj = new FormData();
            formDataObj.append('document', file);

            const response = await api.post('/documents/extract', formDataObj, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const data = response.data.extractedData;
            setExtractedData(data);

            // Auto-fill form fields
            const updatedFormData = { ...formData };
            const autoFilled = new Set();
            const missing = new Set();

            if (data.claimantName) {
                updatedFormData.claimantName = data.claimantName;
                autoFilled.add('claimantName');
            } else {
                missing.add('claimantName');
            }

            if (data.aadhaarNumber) {
                updatedFormData.aadhaarNumber = data.aadhaarNumber;
                autoFilled.add('aadhaarNumber');
            } else {
                missing.add('aadhaarNumber');
            }

            if (data.village) {
                updatedFormData.village = data.village;
                autoFilled.add('village');
            } else {
                missing.add('village');
            }

            if (data.landSizeClaimed) {
                updatedFormData.landSizeClaimed = data.landSizeClaimed;
                autoFilled.add('landSizeClaimed');
            }

            if (data.surveyNumber) {
                updatedFormData.surveyNumber = data.surveyNumber;
                autoFilled.add('surveyNumber');
            }

            if (data.claimType) {
                updatedFormData.claimType = data.claimType;
                autoFilled.add('claimType');
            }

            setFormData(updatedFormData);
            setAutoFilledFields(autoFilled);
            setMissingFields(missing);

            // Pass data to parent component AFTER state is set
            if (onDataExtracted) {
                onDataExtracted(updatedFormData);
            }

        } catch (err) {
            console.error('OCR extraction error:', err);
            const backendError = err.response?.data?.error;
            const message = err.response?.data?.message || 'Failed to extract data.';
            setError(backendError ? `${message}: ${backendError}` : message);
        } finally {
            setLoading(false);
        }
    };

    // Initialize Speech Recognition
    const initSpeechRecognition = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
            return null;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-IN'; // English (India) - supports Hindi-English mix

        return recognition;
    };

    // Start voice input for a specific field
    const startVoiceInput = (fieldName) => {
        if (!recognitionRef.current) {
            recognitionRef.current = initSpeechRecognition();
            if (!recognitionRef.current) return;
        }

        const recognition = recognitionRef.current;
        setActiveVoiceField(fieldName);
        setIsListening(true);

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            const updatedFormData = {
                ...formData,
                [fieldName]: formData[fieldName] + ' ' + transcript
            };
            setFormData(updatedFormData);

            // Notify parent of voice input changes too!
            if (onDataExtracted) {
                onDataExtracted(updatedFormData);
            }

            setIsListening(false);
            setActiveVoiceField(null);
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
            setActiveVoiceField(null);
            alert('Voice input failed. Please try again.');
        };

        recognition.onend = () => {
            setIsListening(false);
            setActiveVoiceField(null);
        };

        recognition.start();
    };

    // Stop voice input
    const stopVoiceInput = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        setIsListening(false);
        setActiveVoiceField(null);
    };

    // Get field class based on auto-fill status
    const getFieldClassName = (fieldName, baseClass) => {
        if (missingFields.has(fieldName)) {
            return `${baseClass} border-yellow-400 bg-yellow-50 dark:bg-yellow-900/10`;
        }
        if (autoFilledFields.has(fieldName)) {
            return `${baseClass} border-green-400 bg-green-50 dark:bg-green-900/10`;
        }
        return baseClass;
    };

    return (
        <div className="space-y-6">
            {/* Upload Section */}
            <div className="bg-card rounded-xl border-2 border-dashed border-border p-6 text-center">
                <h3 className="text-lg font-semibold text-foreground mb-2">📄 Upload Document</h3>
                <p className="text-sm text-muted-foreground mb-4">
                    Upload your Aadhar card or land document. Our AI will auto-fill the form.
                </p>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                />

                <div className="space-y-3">
                    <button
                        onClick={() => fileInputRef.current.click()}
                        className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:bg-secondary/80 transition-colors"
                    >
                        {file ? `Selected: ${file.name}` : 'Choose File'}
                    </button>

                    {file && (
                        <button
                            onClick={handleUpload}
                            disabled={loading}
                            className="ml-3 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Scanning...
                                </span>
                            ) : (
                                '✨ Extract Data'
                            )}
                        </button>
                    )}
                </div>

                {error && (
                    <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
                )}

                {extractedData && (
                    <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                            ✓ Data extracted successfully! Review and edit fields below.
                        </p>
                        {missingFields.size > 0 && (
                            <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                                ⚠️ Some fields couldn't be detected (highlighted in yellow)
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Claimant Name */}
                <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                        Claimant Name *
                    </label>
                    <input
                        type="text"
                        name="claimantName"
                        value={formData.claimantName}
                        onChange={handleChange}
                        className={getFieldClassName('claimantName', 'form-input w-full rounded-lg border p-3 text-foreground')}
                        placeholder="Enter full name"
                        required
                    />
                </div>

                {/* Aadhaar Number */}
                <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                        Aadhaar Number *
                    </label>
                    <input
                        type="text"
                        name="aadhaarNumber"
                        value={formData.aadhaarNumber}
                        onChange={handleChange}
                        maxLength="12"
                        className={getFieldClassName('aadhaarNumber', 'form-input w-full rounded-lg border p-3 text-foreground')}
                        placeholder="12-digit Aadhaar"
                        required
                    />
                </div>

                {/* Village */}
                <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                        Village *
                    </label>
                    <input
                        type="text"
                        name="village"
                        value={formData.village}
                        onChange={handleChange}
                        className={getFieldClassName('village', 'form-input w-full rounded-lg border p-3 text-foreground')}
                        placeholder="Village name"
                        required
                    />
                </div>

                {/* Land Size */}
                <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                        Land Size (hectares) *
                    </label>
                    <input
                        type="number"
                        name="landSizeClaimed"
                        value={formData.landSizeClaimed}
                        onChange={handleChange}
                        step="0.1"
                        min="0"
                        className={getFieldClassName('landSizeClaimed', 'form-input w-full rounded-lg border p-3 text-foreground')}
                        placeholder="e.g., 2.5"
                        required
                    />
                </div>

                {/* Survey Number */}
                <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                        Survey/Plot Number
                    </label>
                    <input
                        type="text"
                        name="surveyNumber"
                        value={formData.surveyNumber}
                        onChange={handleChange}
                        className={getFieldClassName('surveyNumber', 'form-input w-full rounded-lg border p-3 text-foreground')}
                        placeholder="Survey number (if known)"
                    />
                </div>

                {/* Claim Type */}
                <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                        Claim Type *
                    </label>
                    <select
                        name="claimType"
                        value={formData.claimType}
                        onChange={handleChange}
                        className={getFieldClassName('claimType', 'form-input w-full rounded-lg border p-3 text-foreground')}
                        required
                    >
                        <option value="Individual">Individual</option>
                        <option value="Community">Community</option>
                    </select>
                </div>
            </div>

            {/* Voice Input Fields */}
            <div className="space-y-4">
                {/* Reason for Claim */}
                <div>
                    <label className="block text-sm font-medium text-foreground mb-1 flex items-center justify-between">
                        <span>Reason for Claim *</span>
                        <button
                            type="button"
                            onClick={() => isListening && activeVoiceField === 'reasonForClaim' ? stopVoiceInput() : startVoiceInput('reasonForClaim')}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${isListening && activeVoiceField === 'reasonForClaim'
                                ? 'bg-red-500 text-white animate-pulse'
                                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                                }`}
                            title="Voice input (Hindi/English)"
                        >
                            🎙️ {isListening && activeVoiceField === 'reasonForClaim' ? 'Listening...' : 'Voice'}
                        </button>
                    </label>
                    <textarea
                        name="reasonForClaim"
                        value={formData.reasonForClaim}
                        onChange={handleChange}
                        rows="3"
                        className="form-input w-full rounded-lg border p-3 text-foreground"
                        placeholder="Explain why you are making this claim..."
                        required
                    />
                </div>

                {/* Remarks */}
                <div>
                    <label className="block text-sm font-medium text-foreground mb-1 flex items-center justify-between">
                        <span>Additional Remarks</span>
                        <button
                            type="button"
                            onClick={() => isListening && activeVoiceField === 'remarks' ? stopVoiceInput() : startVoiceInput('remarks')}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${isListening && activeVoiceField === 'remarks'
                                ? 'bg-red-500 text-white animate-pulse'
                                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                                }`}
                            title="Voice input (Hindi/English)"
                        >
                            🎙️ {isListening && activeVoiceField === 'remarks' ? 'Listening...' : 'Voice'}
                        </button>
                    </label>
                    <textarea
                        name="remarks"
                        value={formData.remarks}
                        onChange={handleChange}
                        rows="2"
                        className="form-input w-full rounded-lg border p-3 text-foreground"
                        placeholder="Any additional information..."
                    />
                </div>
            </div>
        </div>
    );
}
