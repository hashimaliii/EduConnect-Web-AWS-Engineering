import { Link, useNavigate } from 'react-router-dom';
import '../../assets/css/navbar.css';

export default function TutorNavbar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login');
    };

    return (
        <nav className="student-navbar">
            <Link to="/tutor/dashboard">Dashboard</Link>
            <Link to="/tutor/profile">My Profile</Link>
            <Link to="/tutor/sessions">Sessions</Link>
            <Link to="/tutor/earnings">Earnings</Link>
            <Link to="/tutor/verify">Verification</Link>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
        </nav>
    );
}
