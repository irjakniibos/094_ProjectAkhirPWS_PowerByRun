import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getPersonalBest, getUser } from "../services/api";
import { FiAward, FiTarget, FiFlag, FiStar } from "react-icons/fi";
import { GiRun, GiTrophy } from "react-icons/gi";
import "./PersonalBest.css";

function PersonalBest() {
    const [searchParams] = useSearchParams();
    const [user, setUser] = useState(null);
    const [pbs, setPbs] = useState(null);
    const [loading, setLoading] = useState(true);

    const userId = searchParams.get("userId") || localStorage.getItem("userId");

    useEffect(() => {
        if (userId) {
            fetchData();
        }
    }, [userId]);

    const fetchData = async () => {
        try {
            const [userRes, pbRes] = await Promise.all([
                getUser(userId),
                getPersonalBest(userId),
            ]);
            setUser(userRes.data);
            setPbs(pbRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const pbOrder = ["3K", "5K", "10K", "Half Marathon", "Marathon"];
    const pbIcons = {
        "3K": <FiTarget />,
        "5K": <FiFlag />,
        "10K": <FiStar />,
        "Half Marathon": <GiRun />,
        "Marathon": <GiTrophy />,
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading personal bests...</p>
            </div>
        );
    }

    return (
        <div className="pb-layout">
            <Navbar userName={user?.name} />

            <div className="pb-container">
                <header className="pb-header">
                    <h1><FiAward className="header-icon" /> Personal Bests</h1>
                    <p>Your fastest times for each distance</p>
                </header>

                <div className="pb-grid">
                    {pbOrder.map((distance) => {
                        const pb = pbs?.[distance];
                        return (
                            <div key={distance} className={`pb-card ${pb ? "has-pb" : "no-pb"}`}>
                                <div className="pb-icon">{pbIcons[distance]}</div>
                                <h2 className="pb-distance">{distance}</h2>

                                {pb ? (
                                    <>
                                        <div className="pb-time">{pb.movingTimeFormatted}</div>
                                        <div className="pb-pace">{pb.pace}</div>

                                        <div className="pb-times-detail">
                                            <div className="time-row">
                                                <span className="time-label">Moving Time:</span>
                                                <span className="time-value">{pb.movingTimeFormatted}</span>
                                            </div>
                                            <div className="time-row">
                                                <span className="time-label">Elapsed Time:</span>
                                                <span className="time-value">{pb.elapsedTimeFormatted}</span>
                                            </div>
                                            <div className="time-row difference">
                                                <span className="time-label">Difference:</span>
                                                <span className={`time-value ${pb.timeDifference > 60 ? "warning" : "good"}`}>
                                                    +{pb.timeDifferenceFormatted}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="pb-date">
                                            {pb.activityDate && new Date(pb.activityDate).toLocaleDateString("id-ID", {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                            })}
                                        </div>
                                        {pb.activityId && (
                                            <a
                                                href={`https://www.strava.com/activities/${pb.activityId}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="pb-link"
                                            >
                                                View Activity →
                                            </a>
                                        )}
                                    </>
                                ) : (
                                    <div className="pb-empty">
                                        <span>No record yet</span>
                                        <p>Complete a run of {distance} or longer</p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default PersonalBest;
