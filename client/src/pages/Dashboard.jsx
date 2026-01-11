import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import WeeklyChart from "../components/WeeklyChart";
import { getUser, getActivityStats, syncActivities } from "../services/api";
import {
    FiActivity,
    FiMapPin,
    FiTrendingUp,
    FiClock,
    FiRefreshCw,
    FiList,
    FiAward,
    FiUser
} from "react-icons/fi";
import "./Dashboard.css";

function Dashboard() {
    const [searchParams] = useSearchParams();
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [error, setError] = useState(null);

    const userId = searchParams.get("userId") || localStorage.getItem("userId");

    useEffect(() => {
        if (userId) {
            localStorage.setItem("userId", userId);
            fetchData();
        }
    }, [userId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [userRes, statsRes] = await Promise.all([
                getUser(userId),
                getActivityStats(userId),
            ]);
            setUser(userRes.data);
            setStats(statsRes.data);
        } catch (err) {
            setError("Failed to load data");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async () => {
        try {
            setSyncing(true);
            const res = await syncActivities(userId);
            alert(`Sync completed! ${res.data.synced} activities synced.`);
            fetchData();
        } catch (err) {
            if (err.response?.status === 401) {
                alert("Session expired. Please login again.");
                window.location.href = "/";
            } else {
                alert("Sync failed. Please try again.");
            }
        } finally {
            setSyncing(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <p>{error}</p>
                <a href="/">Back to Login</a>
            </div>
        );
    }

    return (
        <div className="dashboard-layout">
            <Navbar userName={user?.name} />

            <div className="dashboard-container">
                <header className="dashboard-header">
                    <div>
                        <h1>Welcome back, {user?.name?.split(" ")[0]}!</h1>
                        <p>Here's an overview of your running performance</p>
                    </div>
                    <button
                        className="sync-btn"
                        onClick={handleSync}
                        disabled={syncing}
                    >
                        <FiRefreshCw className={syncing ? "spinning" : ""} />
                        {syncing ? "Syncing..." : "Sync Activities"}
                    </button>
                </header>

                {/* Weekly Progress Chart */}
                <WeeklyChart userId={userId} />

                <div className="stats-grid">
                    <div className="stat-card total-runs">
                        <div className="stat-icon">
                            <FiActivity />
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{stats?.totalActivities || 0}</span>
                            <span className="stat-label">Total Runs</span>
                        </div>
                    </div>

                    <div className="stat-card total-distance">
                        <div className="stat-icon">
                            <FiMapPin />
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{stats?.totalDistanceKm || "0"}</span>
                            <span className="stat-label">Total KM</span>
                        </div>
                    </div>

                    <div className="stat-card avg-distance">
                        <div className="stat-icon">
                            <FiTrendingUp />
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{stats?.averageDistanceKm || "0"}</span>
                            <span className="stat-label">Avg Distance (km)</span>
                        </div>
                    </div>

                    <div className="stat-card avg-pace">
                        <div className="stat-icon">
                            <FiClock />
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{stats?.averagePaceFormatted || "0:00"}</span>
                            <span className="stat-label">Avg Pace /km</span>
                        </div>
                    </div>
                </div>

                <div className="quick-actions">
                    <h2>Quick Actions</h2>
                    <div className="actions-grid">
                        <a href={`/activities?userId=${userId}`} className="action-card">
                            <span className="action-icon"><FiList /></span>
                            <span>View All Activities</span>
                        </a>
                        <a href={`/personal-best?userId=${userId}`} className="action-card">
                            <span className="action-icon"><FiAward /></span>
                            <span>Personal Bests</span>
                        </a>
                        <a href={`/profile?userId=${userId}`} className="action-card">
                            <span className="action-icon"><FiUser /></span>
                            <span>View Profile</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
