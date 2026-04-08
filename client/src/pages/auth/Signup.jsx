import { useState } from 'react';
import axios from 'axios';
import '../../assets/css/auth.css';

const api = import.meta.env.VITE_API_URL;

export default function Signup() {
    const [availability, setAvailability] = useState([]);
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        city: '',
        role: 'student',
        qualifications: '',
        subjects: '',
        hourlyRate: '',
        teachingPreferences: '',
        bio: ''
    });

    const [error, setError] = useState('');

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = {
            name: form.name,
            email: form.email,
            password: form.password,
            city: form.city,
            role: form.role,
        };

        const dataForTutor = {};
        if (form.role === 'tutor') {
            dataForTutor.qualifications = form.qualifications;
            dataForTutor.subjects = form.subjects.split(',').map(s => s.trim());
            dataForTutor.hourlyRate = Number(form.hourlyRate);
            dataForTutor.teachingPreferences = form.teachingPreferences;
            dataForTutor.bio = form.bio;
            dataForTutor.availability = availability;
        }

        try {
            const res = await axios.post(`${api}/api/auth/register`, data);
            if (form.role === 'tutor') {
                await axios.put(`${api}/api/tutors/profile`, dataForTutor, {
                    headers: {
                        Authorization: `Bearer ${res.data.token}`
                    }
                });
            }

            localStorage.setItem('token', res.data.token);
            localStorage.setItem('role', res.data.role);
            alert('Signup successful!');
            window.location.href = '/login';
        } catch (err) {
            setError(err.response?.data?.message || 'Signup failed');
        }
    };

    return (
        <div className="auth-container">
            <h2>Signup as {form.role}</h2>
            <form onSubmit={handleSubmit}>
                <label>Name:</label>
                <input name="name" value={form.name} onChange={handleChange} required />

                <label>Email:</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} required />

                <label>Password:</label>
                <input name="password" type="password" value={form.password} onChange={handleChange} required />

                <label>City:</label>
                <input name="city" value={form.city} onChange={handleChange} required />

                <label>Role:</label>
                <select name="role" value={form.role} onChange={handleChange}>
                    <option value="student">Student</option>
                    <option value="tutor">Tutor</option>
                </select>

                {form.role === 'tutor' && (
                    <>
                        <label>Qualifications:</label>
                        <input name="qualifications" value={form.qualifications} onChange={handleChange} />

                        <label>Subjects (comma separated):</label>
                        <input name="subjects" value={form.subjects} onChange={handleChange} />

                        <label>Hourly Rate (Rs):</label>
                        <input name="hourlyRate" type="number" value={form.hourlyRate} onChange={handleChange} />

                        <label>Teaching Preference:</label>
                        <select name="teachingPreferences" value={form.teachingPreferences} onChange={handleChange}>
                            <option value="">Select</option>
                            <option value="online">Online</option>
                            <option value="in-person">In-Person</option>
                        </select>

                        <label>Bio:</label>
                        <textarea name="bio" value={form.bio} onChange={handleChange}></textarea>
                        <label>Weekly Availability:</label>
                        {daysOfWeek.map((day) => {
                            const slot = availability.find((a) => a.day === day) || {};
                            return (
                                <div key={day} style={{ marginBottom: '10px' }}>
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={!!slot.day}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setAvailability([...availability, { day, from: '09:00', to: '17:00' }]);
                                                } else {
                                                    setAvailability(availability.filter((a) => a.day !== day));
                                                }
                                            }}
                                        />
                                        {` ${day}`}
                                    </label>

                                    {slot.day && (
                                        <>
                                            <label style={{ marginLeft: '10px' }}>From:</label>
                                            <input
                                                type="time"
                                                value={slot.from}
                                                onChange={(e) =>
                                                    setAvailability(availability.map((a) => a.day === day ? { ...a, from: e.target.value } : a))
                                                }
                                            />
                                            <label style={{ marginLeft: '10px' }}>To:</label>
                                            <input
                                                type="time"
                                                value={slot.to}
                                                onChange={(e) =>
                                                    setAvailability(availability.map((a) => a.day === day ? { ...a, to: e.target.value } : a))
                                                }
                                            />
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </>
                )}

                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit">Signup</button>
            </form>
            <p style={{ marginTop: '10px' }}>
                Already have an account?{' '}
                <button type="button" onClick={() => (window.location.href = '/login')} style={{ color: '#0a74da', background: 'none', border: 'none', cursor: 'pointer' }}>
                    Login
                </button>
            </p>

        </div>
    );
}
