import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
    FiUsers,
    FiActivity,
    FiTrendingUp,
    FiAward,
    FiLogOut,
    FiUser,
    FiShield,
    FiEye
} from "react-icons/fi";
import "./AdminDashboard.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function AdminDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
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
    }, [navigate]);

    const fetchData = async (token) => {
        try {
            const headers = { Authorization: `Bearer ${token}` };

            const [statsRes, usersRes] = await Promise.all([
                fetch(`${API_URL}/admin/dashboard`, { headers }),
                fetch(`${API_URL}/admin/users`, { headers }),
            ]);

            if (!statsRes.ok || !usersRes.ok) {
                throw new Error("Failed to fetch data");
            }

            const statsData = await statsRes.json();
            const usersData = await usersRes.json();

            setStats(statsData);
            setUsers(usersData);
        } catch (err) {
            console.error(err);
            localStorage.removeItem("adminToken");
            navigate("/admin/login");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminInfo");
        navigate("/admin/login");
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading admin dashboard...</p>
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
                    <button onClick={handleLogout} className="logout-btn">
                        <FiLogOut /> Logout
                    </button>
                </div>
            </nav>

            <div className="admin-container">
                <h1>Dashboard Overview</h1>

                <div className="admin-stats-grid">
                    <div className="admin-stat-card">
                        <span className="stat-icon"><FiUsers /></span>
                        <div>
                            <span className="stat-value">{stats?.totalUsers || 0}</span>
                            <span className="stat-label">Total Users</span>
                        </div>
                    </div>
                    <div className="admin-stat-card">
                        <span className="stat-icon"><FiActivity /></span>
                        <div>
                            <span className="stat-value">{stats?.totalLogs || 0}</span>
                            <span className="stat-label">Total Activities</span>
                        </div>
                    </div>
                </div>

                <section className="admin-section">
                    <h2><FiUsers className="section-icon" /> Registered Users</h2>
                    <div className="users-table-container">
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Strava ID</th>
                                    <th>Location</th>
                                    <th>Joined</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id}>
                                        <td>{user.id}</td>
                                        <td>{user.name}</td>
                                        <td>{user.strava_id}</td>
                                        <td>{user.city}, {user.country}</td>
                                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <Link to={`/admin/user-logs/${user.id}`} className="view-logs-btn">
                                                <FiEye /> View Logs
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="no-data">No users yet</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="admin-section">
                    <h2><FiTrendingUp className="section-icon" /> Recent Activity</h2>
                    <div className="recent-logs">
                        {stats?.recentLogs?.map((log, i) => (
                            <div key={i} className="log-item">
                                <span className="log-action">{log.action}</span>
                                <span className="log-user">{log.user_name || `User #${log.user_id}`}</span>
                                <span className="log-time">
                                    {new Date(log.createdAt).toLocaleString()}
                                </span>
                            </div>
                        ))}
                        {(!stats?.recentLogs || stats.recentLogs.length === 0) && (
                            <p className="no-data">No recent activity</p>
                        )}
                    </div>
                </section>

                <section className="admin-section">
                    <h2><FiAward className="section-icon" /> Most Active Users</h2>
                    <div className="active-users">
                        {stats?.activeUsers?.map((user, i) => (
                            <div key={i} className="active-user-item">
                                <span className="rank">#{i + 1}</span>
                                <span className="user-name">{user.user_name || `User #${user.user_id}`}</span>
                                <span className="activity-count">{user.activity_count} activities</span>
                            </div>
                        ))}
                        {(!stats?.activeUsers || stats.activeUsers.length === 0) && (
                            <p className="no-data">No active users yet</p>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}

export default AdminDashboard;
