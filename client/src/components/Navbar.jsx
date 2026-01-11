import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiHome, FiUser, FiActivity, FiAward, FiLogOut } from "react-icons/fi";
import "./Navbar.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function Navbar({ userName }) {
    const location = useLocation();
    const navigate = useNavigate();
    const userId = new URLSearchParams(location.search).get("userId") ||
        localStorage.getItem("userId");

    const navLinks = [
        { path: "/dashboard", label: "Dashboard", icon: <FiHome /> },
        { path: "/profile", label: "Profile", icon: <FiUser /> },
        { path: "/activities", label: "Activities", icon: <FiActivity /> },
        { path: "/personal-best", label: "Personal Best", icon: <FiAward /> },
    ];

    const handleLogout = async () => {
        try {
            // Call logout API to log the action
            if (userId) {
                await fetch(`${API_URL}/auth/logout/${userId}`, {
                    method: "POST",
                });
            }
        } catch (error) {
            console.error("Logout logging failed:", error);
        } finally {
            // Always redirect to login page
            localStorage.removeItem("userId");
            navigate("/");
        }
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <img src="/icons/powerbyrun.png" alt="POWERBYRUN" className="brand-logo" />
                <span className="brand-name"><span className="power">POWER</span><span className="by">BY</span><span className="run">RUN</span></span>
            </div>

            <ul className="navbar-links">
                {navLinks.map((link) => (
                    <li key={link.path}>
                        <Link
                            to={`${link.path}?userId=${userId}`}
                            className={location.pathname === link.path ? "active" : ""}
                        >
                            <span className="nav-icon">{link.icon}</span>
                            {link.label}
                        </Link>
                    </li>
                ))}
            </ul>

            <div className="navbar-user">
                {userName && <span className="user-name">{userName}</span>}
                <button onClick={handleLogout} className="logout-btn">
                    <FiLogOut style={{ marginRight: "4px" }} />
                    Logout
                </button>
            </div>
        </nav>
    );
}

export default Navbar;
