import { useEffect, useState } from 'react';
import api from '../../lib/api';

export default function ConflictWarning({ claimId, geojson }) {
    const [conflicts, setConflicts] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (geojson) {
            checkConflicts();
        }
    }, [geojson]);

    const checkConflicts = async () => {
        try {
            setLoading(true);
            // Call conflict detection endpoint
            const response = await api.post('/claims/check-conflicts', { geojson });
            setConflicts(response.data);
        } catch (error) {
            console.error('Conflict check failed:', error);
            setConflicts(null);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-muted rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-border rounded w-1/3"></div>
            </div>
        );
    }

    if (!conflicts || conflicts.conflicts?.length === 0) {
        return (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center gap-2">
                    <span className="text-green-600 text-xl">✅</span>
                    <div>
                        <h4 className="font-semibold text-green-900 dark:text-green-400">No Conflicts Detected</h4>
                        <p className="text-sm text-green-700 dark:text-green-300">
                            This claim boundary does not overlap with existing claims
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'critical': return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
            case 'major': return 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800';
            case 'minor': return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800';
            default: return 'bg-gray-50 border-gray-200';
        }
    };

    const getSeverityIcon = (severity) => {
        switch (severity) {
            case 'critical': return '🚨';
            case 'major': return '⚠️';
            case 'minor': return '⚡';
            default: return 'ℹ️';
        }
    };

    return (
        <div className={`border rounded-lg p-4 ${getSeverityColor(conflicts.severity)}`}>
            <div className="flex items-start gap-3">
                <span className="text-2xl">{getSeverityIcon(conflicts.severity)}</span>
                <div className="flex-1">
                    <h4 className="font-semibold text-foreground mb-2">
                        {conflicts.severity === 'critical' ? 'Critical Conflict Detected' :
                            conflicts.severity === 'major' ? 'Major Overlap Detected' :
                                'Minor Overlap Detected'}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3">
                        {conflicts.message || `This claim overlaps with ${conflicts.conflicts.length} existing claim(s)`}
                    </p>

                    {/* Conflicting Claims List */}
                    <div className="space-y-2">
                        {conflicts.conflicts.slice(0, 3).map((conflict, idx) => (
                            <div key={idx} className="bg-card border border-border rounded p-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-foreground">
                                        Claim #{conflict.claimId?.slice(-6) || 'Unknown'}
                                    </span>
                                    <span className="text-xs px-2 py-1 bg-muted rounded">
                                        {conflict.overlapPercentage?.toFixed(1)}% overlap
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Status: {conflict.status || 'Unknown'}
                                </p>
                            </div>
                        ))}
                    </div>

                    {conflicts.conflicts.length > 3 && (
                        <p className="text-xs text-muted-foreground mt-2">
                            + {conflicts.conflicts.length - 3} more conflicts
                        </p>
                    )}

                    {!conflicts.allowed && (
                        <div className="mt-3 p-2 bg-red-100 dark:bg-red-900/30 rounded">
                            <p className="text-sm font-medium text-red-900 dark:text-red-400">
                                ⛔ This claim cannot proceed due to critical conflicts
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
