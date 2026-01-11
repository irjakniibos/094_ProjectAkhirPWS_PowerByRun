const axios = require("axios");

const STRAVA_API_URL = "https://www.strava.com/api/v3";
const STRAVA_AUTH_URL = "https://www.strava.com/oauth/authorize";
const STRAVA_TOKEN_URL = "https://www.strava.com/oauth/token";

// Generate Strava OAuth URL
const getAuthUrl = () => {
  const params = new URLSearchParams({
    client_id: process.env.STRAVA_CLIENT_ID,
    redirect_uri: process.env.STRAVA_REDIRECT_URI,
    response_type: "code",
    scope: "read,activity:read_all,profile:read_all",
  });
  return `${STRAVA_AUTH_URL}?${params.toString()}`;
};

// Exchange authorization code for access token
const getAccessToken = async (code) => {
  const response = await axios.post(STRAVA_TOKEN_URL, {
    client_id: process.env.STRAVA_CLIENT_ID,
    client_secret: process.env.STRAVA_CLIENT_SECRET,
    code,
    grant_type: "authorization_code",
  });
  return response.data;
};

// Refresh access token
const refreshAccessToken = async (refreshToken) => {
  const response = await axios.post(STRAVA_TOKEN_URL, {
    client_id: process.env.STRAVA_CLIENT_ID,
    client_secret: process.env.STRAVA_CLIENT_SECRET,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });
  return response.data;
};

// Get athlete profile
const getAthleteProfile = async (accessToken) => {
  const response = await axios.get(`${STRAVA_API_URL}/athlete`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.data;
};

// Get athlete activities
const getActivities = async (accessToken, page = 1, perPage = 50) => {
  const response = await axios.get(`${STRAVA_API_URL}/athlete/activities`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    params: { page, per_page: perPage },
  });
  return response.data;
};

// Get all activities (paginated)
const getAllActivities = async (accessToken) => {
  let allActivities = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const activities = await getActivities(accessToken, page, 100);
    if (activities.length === 0) {
      hasMore = false;
    } else {
      allActivities = [...allActivities, ...activities];
      page++;
    }
  }

  return allActivities;
};

// Get detailed activity by ID (includes calories field)
const getDetailedActivity = async (accessToken, activityId) => {
  const response = await axios.get(`${STRAVA_API_URL}/activities/${activityId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.data;
};

module.exports = {
  getAuthUrl,
  getAccessToken,
  refreshAccessToken,
  getAthleteProfile,
  getActivities,
  getAllActivities,
  getDetailedActivity,
};
