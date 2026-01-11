import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Activities from "./pages/Activities";
import PersonalBest from "./pages/PersonalBest";
import AdminLogin from "./pages/AdminLogin";
import AdminRegister from "./pages/AdminRegister";
import AdminDashboard from "./pages/AdminDashboard";
import UserLogs from "./pages/UserLogs";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* User Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/activities" element={<Activities />} />
        <Route path="/personal-best" element={<PersonalBest />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/register" element={<AdminRegister />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/user-logs/:userId" element={<UserLogs />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
