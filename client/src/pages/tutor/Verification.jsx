import { useEffect, useState } from 'react';
import axios from 'axios';
import TutorNavbar from '../../components/common/TutorNavbar';
import '../../assets/css/studentSessions.css';

const api = import.meta.env.VITE_API_URL;

export default function TutorVerification() {
    const [form, setForm] = useState({
        fullName: '',
        documentType: '',
        documentNumber: '',
        documentImage: ''
    });
    const [status, setStatus] = useState(null);
    const [message, setMessage] = useState('');

    const fetchStatus = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${api}/api/verification/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStatus(res.data.status || 'pending');
        } catch (err) {
            console.log('No existing verification request.');
        }
    };

    useEffect(() => {
        fetchStatus();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${api}/api/verification`, form, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage('Verification request submitted!');
            fetchStatus();
        } catch (err) {
            console.error('Submission failed:', err.message);
            setMessage('Could not submit verification.');
        }
    };

    return (
        <>
            <TutorNavbar />
            <div className="session-container">
                <h2>Verification</h2>

                {status && (
                    <div className="session-card">
                        <p><strong>Current Status:</strong> {status}</p>
                        {status === 'approved' && <p style={{ color: 'green' }}>✅ You are a verified tutor!</p>}
                        {status === 'rejected' && <p style={{ color: 'red' }}>❌ Your request was rejected.</p>}
                        {status === 'pending' && <p>⏳ Your verification request is being reviewed.</p>}
                    </div>
                )}

                {status !== 'approved' && (
                    <form onSubmit={handleSubmit} className="form-layout">
                        <div className="form-group">
                            <label>Full Name:</label>
                            <input name="fullName" value={form.fullName} onChange={handleChange} required />
                        </div>

                        <div className="form-group">
                            <label>Document Type (e.g. CNIC, ID Card):</label>
                            <input name="documentType" value={form.documentType} onChange={handleChange} required />
                        </div>

                        <div className="form-group">
                            <label>Document Number:</label>
                            <input name="documentNumber" value={form.documentNumber} onChange={handleChange} required />
                        </div>

                        <div className="form-group">
                            <label>Document Image URL:</label>
                            <input name="documentImage" value={form.documentImage} onChange={handleChange} required />
                        </div>

                        {message && <p>{message}</p>}
                        <button type="submit">Submit Verification</button>
                    </form>
                )}
            </div>
        </>
    );
}
