import { useState } from 'react';
import axios from 'axios';
import '../../assets/css/auth.css';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student');
    const [error, setError] = useState('');

    const api = import.meta.env.VITE_API_URL;

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${api}/api/auth/login`, {
                email,
                password
            });

            if (res.data.role !== role) {
                return setError('Incorrect role selected');
            }

            localStorage.setItem('token', res.data.token);
            localStorage.setItem('role', res.data.role);
            alert('Login successful!');

            // Redirect based on role
            if (res.data.role === 'student') window.location.href = '/student/dashboard';
            else if (res.data.role === 'tutor') window.location.href = '/tutor/dashboard';
            else if (res.data.role === 'admin') window.location.href = '/admin/dashboard';

        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="auth-container">
            <h2>Login as {role}</h2>
            <form onSubmit={handleLogin}>
                <label>Email:</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

                <label>Password:</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

                <label>Login as:</label>
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="student">Student</option>
                    <option value="tutor">Tutor</option>
                    <option value="admin">Admin</option>
                </select>

                {error && <p>{error}</p>}
                <button type="submit">Login</button>
            </form>
            <p style={{ marginTop: '10px' }}>
                Don't have an account?{' '}
                <button type="button" onClick={() => (window.location.href = '/signup')} style={{ color: '#0a74da', background: 'none', border: 'none', cursor: 'pointer' }}>
                    Signup
                </button>
            </p>

        </div>
    );
}
