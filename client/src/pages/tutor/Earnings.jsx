import { useEffect, useState } from 'react';
import axios from 'axios';
import TutorNavbar from '../../components/common/TutorNavbar';
import '../../assets/css/studentSessions.css';

const api = import.meta.env.VITE_API_URL;

export default function TutorEarnings() {
    const [earnings, setEarnings] = useState(0);
    const [sessions, setSessions] = useState([]);

    const fetchEarnings = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${api}/api/tutors/earnings`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEarnings(res.data.totalEarnings || 0);
            setSessions(res.data.sessions || []);
        } catch (err) {
            console.error('Failed to fetch earnings:', err.message);
        }
    };

    useEffect(() => {
        fetchEarnings();
    }, []);

    return (
        <>
            <TutorNavbar />
            <div className="session-container">
                <h2>Earnings Overview</h2>
                <h3>Total: Rs {earnings}</h3>

                {sessions.length === 0 ? (
                    <p>No completed sessions yet.</p>
                ) : (
                    sessions.map((s) => (
                        <div className="session-card" key={s._id}>
                            <p><strong>Student:</strong> {s.student?.name}</p>
                            <p><strong>Date:</strong> {new Date(s.date).toLocaleDateString()}</p>
                            <p><strong>Time:</strong> {s.time}</p>
                            <p><strong>Type:</strong> {s.type}</p>
                            <p><strong>Status:</strong> {s.status}</p>
                            <p><strong>Earned:</strong> Rs {s.hourlyRate}</p>
                        </div>
                    ))
                )}
            </div>
        </>
    );
}
