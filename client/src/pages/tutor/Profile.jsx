import { useEffect, useState } from 'react';
import axios from 'axios';
import '../../assets/css/auth.css';
import TutorNavbar from '../../components/common/TutorNavbar';

const api = import.meta.env.VITE_API_URL;

export default function TutorProfile() {
    const [form, setForm] = useState({
        name: '',
        bio: '',
        qualifications: '',
        subjects: '',
        hourlyRate: '',
        teachingPreferences: '',
        availability: []
    });

    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${api}/api/tutors/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const tutor = res.data;
            setForm({
                name: tutor.name || '',
                bio: tutor.bio || '',
                qualifications: tutor.qualifications || '',
                subjects: tutor.subjects?.join(', ') || '',
                hourlyRate: tutor.hourlyRate || '',
                teachingPreferences: tutor.teachingPreferences || '',
                availability: tutor.availability || []
            });
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch tutor profile:', err.message);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleAvailabilityChange = (day, field, value) => {
        setForm((prev) => {
            const updated = [...prev.availability];
            const index = updated.findIndex((a) => a.day === day);

            if (index === -1) {
                updated.push({ day, [field]: value });
            } else {
                updated[index] = { ...updated[index], [field]: value };
            }

            return { ...prev, availability: updated };
        });
    };

    const toggleDay = (day) => {
        setForm((prev) => {
            const updated = prev.availability.filter((a) => a.day !== day);
            if (updated.length === prev.availability.length) {
                updated.push({ day, from: '09:00', to: '17:00' });
            }
            return { ...prev, availability: updated };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${api}/api/tutors/profile`, {
                ...form,
                subjects: form.subjects.split(',').map((s) => s.trim())
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMessage('Profile updated successfully!');
        } catch (err) {
            console.error('Update failed:', err.message);
            setMessage('Failed to update profile.');
        }
    };

    if (loading) return <p>Loading profile...</p>;

    return (
        <>
            <TutorNavbar />
            <div className="auth-container">
                <h2>My Profile</h2>
                <form onSubmit={handleSubmit}>
                    <label>Name:</label>
                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />

                    <label>Bio:</label>
                    <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}></textarea>

                    <label>Qualifications:</label>
                    <input value={form.qualifications} onChange={(e) => setForm({ ...form, qualifications: e.target.value })} />

                    <label>Subjects (comma separated):</label>
                    <input value={form.subjects} onChange={(e) => setForm({ ...form, subjects: e.target.value })} />

                    <label>Hourly Rate (Rs):</label>
                    <input type="number" value={form.hourlyRate} onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })} />

                    <label>Teaching Preference:</label>
                    <select value={form.teachingPreferences} onChange={(e) => setForm({ ...form, teachingPreferences: e.target.value })}>
                        <option value="">Select</option>
                        <option value="online">Online</option>
                        <option value="in-person">In-Person</option>
                    </select>

                    <label>Availability:</label>
                    {daysOfWeek.map((day) => {
                        const slot = form.availability.find((a) => a.day === day);
                        return (
                            <div key={day} style={{ marginBottom: '10px' }}>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={!!slot}
                                        onChange={() => toggleDay(day)}
                                    /> {day}
                                </label>
                                {slot && (
                                    <>
                                        <label style={{ marginLeft: '10px' }}>From:</label>
                                        <input
                                            type="time"
                                            value={slot.from}
                                            onChange={(e) => handleAvailabilityChange(day, 'from', e.target.value)}
                                        />
                                        <label style={{ marginLeft: '10px' }}>To:</label>
                                        <input
                                            type="time"
                                            value={slot.to}
                                            onChange={(e) => handleAvailabilityChange(day, 'to', e.target.value)}
                                        />
                                    </>
                                )}
                            </div>
                        );
                    })}

                    {message && <p style={{ marginTop: '10px' }}>{message}</p>}
                    <button type="submit">Update Profile</button>
                </form>
            </div>
        </>
    );
}
