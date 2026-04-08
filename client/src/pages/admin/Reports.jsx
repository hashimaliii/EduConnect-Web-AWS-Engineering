import { useEffect, useState } from 'react';
import axios from 'axios';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import AdminNavbar from '../../components/common/AdminNavbar';
import '../../assets/css/studentSessions.css';

const api = import.meta.env.VITE_API_URL;
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042'];

export default function AdminReports() {
    const [sessionStats, setSessionStats] = useState({});
    const [userStats, setUserStats] = useState({});
    const [popularSubjects, setPopularSubjects] = useState([]);

    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const [sessionsRes, usersRes, subjectsRes] = await Promise.all([
                    axios.get(`${api}/api/reports/sessions`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`${api}/api/reports/users`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`${api}/api/reports/subjects`, { headers: { Authorization: `Bearer ${token}` } }),
                ]);
                setSessionStats(sessionsRes.data);
                setUserStats(usersRes.data);
                setPopularSubjects(subjectsRes.data.popularSubjects || []);
            } catch (err) {
                console.error('Failed to load reports:', err.message);
            }
        };
        fetchReports();
    }, []);

    const userGrowthData = Object.entries(userStats.userGrowth || {}).map(([month, count]) => ({
        month,
        users: count
    }));

    const cityData = Object.entries(userStats.usersByCity || {}).map(([city, count]) => ({
        name: city,
        value: count
    }));

    const subjectData = popularSubjects.map(([subject, count]) => ({
        name: subject,
        value: count
    }));

    return (
        <>
            <AdminNavbar />
            <div className="session-container">
                <h2>Admin Reports</h2>

                <div className="session-card">
                    <h3>Session Statistics</h3>
                    <p>Total Sessions: {sessionStats.totalSessions}</p>
                    <p>Completed Sessions: {sessionStats.completedSessions}</p>
                    <p>Completion Rate: {sessionStats.completionRate}</p>
                </div>

                <div className="session-card">
                    <h3>User Growth (Monthly)</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={userGrowthData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="users" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="session-card">
                    <h3>Users by City</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie data={cityData} dataKey="value" nameKey="name" outerRadius={100} label>
                                {cityData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="session-card">
                    <h3>Popular Subjects</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={subjectData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#82ca9d" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </>
    );
}
