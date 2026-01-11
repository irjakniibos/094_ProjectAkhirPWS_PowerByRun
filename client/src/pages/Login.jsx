import { Link } from "react-router-dom";
import { getStravaAuthUrl } from "../services/api";
import { FiActivity, FiAward, FiTrendingUp, FiLock } from "react-icons/fi";
import "./Login.css";

function Login() {
    const handleLogin = () => {
        window.location.href = getStravaAuthUrl();
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <span className="login-logo">
                        <img src="/icons/powerbyrun.png" alt="POWERBYRUN" />
                    </span>
                    <h1><span className="power">POWER</span><span className="by">BY</span><span className="run">RUN</span></h1>
                    <p>Track your running performance with detailed analytics</p>
                </div>

                <div className="features">
                    <div className="feature">
                        <span className="feature-icon"><FiActivity /></span>
                        <div>
                            <h3>Activity Tracking</h3>
                            <p>View all your running activities in one place</p>
                        </div>
                    </div>
                    <div className="feature">
                        <span className="feature-icon"><FiAward /></span>
                        <div>
                            <h3>Personal Bests</h3>
                            <p>Track your PBs for 1K, 5K, 10K, Half & Full Marathon</p>
                        </div>
                    </div>
                    <div className="feature">
                        <span className="feature-icon"><FiTrendingUp /></span>
                        <div>
                            <h3>Statistics</h3>
                            <p>Get insights on your running performance</p>
                        </div>
                    </div>
                </div>

                <button className="strava-btn" onClick={handleLogin}>
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                        <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
                    </svg>
                    Connect with Strava
                </button>

                <p className="login-note">
                    We only read your activity data and never post on your behalf.
                </p>

                <div className="admin-link">
                    <Link to="/admin/login">
                        <FiLock style={{ marginRight: "6px" }} />
                        Admin Login
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Login;
