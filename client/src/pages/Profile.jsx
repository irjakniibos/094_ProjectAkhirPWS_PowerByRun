import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getUser } from "../services/api";
import { FiUser, FiMapPin, FiHash, FiCalendar, FiExternalLink, FiRefreshCw } from "react-icons/fi";
import "./Profile.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function Profile() {
    const [searchParams] = useSearchParams();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);

    const userId = searchParams.get("userId") || localStorage.getItem("userId");

    useEffect(() => {
        if (userId) {
            fetchUser();
        }
    }, [userId]);

    const fetchUser = async () => {
        try {
            const res = await getUser(userId);
            setUser(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRefreshPhoto = async () => {
        try {
            setSyncing(true);
            await fetch(`${API_URL}/api/auth/sync-profile/${userId}`, { method: 'POST' });
            await fetchUser();
        } catch (err) {
            console.error("Sync error:", err);
        } finally {
            setSyncing(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading profile...</p>
            </div>
        );
    }

    // Get profile picture - use from database or placeholder
    const profilePic = user?.profile_picture;
    
    // Get badge icon URL based on badge_type_id
    const getBadgeIconUrl = () => {
        if (!user?.badge_type_id) return null;
        // Strava badge URLs (from Strava CDN)
        if (user.badge_type_id === 1) {
            return 'https://d3nn82uaxijpm6.cloudfront.net/assets/badge-summit-3f2f7e2e8dacc6797d3254633d95948c.svg';
        }
        if (user.badge_type_id === 2) {
            return 'https://d3nn82uaxijpm6.cloudfront.net/assets/badge-pro-4e42d9b7e2e406a66b39ef41d21a29e5.svg';
        }
        return null;
    };

    const badgeIconUrl = getBadgeIconUrl();

    return (
        <div className="profile-layout">
            <Navbar userName={user?.name} />

            <div className="profile-container">
                <div className="profile-card">
                    {/* Profile Photo */}
                    <div className="profile-photo-container">
                        {profilePic ? (
                            <img
                                src={profilePic}
                                alt={user?.name || "Profile"}
                                className="profile-photo"
                            />
                        ) : (
                            <div className="profile-placeholder">
                                <FiUser />
                            </div>
                        )}
                        {badgeIconUrl && (
                            <div className="badge-icon">
                                <img src={badgeIconUrl} alt="Badge" />
                            </div>
                        )}
                        <button
                            className="refresh-btn"
                            onClick={handleRefreshPhoto}
                            disabled={syncing}
                            title="Refresh foto dari Strava"
                        >
                            <FiRefreshCw className={syncing ? "spinning" : ""} />
                        </button>
                    </div>

                    <h1 className="profile-name">{user?.name}</h1>

                    <div className="profile-location">
                        <FiMapPin />
                        <span>{user?.city || "Unknown"}, {user?.country || "Unknown"}</span>
                    </div>

                    <div className="profile-details">
                        <div className="detail-item">
                            <FiHash className="detail-icon" />
                            <div>
                                <span className="detail-label">Strava ID</span>
                                <span className="detail-value">{user?.strava_id}</span>
                            </div>
                        </div>
                        <div className="detail-item">
                            <FiCalendar className="detail-icon" />
                            <div>
                                <span className="detail-label">Member Since</span>
                                <span className="detail-value">
                                    {new Date(user?.createdAt).toLocaleDateString("id-ID", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                </span>
                            </div>
                        </div>
                    </div>

                    <a
                        href={`https://www.strava.com/athletes/${user?.strava_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="strava-profile-btn"
                    >
                        <FiExternalLink />
                        View on Strava
                    </a>
                </div>
            </div>
        </div>
    );
}

export default Profile;
