import { useState, useRef, useEffect } from 'react';
import { Upload, FileText, Check, X, Loader2, Mic, MicOff, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api'; // Import API client

export default function SmartUploadForm({ onDataExtracted }) {
    const [file, setFile] = useState(null);
    const [scanning, setScanning] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [scannedData, setScannedData] = useState(null);
    const [isListening, setIsListening] = useState(false);
    const [activeField, setActiveField] = useState(null);
    const inputRef = useRef(null);

    // Form State
    const [formData, setFormData] = useState({
        claimantName: '',
        aadhaarNumber: '',
        village: '',
        landSizeClaimed: '',
        surveyNumber: '',
        claimType: 'Individual',
        reasonForClaim: '',
        remarks: ''
    });

    // Update parent whenever formData changes
    useEffect(() => {
        onDataExtracted(formData);
    }, [formData, onDataExtracted]);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (file) => {
        if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
            setFile(file);
            setScannedData(null); // Reset scan on new file
        } else {
            toast.error('Please upload a PDF or image file');
        }
    };

    const removeFile = () => {
        setFile(null);
        setScannedData(null);
    };

    const handleScan = async () => {
        if (!file) return;

        setScanning(true);
        const toastId = toast.loading('Uploading & Analyzing with Gemini AI...');

        try {
            // Create FormData for file upload
            const uploadData = new FormData();
            uploadData.append('document', file);

            // Call the REAL backend endpoint
            const response = await api.post('/documents/extract', uploadData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const { extractedData, fieldsNeedingReview, overallConfidence } = response.data;

            if (extractedData) {
                setScannedData(extractedData);

                // Helper to extract value from new format (handles both old string format and new {value, confidence} format)
                const getValue = (field) => {
                    if (!field) return '';
                    if (typeof field === 'string') return field;
                    if (typeof field === 'object' && field.value !== undefined) return field.value;
                    return '';
                };

                // Merge extracted data with form state
                setFormData(prev => ({
                    ...prev,
                    claimantName: getValue(extractedData.claimantName) || prev.claimantName,
                    aadhaarNumber: getValue(extractedData.aadhaarNumber) || prev.aadhaarNumber,
                    village: getValue(extractedData.village) || prev.village,
                    district: getValue(extractedData.district) || prev.district,
                    landSizeClaimed: getValue(extractedData.landArea?.value?.amount || extractedData.landArea)?.toString() || prev.landSizeClaimed,
                    surveyNumber: getValue(extractedData.surveyNumber) || prev.surveyNumber,
                    claimType: getValue(extractedData.claimType) || prev.claimType,
                    reasonForClaim: prev.reasonForClaim || getValue(extractedData.reasonForClaim) || '',
                    remarks: prev.remarks || getValue(extractedData.remarks) || ''
                }));

                // Show fields needing review if any
                if (fieldsNeedingReview && fieldsNeedingReview.length > 0) {
                    toast.success(`Document analyzed! Please review: ${fieldsNeedingReview.join(', ')}`, { id: toastId, duration: 5000 });
                } else {
                    toast.success(`Document analyzed! Confidence: ${Math.round((overallConfidence || 0.8) * 100)}%`, { id: toastId });
                }
            } else {
                throw new Error('No data extracted');
            }

        } catch (error) {
            console.error('Scanning error:', error);
            toast.error(error.response?.data?.message || 'Failed to analyze document', { id: toastId });
        } finally {
            setScanning(false);
        }
    };


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Voice to Text Logic
    const startListening = (fieldName) => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            toast.error('Voice input is not supported in this browser.');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-IN'; // Indian English

        recognition.onstart = () => {
            setIsListening(true);
            setActiveField(fieldName);
            toast.loading('Listening...', { id: 'voice-toast' });
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setFormData(prev => ({
                ...prev,
                [fieldName]: (prev[fieldName] ? prev[fieldName] + ' ' : '') + transcript
            }));
            toast.dismiss('voice-toast');
            toast.success('Text added!');
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error', event.error);
            toast.dismiss('voice-toast');
            toast.error('Could not hear you. Please try again.');
            setIsListening(false);
            setActiveField(null);
        };

        recognition.onend = () => {
            setIsListening(false);
            setActiveField(null);
            toast.dismiss('voice-toast');
        };

        recognition.start();
    };

    return (
        <div className="space-y-8">
            {/* Upload Section */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <Upload className="w-5 h-5 text-primary" />
                    1. Upload Document
                </h3>

                <div
                    className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${dragActive
                        ? 'border-primary bg-primary/5'
                        : 'border-border-light dark:border-border-dark hover:border-primary/50'
                        }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        className="hidden"
                        accept=".pdf,image/*"
                        onChange={handleChange}
                    />

                    {!file ? (
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <Upload className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-lg font-semibold text-slate-900 dark:text-white">
                                    Upload Claim Document
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    Drag & drop or click to browse
                                </p>
                            </div>
                            <p className="text-xs text-slate-400">
                                Supports PDF, JPG, PNG (Max 10MB)
                            </p>
                            <button
                                onClick={() => inputRef.current?.click()}
                                className="mt-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                            >
                                Select File
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 text-left">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-white truncate max-w-[200px]">
                                        {file.name}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={removeFile}
                                className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-500 hover:text-red-500 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>

                {file && !scannedData && (
                    <div className="flex justify-end">
                        <button
                            onClick={handleScan}
                            disabled={scanning}
                            className="bg-primary hover:bg-primary-hover text-white font-semibold py-2.5 px-6 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                        >
                            {scanning ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Analyzing with Gemini...
                                </>
                            ) : (
                                <>
                                    <Check className="w-5 h-5" />
                                    Scan & Auto-fill
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>

            {/* Auto-filled Form Section */}
            <div className={`space-y-6 transition-all duration-500 ${scannedData ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-4 grayscale'}`}>
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <Edit2 className="w-5 h-5 text-primary" />
                        2. Verify & Edit Details
                    </h3>
                    {scannedData && (
                        <span className="text-xs font-medium bg-green-100 text-green-800 px-2.5 py-1 rounded-full flex items-center gap-1">
                            <Check className="w-3 h-3" /> Auto-filled by Gemini AI
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Claimant Name */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Claimant Name *</label>
                        <input
                            type="text"
                            name="claimantName"
                            value={formData.claimantName}
                            onChange={handleInputChange}
                            className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-primary focus:border-primary"
                            placeholder="Enter full name"
                        />
                    </div>

                    {/* Aadhaar Number */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Aadhaar Number *</label>
                        <input
                            type="text"
                            name="aadhaarNumber"
                            value={formData.aadhaarNumber}
                            onChange={handleInputChange}
                            className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-primary focus:border-primary"
                            placeholder="XXXX XXXX XXXX"
                        />
                    </div>

                    {/* Village */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Village *</label>
                        <input
                            type="text"
                            name="village"
                            value={formData.village}
                            onChange={handleInputChange}
                            className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-primary focus:border-primary"
                            placeholder="Village Name"
                        />
                    </div>

                    {/* Land Size */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Land Size (Hectares) *</label>
                        <input
                            type="number"
                            name="landSizeClaimed"
                            value={formData.landSizeClaimed}
                            onChange={handleInputChange}
                            className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-primary focus:border-primary"
                            placeholder="0.00"
                        />
                    </div>

                    {/* Survey Number */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Survey Number</label>
                        <input
                            type="text"
                            name="surveyNumber"
                            value={formData.surveyNumber}
                            onChange={handleInputChange}
                            className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-primary focus:border-primary"
                            placeholder="Survey / Plot No."
                        />
                    </div>

                    {/* Claim Type */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Claim Type *</label>
                        <select
                            name="claimType"
                            value={formData.claimType}
                            onChange={handleInputChange}
                            className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-primary focus:border-primary"
                        >
                            <option value="Individual">Individual Forest Rights</option>
                            <option value="Community">Community Forest Rights</option>
                        </select>
                    </div>

                    {/* Reason for Claim (Voice Enabled) */}
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex justify-between">
                            Reason for Claim *
                            <span className="text-xs text-slate-500 font-normal">Click microphone to speak</span>
                        </label>
                        <div className="relative">
                            <textarea
                                name="reasonForClaim"
                                value={formData.reasonForClaim}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-primary focus:border-primary pr-12"
                                placeholder="Describe why you are claiming this land..."
                            />
                            <button
                                type="button"
                                onClick={() => startListening('reasonForClaim')}
                                className={`absolute right-3 top-3 p-2 rounded-full transition-all ${activeField === 'reasonForClaim'
                                    ? 'bg-red-100 text-red-600 animate-pulse'
                                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                    }`}
                                title="Voice Input"
                            >
                                {activeField === 'reasonForClaim' ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Remarks (Voice Enabled) */}
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex justify-between">
                            Additional Remarks
                            <span className="text-xs text-slate-500 font-normal">Click microphone to speak</span>
                        </label>
                        <div className="relative">
                            <textarea
                                name="remarks"
                                value={formData.remarks}
                                onChange={handleInputChange}
                                rows={2}
                                className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-primary focus:border-primary pr-12"
                                placeholder="Any other details..."
                            />
                            <button
                                type="button"
                                onClick={() => startListening('remarks')}
                                className={`absolute right-3 top-3 p-2 rounded-full transition-all ${activeField === 'remarks'
                                    ? 'bg-red-100 text-red-600 animate-pulse'
                                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                    }`}
                                title="Voice Input"
                            >
                                {activeField === 'remarks' ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
