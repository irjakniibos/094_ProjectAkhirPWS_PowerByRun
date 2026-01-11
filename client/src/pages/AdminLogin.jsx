import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiLock, FiUser, FiLogIn, FiArrowLeft, FiUserPlus } from "react-icons/fi";
import "./AdminLogin.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function AdminLogin() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/admin/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Login failed");
            }

            // Save token and admin info
            localStorage.setItem("adminToken", data.token);
            localStorage.setItem("adminInfo", JSON.stringify(data.admin));

            navigate("/admin/dashboard");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-container">
            <div className="admin-login-card">
                <div className="admin-login-header">
                    <span className="admin-icon">
                        <img src="/icons/powerbyrun.png" alt="POWERBYRUN" />
                    </span>
                    <h1><span className="power">POWER</span><span className="by">BY</span><span className="run">RUN</span> Admin</h1>
                    <p>Enter your credentials to access admin dashboard</p>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">
                            <FiUser className="input-icon" />
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Enter username"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">
                            <FiLock className="input-icon" />
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter password"
                            required
                        />
                    </div>

                    <button type="submit" className="submit-btn" disabled={loading}>
                        <FiLogIn />
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                <div className="admin-login-footer">
                    <p>Don't have an account? <Link to="/admin/register"><FiUserPlus className="link-icon" /> Register</Link></p>
                    <Link to="/" className="back-link"><FiArrowLeft /> Back to User Login</Link>
                </div>
            </div>
        </div>
    );
}

export default AdminLogin;
