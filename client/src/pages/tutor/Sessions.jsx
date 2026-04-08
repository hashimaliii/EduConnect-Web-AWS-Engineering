import { useEffect, useState } from 'react';
import axios from 'axios';
import TutorNavbar from '../../components/common/TutorNavbar';
import '../../assets/css/studentSessions.css';

const api = import.meta.env.VITE_API_URL;

export default function TutorSessions() {
    const [sessions, setSessions] = useState([]);
    const [editMode, setEditMode] = useState(null);
    const [editData, setEditData] = useState({});

    const fetchSessions = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${api}/api/sessions/tutor`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSessions(res.data);
        } catch (err) {
            console.error('Failed to fetch sessions:', err.message);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    const handleAction = async (id, action) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${api}/api/sessions/${id}/status`, { status: action }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchSessions();
        } catch (err) {
            alert('Failed to update session.');
        }
    };

    const handleReschedule = async (id) => {
        const { date, time } = editData;
        const now = new Date();
        const selectedDateTime = new Date(`${date}T${time}`);

        if (!date || !time) return alert('Fill both fields');
        if (selectedDateTime < now) return alert('Cannot reschedule in the past');

        try {
            const token = localStorage.getItem('token');
            await axios.put(`${api}/api/sessions/${id}`, { date, time }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEditMode(null);
            fetchSessions();
        } catch (err) {
            alert('Failed to reschedule');
        }
    };

    return (
        <>
            <TutorNavbar />
            <div className="session-container">
                <h2>Session Requests</h2>
                {sessions.length === 0 ? (
                    <p>No sessions yet.</p>
                ) : (
                    sessions.map((s) => (
                        <div className="session-card" key={s._id}>
                            <h3>Student: {s.student?.name}</h3>
                            <p>Date: {new Date(s.date).toLocaleDateString()}</p>
                            <p>Time: {s.time}</p>
                            <p>Type: {s.type}</p>
                            <p>Status: {s.status}</p>

                            {s.status === 'pending' && (
                                <>
                                    <button onClick={() => handleAction(s._id, 'accepted')}>Accept</button>
                                    <button onClick={() => handleAction(s._id, 'rejected')}>Reject</button>
                                    <button onClick={() => {
                                        setEditMode(s._id);
                                        setEditData({ date: s.date?.split('T')[0], time: s.time });
                                    }}>Reschedule</button>
                                </>
                            )}

                            {editMode === s._id && (
                                <div style={{ marginTop: '10px' }}>
                                    <input type="date" value={editData.date}
                                        onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                    <input type="time" value={editData.time}
                                        onChange={(e) => setEditData({ ...editData, time: e.target.value })}
                                    />
                                    <button onClick={() => handleReschedule(s._id)}>Save</button>
                                    <button onClick={() => setEditMode(null)}>Cancel</button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </>
    );
}
