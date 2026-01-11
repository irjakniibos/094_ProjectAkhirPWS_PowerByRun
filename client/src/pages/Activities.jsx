import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import SplitsModal from "../components/SplitsModal";
import { getActivities, getUser } from "../services/api";
import {
    FiActivity,
    FiMapPin,
    FiClock,
    FiZap,
    FiExternalLink,
    FiInbox,
    FiHeart,
    FiTrendingUp,
    FiBarChart2
} from "react-icons/fi";
import { GiRunningShoe, GiFlame, GiMountainClimbing } from "react-icons/gi";
import "./Activities.css";

function Activities() {
    const [searchParams] = useSearchParams();
    const [user, setUser] = useState(null);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedActivity, setSelectedActivity] = useState(null);

    const userId = searchParams.get("userId") || localStorage.getItem("userId");

    useEffect(() => {
        if (userId) {
            fetchData();
        }
    }, [userId]);

    const fetchData = async () => {
        try {
            const [userRes, activitiesRes] = await Promise.all([
                getUser(userId),
                getActivities(userId, { limit: 100 }),
            ]);
            setUser(userRes.data);
            setActivities(activitiesRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        if (hrs > 0) {
            return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
        }
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const formatPace = (distance, time) => {
        if (!distance || !time) return "0:00";
        const paceMin = time / 60 / (distance / 1000);
        const mins = Math.floor(paceMin);
        const secs = Math.round((paceMin - mins) * 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString("id-ID", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading activities...</p>
            </div>
        );
    }

    return (
        <div className="activities-layout">
            <Navbar userName={user?.name} />

            <div className="activities-container">
                <header className="activities-header">
                    <h1><FiActivity className="header-icon" /> Running Activities</h1>
                    <p>{activities.length} activities found</p>
                </header>

                {activities.length === 0 ? (
                    <div className="no-activities">
                        <span className="no-activities-icon"><FiInbox /></span>
                        <h2>No activities yet</h2>
                        <p>Sync your activities from the dashboard to see them here.</p>
                        <a href={`/dashboard?userId=${userId}`} className="back-btn">
                            Go to Dashboard
                        </a>
                    </div>
                ) : (
                    <div className="activities-list">
                        {activities.map((activity) => (
                            <div key={activity.id} className="activity-card">
                                <div className="activity-header">
                                    <div className="activity-title-section">
                                        <div className="activity-name">
                                            {activity.name || "Running"}
                                        </div>
                                        <div className="activity-date">
                                            {formatDate(activity.start_date)}
                                        </div>
                                    </div>
                                    <div className="activity-actions">
                                        <button
                                            onClick={() => setSelectedActivity(activity)}
                                            className="view-splits-btn"
                                            title="View Splits"
                                        >
                                            <FiBarChart2 />
                                        </button>
                                        <a
                                            href={`https://www.strava.com/activities/${activity.strava_activity_id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="view-strava"
                                            title="View on Strava"
                                        >
                                            <FiExternalLink />
                                        </a>
                                    </div>
                                </div>

                                <div className="activity-stats">
                                    {/* Distance */}
                                    <div className="activity-stat">
                                        <span className="stat-icon"><FiMapPin /></span>
                                        <div>
                                            <span className="stat-value">
                                                {(activity.distance / 1000).toFixed(2)}
                                            </span>
                                            <span className="stat-unit">km</span>
                                        </div>
                                    </div>

                                    {/* Time */}
                                    <div className="activity-stat">
                                        <span className="stat-icon"><FiClock /></span>
                                        <div>
                                            <span className="stat-value">
                                                {formatTime(activity.moving_time)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Pace */}
                                    <div className="activity-stat">
                                        <span className="stat-icon"><FiZap /></span>
                                        <div>
                                            <span className="stat-value">
                                                {formatPace(activity.distance, activity.moving_time)}
                                            </span>
                                            <span className="stat-unit">/km</span>
                                        </div>
                                    </div>

                                    {/* Average Heart Rate */}
                                    {activity.average_heartrate && (
                                        <div className="activity-stat hr">
                                            <span className="stat-icon"><FiHeart /></span>
                                            <div>
                                                <span className="stat-value">
                                                    {Math.round(activity.average_heartrate)}
                                                </span>
                                                <span className="stat-unit">bpm</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Max Heart Rate */}
                                    {activity.max_heartrate && (
                                        <div className="activity-stat hr-max">
                                            <span className="stat-icon"><FiTrendingUp /></span>
                                            <div>
                                                <span className="stat-value">
                                                    {Math.round(activity.max_heartrate)}
                                                </span>
                                                <span className="stat-unit">max</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Elevation Gain */}
                                    {activity.total_elevation_gain > 0 && (
                                        <div className="activity-stat elevation">
                                            <span className="stat-icon"><GiMountainClimbing /></span>
                                            <div>
                                                <span className="stat-value">
                                                    {Math.round(activity.total_elevation_gain)}
                                                </span>
                                                <span className="stat-unit">m</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Cadence */}
                                    {activity.average_cadence && (
                                        <div className="activity-stat cadence">
                                            <span className="stat-icon"><GiRunningShoe /></span>
                                            <div>
                                                <span className="stat-value">
                                                    {Math.round(activity.average_cadence * 2)}
                                                </span>
                                                <span className="stat-unit">spm</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Calories */}
                                    {activity.calories && (
                                        <div className="activity-stat calories">
                                            <span className="stat-icon"><GiFlame /></span>
                                            <div>
                                                <span className="stat-value">
                                                    {Math.round(activity.calories)}
                                                </span>
                                                <span className="stat-unit">kcal</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Splits Modal */}
            {selectedActivity && (
                <SplitsModal
                    activityId={selectedActivity.id}
                    activityName={selectedActivity.name}
                    onClose={() => setSelectedActivity(null)}
                />
            )}
        </div>
    );
}

export default Activities;
