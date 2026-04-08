import { useEffect, useState } from 'react';
import axios from 'axios';
import StudentNavbar from '../../components/common/StudentNavbar';
import '../../assets/css/tutorSearch.css'; // reuse existing styles

export default function Wishlist() {
    const [sortBy, setSortBy] = useState('');
    const [minRate, setMinRate] = useState('');
    const [maxRate, setMaxRate] = useState('');
    const [wishlist, setWishlist] = useState([]);
    const api = import.meta.env.VITE_API_URL;

    const fetchWishlist = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${api}/api/wishlist`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setWishlist(res.data);
        } catch (err) {
            console.error('Failed to load wishlist:', err.message);
        }
    };

    const handleRemove = async (tutorId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${api}/api/wishlist/${tutorId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setWishlist((prev) => prev.filter((tutor) => tutor._id !== tutorId));
        } catch (err) {
            alert('Failed to remove tutor');
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, []);

    const getFilteredWishlist = () => {
        let filtered = [...wishlist];

        // Filter by price range
        if (minRate) filtered = filtered.filter((t) => t.hourlyRate >= parseInt(minRate));
        if (maxRate) filtered = filtered.filter((t) => t.hourlyRate <= parseInt(maxRate));

        // Sort
        if (sortBy === 'rate-asc') {
            filtered.sort((a, b) => a.hourlyRate - b.hourlyRate);
        } else if (sortBy === 'rate-desc') {
            filtered.sort((a, b) => b.hourlyRate - a.hourlyRate);
        } else if (sortBy === 'name') {
            filtered.sort((a, b) => a.name.localeCompare(b.name));
        }

        return filtered;
    };

    return (
        <>
            <StudentNavbar />
            <div className="search-container">
                <div className="wishlist-header">
                    <h2>My Wishlist</h2>
                    <p>Total Tutors: {wishlist.length}</p>
                </div>
                <div className="wishlist-filters" style={{ margin: '20px 0', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                        <option value="">Sort by</option>
                        <option value="rate-asc">Rate: Low to High</option>
                        <option value="rate-desc">Rate: High to Low</option>
                        <option value="name">Name A-Z</option>
                    </select>

                    <input
                        type="number"
                        placeholder="Min Rate"
                        value={minRate}
                        onChange={(e) => setMinRate(e.target.value)}
                    />

                    <input
                        type="number"
                        placeholder="Max Rate"
                        value={maxRate}
                        onChange={(e) => setMaxRate(e.target.value)}
                    />
                </div>
                {wishlist.length === 0 ? (
                    <p>No tutors in wishlist.</p>
                ) : (
                    getFilteredWishlist().map((tutor) => (
                        <div key={tutor._id} className="tutor-card">
                            <h3>{tutor.name}</h3>
                            <p>Subjects: {tutor.subjects.join(', ')}</p>
                            <p>City: {tutor.city}</p>
                            <p>Rate: Rs {tutor.hourlyRate}</p>
                            <button onClick={() => handleRemove(tutor._id)}>Remove</button>
                            <button onClick={() => window.location.href = '/student/dashboard'}>Book Now</button>
                        </div>
                    ))
                )}
            </div>
        </>
    );
}
