import { useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../lib/api';
import { MapPin, Camera, CheckCircle, X, Navigation } from 'lucide-react';

export default function FieldVisitMode({ claim, onClose, onUpdate }) {
    const [location, setLocation] = useState(null);
    const [photo, setPhoto] = useState(null);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCaptureGPS = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser');
            return;
        }

        toast.loading('Acquiring GPS signal...', { id: 'gps' });
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy
                });
                toast.success('GPS Location Captured!', { id: 'gps' });
            },
            (error) => {
                toast.error('Failed to get location: ' + error.message, { id: 'gps' });
            }
        );
    };

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhoto(file);
            toast.success('Photo selected');
        }
    };

    const handleSubmit = async () => {
        if (!location || !notes) {
            toast.error('Please capture GPS and add notes');
            return;
        }

        setLoading(true);
        try {
            // In a real app, we would upload the photo to a storage bucket
            // and save the URL. For now, we'll just save the metadata.

            const visitData = {
                type: 'Field Visit',
                location,
                notes,
                timestamp: new Date().toISOString()
            };

            await api.put(`/claims/${claim._id}`, {
                verificationNotes: `${claim.verificationNotes || ''}\n\n[FIELD VISIT REPORT]\nGPS: ${location.lat}, ${location.lng}\nNotes: ${notes}`
            });

            toast.success('Field Visit Report Submitted');
            onUpdate();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error('Failed to submit report');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-xl overflow-hidden flex flex-col max-h-[90vh] shadow-2xl border border-slate-200 dark:border-slate-800">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-primary text-white">
                    <div className="flex items-center gap-2">
                        <Navigation className="w-5 h-5" />
                        <h2 className="font-bold text-lg">Field Visit Mode</h2>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-6 flex-1">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">1. Capture Location</label>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-center">
                            {location ? (
                                <div className="text-green-600 dark:text-green-400 flex flex-col items-center gap-2">
                                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                                        <MapPin className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="font-mono text-sm font-bold">{location.lat.toFixed(6)}, {location.lng.toFixed(6)}</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">Accuracy: {location.accuracy}m</div>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={handleCaptureGPS}
                                    className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
                                >
                                    <MapPin className="w-5 h-5" />
                                    Capture GPS Coordinates
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">2. Site Photo</label>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-center">
                            <input
                                type="file"
                                accept="image/*"
                                capture="environment"
                                onChange={handlePhotoUpload}
                                className="hidden"
                                id="site-photo"
                            />
                            <label
                                htmlFor="site-photo"
                                className="w-full py-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-lg font-medium cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-2 shadow-sm"
                            >
                                <Camera className="w-5 h-5" />
                                {photo ? 'Retake Photo' : 'Take Photo'}
                            </label>
                            {photo && <div className="mt-2 text-sm text-green-600 dark:text-green-400 font-medium">Selected: {photo.name}</div>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">3. Observations</label>
                        <textarea
                            className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white min-h-[100px] focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                            placeholder="Describe the land boundaries, crops, and any disputes..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                </div>

                <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full py-3 bg-green-600 text-white rounded-xl font-bold text-lg hover:bg-green-700 transition-colors disabled:opacity-50 shadow-lg flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <CheckCircle className="w-6 h-6" />
                                Submit Report
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
