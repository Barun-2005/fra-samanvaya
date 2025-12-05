import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../../src/components/Layout/DashboardLayout';
import RoleGuard from '../../src/components/Layout/RoleGuard';
import { Camera, MapPin, UploadCloud, CheckCircle, AlertTriangle, Wifi, WifiOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../src/lib/api';

export default function FieldWorkerDashboard() {
    const [isOnline, setIsOnline] = useState(true);
    const [pendingReports, setPendingReports] = useState([]);
    const [syncing, setSyncing] = useState(false);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [selectedClaim, setSelectedClaim] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [photoFile, setPhotoFile] = useState(null);

    const [tasks, setTasks] = useState([]);
    const [loadingTasks, setLoadingTasks] = useState(true);

    useEffect(() => {
        // Check online status
        setIsOnline(navigator.onLine);
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Load pending reports from localStorage
        try {
            const savedReports = localStorage.getItem('satark_pending_reports');
            if (savedReports) {
                setPendingReports(JSON.parse(savedReports));
            }
        } catch (e) {
            console.error("Failed to load reports", e);
            // If quota exceeded previously, we might need to clear or warn
            localStorage.removeItem('satark_pending_reports');
        }

        // Get location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCurrentLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => console.error("Location error:", error)
            );
        }

        // Fetch assigned tasks
        const fetchTasks = async () => {
            try {
                // Fetch claims assigned to me or all submitted claims if I'm a field worker
                // For MVP, we'll fetch all 'Submitted' claims to simulate work queue
                const res = await api.get('/claims?status=Submitted');
                const claims = res.data.data || [];

                // Map to task format
                const mappedTasks = claims.map(c => ({
                    id: c._id,
                    claimId: c.claimId || `CLM-${c._id.slice(-6).toUpperCase()}`,
                    village: c.village,
                    claimant: c.claimantName,
                    type: c.claimType
                }));
                setTasks(mappedTasks);
            } catch (error) {
                console.error("Failed to fetch tasks", error);
                toast.error("Could not load assigned tasks");
            } finally {
                setLoadingTasks(false);
            }
        };

        if (isOnline) {
            fetchTasks();
        }

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [isOnline]);

    // Helper to compress image
    const compressImage = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 800;
                    const scaleSize = MAX_WIDTH / img.width;
                    canvas.width = MAX_WIDTH;
                    canvas.height = img.height * scaleSize;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                    // Compress to JPEG with 0.7 quality
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                    resolve(dataUrl);
                };
            };
        });
    };

    const handlePhotoCapture = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhotoFile(file);
            try {
                const compressedBase64 = await compressImage(file);
                setPhotoPreview(compressedBase64);
            } catch (error) {
                console.error("Compression failed", error);
                toast.error("Failed to process image");
            }
        }
    };

    const saveReport = async () => {
        if (!selectedClaim || !photoFile) {
            toast.error("Please select a claim and take a photo");
            return;
        }

        const report = {
            id: Date.now(), // Temp ID
            claimId: selectedClaim.claimId,
            claimDbId: selectedClaim.id,
            timestamp: new Date().toISOString(),
            location: currentLocation,
            photoBase64: photoPreview, // Store base64 for offline
            syncStatus: 'Pending'
        };

        // Save to local storage
        const updatedReports = [...pendingReports, report];
        setPendingReports(updatedReports);
        localStorage.setItem('satark_pending_reports', JSON.stringify(updatedReports));

        toast.success("Report Saved Offline! Sync when online.");

        // Reset form
        setSelectedClaim(null);
        setPhotoPreview(null);
        setPhotoFile(null);
    };

    const [analysisResult, setAnalysisResult] = useState(null);

    // ... (existing code)

    const syncReports = async () => {
        if (!isOnline) {
            toast.error("No Internet Connection");
            return;
        }

        if (pendingReports.length === 0) {
            toast("No reports to sync");
            return;
        }

        setSyncing(true);
        const toastId = toast.loading("Syncing with Satark...");

        try {
            const remainingReports = [];
            let lastSuccessResult = null;

            for (const report of pendingReports) {
                try {
                    const res = await api.post(`/claims/${report.claimDbId}/verify`, {
                        verificationReport: {
                            sitePhotoBase64: report.photoBase64,
                            location: report.location,
                            timestamp: report.timestamp,
                            syncStatus: 'Synced'
                        }
                    });

                    // Capture the last successful analysis result to show the user
                    if (res.data && res.data.claim && res.data.claim.verificationReport) {
                        lastSuccessResult = res.data.claim.verificationReport;
                    }

                } catch (error) {
                    console.error("Sync failed for report:", report.id, error);
                    remainingReports.push(report);
                }
            }

            setPendingReports(remainingReports);
            localStorage.setItem('satark_pending_reports', JSON.stringify(remainingReports));

            if (remainingReports.length === 0) {
                toast.success("All reports synced successfully!", { id: toastId });
                if (lastSuccessResult) {
                    setAnalysisResult(lastSuccessResult);
                }
            } else {
                toast.error(`${remainingReports.length} reports failed to sync`, { id: toastId });
            }

        } catch (error) {
            toast.error("Sync process failed", { id: toastId });
        } finally {
            setSyncing(false);
        }
    };

    return (
        <RoleGuard allowedRoles={['Field Worker', 'Field Officer', 'Super Admin']}>
            <DashboardLayout>
                <div className="max-w-md mx-auto pb-24 min-h-[80vh] flex flex-col relative">

                    {/* ... (Header and Task List) ... */}

                    {/* Header Status */}
                    <div className={`p-4 rounded-xl mb-6 flex items-center justify-between ${isOnline ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                        <div className="flex items-center gap-2">
                            {isOnline ? <Wifi size={20} /> : <WifiOff size={20} />}
                            <span className="font-bold">{isOnline ? 'Online' : 'Offline Mode'}</span>
                        </div>
                        <div className="text-sm font-medium flex items-center gap-2">
                            <span>{pendingReports.length} Pending</span>
                            {pendingReports.length > 0 && (
                                <button
                                    onClick={() => {
                                        if (confirm("Are you sure you want to clear all pending reports? This cannot be undone.")) {
                                            setPendingReports([]);
                                            localStorage.removeItem('satark_pending_reports');
                                            toast.success("Pending reports cleared");
                                        }
                                    }}
                                    className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 transition-colors"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Task List */}
                    {!selectedClaim ? (
                        <div className="space-y-4 flex-1">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Assigned Verifications</h2>
                            {tasks.map(task => (
                                <div
                                    key={task.id}
                                    onClick={() => setSelectedClaim(task)}
                                    className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 active:scale-95 transition-transform cursor-pointer"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-bold">{task.claimId}</span>
                                        <span className="text-gray-500 text-xs">{task.type}</span>
                                    </div>
                                    <h3 className="font-bold text-lg">{task.claimant}</h3>
                                    <p className="text-gray-500 flex items-center gap-1 mt-1">
                                        <MapPin size={14} /> {task.village}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        /* Verification Form */
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg animate-in slide-in-from-bottom-4">
                            <button
                                onClick={() => setSelectedClaim(null)}
                                className="text-sm text-gray-500 mb-4 hover:underline"
                            >
                                ← Back to Tasks
                            </button>

                            <h2 className="text-xl font-bold mb-1">{selectedClaim.claimant}</h2>
                            <p className="text-gray-500 text-sm mb-6">{selectedClaim.claimId}</p>

                            {/* Location Check */}
                            <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center gap-3">
                                <MapPin className="text-blue-600" />
                                <div>
                                    <p className="text-xs text-gray-500">Current Location</p>
                                    <p className="font-mono text-sm font-bold">
                                        {currentLocation ? `${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}` : 'Fetching...'}
                                    </p>
                                </div>
                            </div>

                            {/* Camera Input */}
                            <div className="mb-6">
                                <label className="block w-full aspect-square rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors relative overflow-hidden">
                                    {photoPreview ? (
                                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <>
                                            <Camera size={48} className="text-gray-400 mb-2" />
                                            <span className="text-gray-500 font-medium">Tap to Take Photo</span>
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        capture="environment"
                                        onChange={handlePhotoCapture}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                </label>
                            </div>

                            <button
                                onClick={saveReport}
                                disabled={!photoFile}
                                className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg active:scale-95 transition-all"
                            >
                                Save Report
                            </button>
                        </div>
                    )}

                    {/* Sticky Bottom Sync Bar */}
                    {pendingReports.length > 0 && !selectedClaim && (
                        <div className="sticky bottom-6 mt-auto w-full z-50">
                            <button
                                onClick={syncReports}
                                disabled={!isOnline || syncing}
                                className={`w-full py-4 rounded-xl font-bold text-lg shadow-xl flex items-center justify-center gap-2 transition-all ${isOnline
                                    ? 'bg-green-600 text-white hover:bg-green-700'
                                    : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                    }`}
                            >
                                {syncing ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        Syncing...
                                    </>
                                ) : (
                                    <>
                                        <UploadCloud size={24} />
                                        Sync {pendingReports.length} Reports
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {/* Analysis Result Modal */}
                    {analysisResult && (
                        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 animate-in fade-in">
                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                                        <CheckCircle size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">Satark Analysis</h3>
                                        <p className="text-xs text-gray-500">AI Verification Complete</p>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <span className="text-sm font-medium">Match Score</span>
                                        <span className={`text-lg font-bold ${analysisResult.matchScore > 70 ? 'text-green-600' : 'text-red-600'}`}>
                                            {analysisResult.matchScore}%
                                        </span>
                                    </div>

                                    <div className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg max-h-40 overflow-y-auto">
                                        <p className="font-medium mb-1">Observation:</p>
                                        {analysisResult.aiAnalysis}
                                    </div>
                                </div>

                                <button
                                    onClick={() => setAnalysisResult(null)}
                                    className="w-full py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold"
                                >
                                    Dismiss
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </DashboardLayout>
        </RoleGuard>
    );
}
