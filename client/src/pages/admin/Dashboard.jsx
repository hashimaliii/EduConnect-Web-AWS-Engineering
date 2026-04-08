import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminNavbar from '../../components/common/AdminNavbar';

const api = import.meta.env.VITE_API_URL;

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get(`${api}/api/admin/dashboard-stats`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStats(res.data);
            } catch (err) {
                console.error('Failed to fetch dashboard stats:', err.message);
            }
        };
        fetchStats();
    }, []);

    return (
        <>
            <AdminNavbar />
            <div className="session-container">
                <h2>Admin Dashboard</h2>
                <div className="stats-grid">
                    <div className="stat-card">
                        <strong>Total Users</strong>
                        <p>{stats?.totalUsers || 0}</p>
                    </div>
                    <div className="stat-card">
                        <strong>Total Tutors</strong>
                        <p>{stats?.totalTutors || 0}</p>
                    </div>
                    <div className="stat-card">
                        <strong>Verified Tutors</strong>
                        <p>{stats?.verifiedTutors || 0}</p>
                    </div>
                    <div className="stat-card">
                        <strong>Total Sessions</strong>
                        <p>{stats?.totalSessions || 0}</p>
                    </div>
                    <div className="stat-card">
                        <strong>Total Earnings</strong>
                        <p>Rs {stats?.totalEarnings || 0}</p>
                    </div>
                </div>
            </div>
        </>
    );
}
