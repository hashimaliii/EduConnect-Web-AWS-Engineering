import { Link, useNavigate } from 'react-router-dom';
import '../../assets/css/navbar.css';

export default function AdminNavbar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login');
    };

    return (
        <nav className="student-navbar">
            <Link to="/admin/dashboard">Dashboard</Link>
            <Link to="/admin/verification">Verification</Link>
            <Link to="/admin/users">Users</Link>
            <Link to="/admin/reports">Reports</Link>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
        </nav>
    );
}
