import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminNavbar from '../../components/common/AdminNavbar';
import '../../assets/css/studentSessions.css';

const api = import.meta.env.VITE_API_URL;

export default function VerificationReview() {
    const [requests, setRequests] = useState([]);
    const [statuses, setStatuses] = useState({});

    const fetchRequests = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${api}/api/verification/pending`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRequests(res.data);
        } catch (err) {
            console.error('Error fetching verifications:', err.message);
        }
    };

    const handleUpdate = async (id, tutorId, status, comments) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${api}/api/verification/${id}`, {
                status,
                tutorId,
                adminComments: comments
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Status updated successfully!');
            fetchRequests();
        } catch (err) {
            console.error('Error updating status:', err.message);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    return (
        <>
            <AdminNavbar />
            <div className="session-container">
                <h2>Pending Tutor Verifications</h2>
                {requests.length === 0 ? (
                    <p>No pending requests.</p>
                ) : (
                    requests.map((req) => (
                        <div key={req._id} className="session-card">
                            <p><strong>Name:</strong> {req.tutor?.name}</p>
                            <p><strong>Email:</strong> {req.tutor?.email}</p>
                            <p><strong>Status:</strong> {req.status}</p>
                            <p><strong>Submitted:</strong> {new Date(req.submittedAt).toLocaleString()}</p>

                            <textarea
                                placeholder="Admin comments..."
                                value={statuses[req._id]?.comments || ''}
                                onChange={(e) =>
                                    setStatuses((prev) => ({
                                        ...prev,
                                        [req._id]: {
                                            ...prev[req._id],
                                            comments: e.target.value
                                        }
                                    }))
                                }
                            />

                            <div style={{ marginTop: '10px' }}>
                                <button
                                    style={{ marginRight: '10px' }}
                                    onClick={() => handleUpdate(req._id, req.tutor._id, 'approved', statuses[req._id]?.comments || '')}
                                >
                                    Approve
                                </button>
                                <button
                                    onClick={() => handleUpdate(req._id, req.tutor._id, 'rejected', statuses[req._id]?.comments || '')}
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </>
    );
}
