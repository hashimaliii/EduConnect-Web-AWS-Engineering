import { useNavigate, Link } from 'react-router-dom';
import '../../assets/css/navbar.css';

export default function StudentNavbar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login');
    };

    return (
        <nav className="student-navbar">
            <Link to="/student/dashboard">Tutor Search</Link>
            <Link to="/student/sessions">My Sessions</Link>
            <Link to="/student/wishlist">My Wishlist</Link>
            <Link to="/student/notifications">Notifications</Link>

            <button onClick={handleLogout} className="logout-btn">
                Logout
            </button>
        </nav>
    );
}
