import { useState, useEffect } from "react";
import { FiX, FiClock, FiTrendingUp, FiHeart } from "react-icons/fi";
import "./SplitsModal.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function SplitsModal({ activityId, activityName, onClose }) {
    const [splits, setSplits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchSplits();
    }, [activityId]);

    const fetchSplits = async () => {
        try {
            const res = await fetch(`${API_URL}/api/activities/splits/${activityId}`);
            if (!res.ok) throw new Error("Failed to fetch splits");
            const data = await res.json();
            setSplits(data.splits || []);
        } catch (err) {
            console.error(err);
            setError("Could not load splits data");
        } finally {
            setLoading(false);
        }
    };

    const formatPace = (seconds) => {
        if (!seconds) return "-:--";
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    // Find fastest pace for bar width calculation
    const fastestPace = splits.length > 0
        ? Math.min(...splits.map(s => s.pace_seconds || Infinity))
        : 1;
    const slowestPace = splits.length > 0
        ? Math.max(...splits.map(s => s.pace_seconds || 0))
        : 1;

    const getBarWidth = (paceSeconds) => {
        if (!paceSeconds || !fastestPace) return 50;
        // Invert: fastest pace = longest bar
        const range = slowestPace - fastestPace;
        if (range === 0) return 80;
        const normalized = (slowestPace - paceSeconds) / range;
        return 30 + (normalized * 70); // 30% to 100%
    };

    return (
        <div className="splits-modal-overlay" onClick={onClose}>
            <div className="splits-modal" onClick={(e) => e.stopPropagation()}>
                <div className="splits-modal-header">
                    <h2>Splits</h2>
                    <p className="activity-title">{activityName || "Activity"}</p>
                    <button className="close-btn" onClick={onClose}>
                        <FiX />
                    </button>
                </div>

                <div className="splits-modal-content">
                    {loading ? (
                        <div className="splits-loading">
                            <div className="spinner"></div>
                            <p>Loading splits...</p>
                        </div>
                    ) : error ? (
                        <p className="splits-error">{error}</p>
                    ) : splits.length === 0 ? (
                        <p className="splits-empty">No splits data available. Try syncing this activity again.</p>
                    ) : (
                        <>
                            <div className="splits-header-row">
                                <span className="col-km">Km</span>
                                <span className="col-pace">Pace</span>
                                <span className="col-bar"></span>
                                <span className="col-elev"><FiTrendingUp /></span>
                                <span className="col-hr"><FiHeart /></span>
                            </div>
                            <div className="splits-list">
                                {splits.map((split) => (
                                    <div key={split.split_number} className="split-row">
                                        <span className="col-km">{split.split_number}</span>
                                        <span className="col-pace">{formatPace(split.pace_seconds)}</span>
                                        <span className="col-bar">
                                            <div
                                                className="pace-bar"
                                                style={{ width: `${getBarWidth(split.pace_seconds)}%` }}
                                            ></div>
                                        </span>
                                        <span className="col-elev">
                                            {split.elevation_difference != null
                                                ? (split.elevation_difference > 0 ? '+' : '') + Math.round(split.elevation_difference)
                                                : '-'}
                                        </span>
                                        <span className="col-hr">
                                            {split.average_heartrate
                                                ? Math.round(split.average_heartrate)
                                                : '-'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default SplitsModal;
