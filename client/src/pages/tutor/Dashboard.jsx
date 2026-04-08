import { useEffect, useState } from 'react';
import axios from 'axios';
import '../../assets/css/studentSessions.css';
import TutorNavbar from '../../components/common/TutorNavbar';

const api = import.meta.env.VITE_API_URL;

export default function TutorDashboard() {
    const [summary, setSummary] = useState({ sessions: 0, earnings: 0, rating: 0 });

    const fetchSummary = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${api}/api/tutors/summary`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSummary(res.data);
        } catch (err) {
            console.error('Failed to load dashboard summary:', err.message);
        }
    };

    useEffect(() => {
        fetchSummary();
    }, []);

    return (
        <>
            <TutorNavbar />
            <div className="session-container">
                <h2>Welcome to Your Tutor Dashboard</h2>

                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '20px' }}>
                    <div className="session-card" style={{ flex: 1 }}>
                        <h3>Total Sessions</h3>
                        <p>{summary.sessions}</p>
                    </div>

                    <div className="session-card" style={{ flex: 1 }}>
                        <h3>Total Earnings</h3>
                        <p>Rs {summary.earnings}</p>
                    </div>

                    <div className="session-card" style={{ flex: 1 }}>
                        <h3>Average Rating</h3>
                        <p>{summary.rating ? `${summary.rating} ⭐` : 'Not rated yet'}</p>
                    </div>
                </div>
            </div>
        </>
    );
}
