import { useEffect, useState } from 'react';
import axios from 'axios';
import StudentNavbar from '../../components/common/StudentNavbar';
import '../../assets/css/studentSessions.css'; // reuse clean layout

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const api = import.meta.env.VITE_API_URL;

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${api}/api/notifications`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(res.data);
        } catch (err) {
            console.error('Failed to load notifications:', err.message);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    return (
        <>
            <StudentNavbar />
            <div className="session-container">
                <h2>My Notifications</h2>

                {notifications.length === 0 ? (
                    <p>No notifications yet.</p>
                ) : (
                    notifications.map((note) => (
                        <div key={note._id} className="session-card">
                            <p>{note.message}</p>
                            <small>{new Date(note.createdAt).toLocaleString()}</small>
                        </div>
                    ))
                )}
            </div>
        </>
    );
}
