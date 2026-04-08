import { useEffect, useState } from 'react';
import axios from 'axios';
import StudentNavbar from '../../components/common/StudentNavbar';
import '../../assets/css/studentSessions.css';

export default function MySessions() {
    const [editMode, setEditMode] = useState(null);
    const [editData, setEditData] = useState({});
    const [reviews, setReviews] = useState({});
    const [sessions, setSessions] = useState([]);
    const api = import.meta.env.VITE_API_URL;

    const fetchSessions = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${api}/api/sessions/my`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setSessions(res.data);
        } catch (err) {
            console.error('Failed to load sessions:', err.message);
        }
    };

    const handleUpdate = async (sessionId) => {
        const { date, time, type } = editData;

        if (!date || !time || !type) {
            return alert('Please fill all fields');
        }

        const selectedDateTime = new Date(`${date}T${time}`);
        const now = new Date();

        if (selectedDateTime < now) {
            return alert('You cannot reschedule to a past date or time.');
        }

        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `${api}/api/sessions/${sessionId}`,
                { date, time, type },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('Session updated');
            setEditMode(null);
            fetchSessions(); // refresh
        } catch (err) {
            console.error('Update failed:', err.message);
            alert('Failed to update session');
        }
    };

    const handleReviewSubmit = async (sessionId) => {
        const { rating, reviewText } = reviews[sessionId] || {};
        if (!rating || !reviewText) {
            alert('Please enter both rating and review');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            console.log('Submitting review with:', { session: sessionId, rating, reviewText });

            await axios.post(
                `${api}/api/reviews`,
                {
                    session: sessionId,
                    rating: Number(rating),
                    reviewText: reviewText
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            alert('Review submitted!');
            setReviews((prev) => ({ ...prev, [sessionId]: { rating: '', reviewText: '' } }));
            fetchSessions(); // optional refresh
        } catch (err) {
            console.error('Review error:', err.message);
            alert('Failed to submit review');
        }
    };

    const handleCancel = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this session?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${api}/api/sessions/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Session canceled.');
            fetchSessions(); // refresh list
        } catch (err) {
            console.error('Cancel failed:', err.message);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    return (
        <>
            <StudentNavbar />
            <div className="session-container">
                <h2>My Booked Sessions</h2>

                {sessions.length === 0 ? (
                    <p>No sessions booked yet.</p>
                ) : (
                    sessions.map((s) => (
                        <div className="session-card" key={s._id}>
                            <h3>{s.tutor.name}</h3>
                            <p>
                                Date: {new Date(s.date).toLocaleDateString('en-GB', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                            <p>
                                Time: {new Date(`1970-01-01T${s.time}`).toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                            <p>Type: {s.type}</p>
                            <p>Status: {s.status}</p>
                            <button onClick={() => handleCancel(s._id)}>Cancel Session</button>
                            {s.status === 'pending' && (
                                <>
                                    {editMode === s._id ? (
                                        <div className="session-form">
                                            <input
                                                type="date"
                                                value={editData.date || ''}
                                                onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                                                min={new Date().toISOString().split('T')[0]}
                                            />
                                            <input
                                                type="time"
                                                value={editData.time || ''}
                                                onChange={(e) => setEditData({ ...editData, time: e.target.value })}
                                            />
                                            <select
                                                value={editData.type || ''}
                                                onChange={(e) => setEditData({ ...editData, type: e.target.value })}
                                            >
                                                <option value="">Select Type</option>
                                                <option value="online">Online</option>
                                                <option value="in-person">In-Person</option>
                                            </select>

                                            <button onClick={() => handleUpdate(s._id)}>Save</button>
                                            <button onClick={() => setEditMode(null)}>Cancel</button>
                                        </div>
                                    ) : (
                                        <button onClick={() => {
                                            setEditMode(s._id);
                                            setEditData({ date: s.date?.split('T')[0], time: s.time, type: s.type });
                                        }}>
                                            Reschedule
                                        </button>
                                    )}
                                </>
                            )}
                            {s.status === 'completed' && !s.reviewed && (
                                <div style={{ marginTop: '10px' }}>
                                    <h4>Leave a Review:</h4>
                                    <select
                                        value={reviews[s._id]?.rating || ''}
                                        onChange={(e) =>
                                            setReviews((prev) => ({
                                                ...prev,
                                                [s._id]: {
                                                    ...prev[s._id],
                                                    rating: Number(e.target.value)
                                                }
                                            }))
                                        }
                                    >
                                        <option value="">Rating (1–5)</option>
                                        {[1, 2, 3, 4, 5].map((num) => (
                                            <option key={num} value={num}>{num}</option>
                                        ))}
                                    </select>

                                    <textarea
                                        rows="3"
                                        placeholder="Write your feedback..."
                                        value={reviews[s._id]?.reviewText || ''}
                                        onChange={(e) =>
                                            setReviews((prev) => ({
                                                ...prev,
                                                [s._id]: {
                                                    ...prev[s._id],
                                                    reviewText: e.target.value
                                                }
                                            }))
                                        }
                                    ></textarea>

                                    <button onClick={() => handleReviewSubmit(s._id)}>
                                        Submit Review
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </>
    );
}
