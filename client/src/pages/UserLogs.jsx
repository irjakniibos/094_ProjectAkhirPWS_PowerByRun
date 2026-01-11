import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
    FiArrowLeft,
    FiUser,
    FiClock,
    FiActivity,
    FiLogIn,
    FiRefreshCw,
    FiShield
} from "react-icons/fi";
import "./AdminDashboard.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function UserLogs() {
    const navigate = useNavigate();
    const { userId } = useParams();
    const [logs, setLogs] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [adminInfo, setAdminInfo] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("adminToken");
        const info = localStorage.getItem("adminInfo");

        if (!token) {
            navigate("/admin/login");
            return;
        }

        if (info) {
            setAdminInfo(JSON.parse(info));
        }

        fetchData(token);
    }, [navigate, userId]);

    const fetchData = async (token) => {
        try {
            const headers = { Authorization: `Bearer ${token}` };

            // Fetch user logs
            const logsRes = await fetch(`${API_URL}/admin/logs/${userId}`, { headers });
            if (!logsRes.ok) throw new Error("Failed to fetch logs");
            const logsData = await logsRes.json();
            setLogs(logsData);

            // Fetch user info
            const usersRes = await fetch(`${API_URL}/admin/users`, { headers });
            if (usersRes.ok) {
                const usersData = await usersRes.json();
                const foundUser = usersData.find(u => u.id === parseInt(userId));
                setUser(foundUser);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        const token = localStorage.getItem("adminToken");
        if (token) {
            setRefreshing(true);
            fetchData(token);
        }
    };

    const getActionIcon = (action) => {
        switch (action?.toLowerCase()) {
            case "login":
                return <FiLogIn />;
            case "sync":
                return <FiRefreshCw />;
            default:
                return <FiActivity />;
        }
    };

    const getActionColor = (action) => {
        switch (action?.toLowerCase()) {
            case "login":
                return "action-login";
            case "sync":
                return "action-sync";
            case "logout":
                return "action-logout";
            default:
                return "action-default";
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading user logs...</p>
            </div>
        );
    }

    return (
        <div className="admin-layout">
            <nav className="admin-navbar">
                <div className="admin-brand">
                    <img src="/icons/powerbyrun.png" alt="POWERBYRUN" className="brand-logo" />
                    <span className="admin-brand-name"><span className="power">POWER</span><span className="by">BY</span><span className="run">RUN</span> Admin</span>
                </div>
                <div className="admin-nav-right">
                    <span className="admin-name"><FiUser /> {adminInfo?.username}</span>
                </div>
            </nav>

            <div className="admin-container">
                <div className="user-logs-header">
                    <Link to="/admin/dashboard" className="back-btn">
                        <FiArrowLeft /> Back to Dashboard
                    </Link>
                    <h1>
                        <FiUser className="header-icon" />
                        {user?.name || `User #${userId}`} - Activity Logs
                    </h1>
                    {user && (
                        <p className="user-info-subtitle">
                            Location: {user.city || "Unknown"}, {user.country || "Unknown"} |
                            Joined: {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                    )}
                </div>

                <section className="admin-section">
                    <div className="section-header-row">
                        <h2><FiClock className="section-icon" /> Log History ({logs.length} entries)</h2>
                        <button
                            onClick={handleRefresh}
                            className={`refresh-logs-btn ${refreshing ? 'spinning' : ''}`}
                            disabled={refreshing}
                        >
                            <FiRefreshCw /> {refreshing ? 'Refreshing...' : 'Refresh'}
                        </button>
                    </div>

                    {logs.length > 0 ? (
                        <div className="logs-list">
                            {logs.map((log, i) => (
                                <div key={i} className="log-entry">
                                    <span className={`log-action-badge ${getActionColor(log.action)}`}>
                                        {getActionIcon(log.action)}
                                        {log.action}
                                    </span>
                                    <span className="log-details">
                                        {log.details || "No details"}
                                    </span>
                                    <span className="log-timestamp">
                                        <FiClock />
                                        {new Date(log.createdAt).toLocaleString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="no-data">No logs found for this user</p>
                    )}
                </section>
            </div>
        </div>
    );
}

export default UserLogs;
