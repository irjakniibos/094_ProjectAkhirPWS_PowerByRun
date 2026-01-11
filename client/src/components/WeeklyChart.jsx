import { useState, useEffect } from "react";
import { FiMapPin, FiClock, FiTrendingUp } from "react-icons/fi";
import "./WeeklyChart.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function WeeklyChart({ userId }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userId) fetchWeeklyStats();
    }, [userId]);

    const fetchWeeklyStats = async () => {
        try {
            const res = await fetch(`${API_URL}/api/activities/${userId}/weekly`);
            if (!res.ok) throw new Error("Failed to fetch");
            const result = await res.json();
            setData(result);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds) => {
        if (!seconds) return "0m";
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        if (hrs > 0) return `${hrs}h ${mins}m`;
        return `${mins}m`;
    };

    if (loading) {
        return (
            <div className="weekly-chart-container loading">
                <div className="spinner-small"></div>
            </div>
        );
    }

    if (!data) return null;

    const { thisWeek, weeklyData } = data;

    // Calculate max for chart scaling
    const distances = weeklyData.map(w => parseFloat(w.distanceKm));
    const maxDistance = Math.max(...distances, 1);

    // Get unique months for labels
    const getMonthLabels = () => {
        const labels = [];
        let lastMonth = '';
        weeklyData.forEach((week, index) => {
            if (week.month !== lastMonth) {
                labels.push({ index, month: week.month });
                lastMonth = week.month;
            }
        });
        return labels;
    };

    return (
        <div className="weekly-chart-container">
            <h3 className="weekly-title">This Week</h3>

            <div className="weekly-summary">
                <div className="summary-stat">
                    <span className="stat-label">Distance</span>
                    <span className="stat-value-large">
                        {parseFloat(thisWeek.distanceKm).toFixed(2)} <span className="unit">km</span>
                    </span>
                </div>
                <div className="summary-stat">
                    <span className="stat-label">Time</span>
                    <span className="stat-value-large">{formatTime(thisWeek.time)}</span>
                </div>
                <div className="summary-stat">
                    <span className="stat-label">Elev Gain</span>
                    <span className="stat-value-large">
                        {Math.round(thisWeek.elevation)} <span className="unit">m</span>
                    </span>
                </div>
            </div>

            <div className="chart-section">
                <p className="chart-title">Past 12 weeks</p>

                <div className="chart-wrapper">
                    {/* Y-axis labels */}
                    <div className="y-axis">
                        <span>{Math.round(maxDistance)} km</span>
                        <span>{Math.round(maxDistance / 2)} km</span>
                        <span>0 km</span>
                    </div>

                    {/* Chart area */}
                    <div className="chart-area">
                        {/* Grid lines */}
                        <div className="grid-line" style={{ bottom: '100%' }}></div>
                        <div className="grid-line" style={{ bottom: '50%' }}></div>
                        <div className="grid-line" style={{ bottom: '0%' }}></div>

                        {/* Area fill */}
                        <svg className="chart-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#fc4c02" stopOpacity="0.6" />
                                    <stop offset="100%" stopColor="#fc4c02" stopOpacity="0.1" />
                                </linearGradient>
                            </defs>

                            {/* Area polygon */}
                            <polygon
                                fill="url(#areaGradient)"
                                points={`
                                    0,100 
                                    ${weeklyData.map((w, i) =>
                                    `${(i / (weeklyData.length - 1)) * 100},${100 - (parseFloat(w.distanceKm) / maxDistance) * 100}`
                                ).join(' ')} 
                                    100,100
                                `}
                            />

                            {/* Line */}
                            <polyline
                                fill="none"
                                stroke="#fc4c02"
                                strokeWidth="2"
                                vectorEffect="non-scaling-stroke"
                                points={weeklyData.map((w, i) =>
                                    `${(i / (weeklyData.length - 1)) * 100},${100 - (parseFloat(w.distanceKm) / maxDistance) * 100}`
                                ).join(' ')}
                            />
                        </svg>

                        {/* Data points */}
                        <div className="data-points">
                            {weeklyData.map((week, index) => {
                                const x = (index / (weeklyData.length - 1)) * 100;
                                const y = 100 - (parseFloat(week.distanceKm) / maxDistance) * 100;
                                const isLastPoint = index === weeklyData.length - 1;

                                return (
                                    <div
                                        key={index}
                                        className={`data-point ${isLastPoint ? 'current' : ''}`}
                                        style={{ left: `${x}%`, bottom: `${100 - y}%` }}
                                    >
                                        <span className="point-tooltip">
                                            {week.weekLabel}<br />
                                            <strong>{parseFloat(week.distanceKm).toFixed(1)} km</strong>
                                        </span>
                                        {isLastPoint && (
                                            <span className="point-label">{parseFloat(week.distanceKm).toFixed(0)} km</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* X-axis month labels */}
                <div className="x-axis">
                    {getMonthLabels().map((label, i) => (
                        <span
                            key={i}
                            style={{ left: `${(label.index / (weeklyData.length - 1)) * 100}%` }}
                        >
                            {label.month}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default WeeklyChart;
