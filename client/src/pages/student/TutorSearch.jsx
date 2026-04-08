import { useState, useEffect } from 'react';
import axios from 'axios';
import '../../assets/css/tutorSearch.css';
import StudentNavbar from '../../components/common/StudentNavbar';

export default function TutorSearch() {
    const [reviewsByTutor, setReviewsByTutor] = useState({});
    const [booking, setBooking] = useState({});
    const [filters, setFilters] = useState({
        subject: '',
        city: '',
        priceMin: '',
        priceMax: '',
        rating: '',
        availability: ''
    });

    const [tutors, setTutors] = useState([]);
    const api = import.meta.env.VITE_API_URL;

    const handleBookSession = async (tutorId, tutor) => {
        const { date, time, type } = booking[tutorId] || {};
        if (!date || !time || !type) {
            alert('Please select date, time, and session type');
            return;
        }

        const now = new Date();
        const selected = new Date(`${date} ${time}`);
        if (selected < now) {
            return alert('Cannot book a session in the past');
        }

        if (!isWithinAvailability(tutor, date, time)) {
            return alert(`Selected time is outside tutor's availability.`);
        }

        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `${api}/api/sessions/book`,
                {
                    tutor: tutorId,
                    date,
                    time,
                    type
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            alert('Session booked successfully!');
            setBooking((prev) => ({ ...prev, [tutorId]: { date: '', time: '', type: '' } }));
        } catch (err) {
            console.error('Booking error:', err.message);
            alert('Failed to book session');
        }
    };

    useEffect(() => {
        tutors.forEach(async (tutor) => {
            try {
                const res = await axios.get(`${api}/api/reviews/${tutor._id}`);
                setReviewsByTutor((prev) => ({
                    ...prev,
                    [tutor._id]: res.data
                }));
            } catch (err) {
                console.error('Failed to fetch reviews for tutor:', tutor._id);
            }
        });
    }, [tutors]);

    const handleChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleAddToWishlist = async (tutorId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${api}/api/wishlist/${tutorId}`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            alert('Added to wishlist!');
        } catch (err) {
            console.error('Wishlist error:', err.message);
            alert('Could not add to wishlist.');
        }
    };

    const resetFilters = () => {
        setFilters({
            subject: '',
            city: '',
            priceMin: '',
            priceMax: '',
            rating: '',
            availability: ''
        });
        setTutors([]); // Optional: clear results
    };

    const fetchTutors = async () => {
        try {
            const query = new URLSearchParams(filters).toString();
            const res = await axios.get(`${api}/api/tutors/search?${query}`);
            setTutors(res.data);
        } catch (err) {
            console.error('Failed to fetch tutors:', err.message);
        }
    };

    const isWithinAvailability = (tutor, date, time) => {
        const selectedDay = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });

        const match = tutor.availability?.find((slot) => slot.day === selectedDay);
        if (!match) return false;

        return time >= match.from && time <= match.to;
    };

    useEffect(() => {
        fetchTutors(); // fetch on first load
    }, []);

    const today = new Date().toISOString().split('T')[0];

    return (
        <>
            <StudentNavbar />
            <div className="search-container">
                <h2>Find Tutors</h2>

                <div className="filters">
                    <input name="subject" placeholder="Subject" value={filters.subject} onChange={handleChange} />
                    <input name="city" placeholder="City" value={filters.city} onChange={handleChange} />
                    <input name="priceMin" placeholder="Min Price" type="number" value={filters.priceMin} onChange={handleChange} />
                    <input name="priceMax" placeholder="Max Price" type="number" value={filters.priceMax} onChange={handleChange} />
                    <input name="rating" placeholder="Minimum Rating" type="number" min="1" max="5" value={filters.rating} onChange={handleChange} />
                    <select name="availability" value={filters.availability} onChange={handleChange}>
                        <option value="">Availability</option>
                        <option value="Monday">Monday</option>
                        <option value="Tuesday">Tuesday</option>
                        <option value="Wednesday">Wednesday</option>
                        <option value="Thursday">Thursday</option>
                        <option value="Friday">Friday</option>
                        <option value="Saturday">Saturday</option>
                        <option value="Sunday">Sunday</option>
                    </select>

                    <div className="actions">
                        <button onClick={fetchTutors}>Search</button>
                        <button onClick={resetFilters}>Clear Filters</button>
                    </div>
                </div>

                <div>
                    {tutors.length === 0 ? (
                        <p>No tutors found.</p>
                    ) : (
                        tutors.map((tutor) => (
                            <div className="tutor-card" key={tutor._id}>
                                <h3>{tutor.name}</h3>
                                <p>Subjects: {tutor.subjects.length !== 0 ? tutor.subjects.join(', ') : "NA"}</p>
                                <p>City: {tutor.city ? tutor.city : "NA"}</p>
                                <p>Rate: Rs. {tutor.hourlyRate}</p>
                                <p>
                                    Rating:{' '}
                                    {tutor.averageRating
                                        ? `${tutor.averageRating} ⭐`
                                        : 'Not rated yet'}
                                </p>
                                {tutor.availability && tutor.availability.length > 0 && (
                                    <div>
                                        <strong>Availability:</strong>
                                        <ul>
                                            {tutor.availability.map((slot, idx) => (
                                                <li key={idx}>
                                                    {slot.day}: {slot.from} – {slot.to}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {reviewsByTutor[tutor._id] && reviewsByTutor[tutor._id].length > 0 && (
                                    <div>
                                        <strong>Student Feedback:</strong>
                                        <ul>
                                            {reviewsByTutor[tutor._id].slice(0, 2).map((review) => (
                                                <li key={review._id}>
                                                    ⭐ {review.rating} — <em>{review.reviewText}</em>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                <button onClick={() => handleAddToWishlist(tutor._id)}>Add to Wishlist</button>
                                <input
                                    type="date"
                                    min={today}
                                    value={booking[tutor._id]?.date || ''}
                                    onChange={(e) =>
                                        setBooking((prev) => ({
                                            ...prev,
                                            [tutor._id]: {
                                                ...prev[tutor._id],
                                                date: e.target.value
                                            }
                                        }))
                                    }
                                />

                                <input
                                    type="time"
                                    value={booking[tutor._id]?.time || ''}
                                    onChange={(e) =>
                                        setBooking((prev) => ({
                                            ...prev,
                                            [tutor._id]: {
                                                ...prev[tutor._id],
                                                time: e.target.value
                                            }
                                        }))
                                    }
                                />
                                <select
                                    value={booking[tutor._id]?.type || ''}
                                    onChange={(e) =>
                                        setBooking((prev) => ({
                                            ...prev,
                                            [tutor._id]: {
                                                ...prev[tutor._id],
                                                type: e.target.value
                                            }
                                        }))
                                    }
                                >
                                    <option value="">Select Session Type</option>
                                    <option value="online">Online</option>
                                    <option value="in-person">In-Person</option>
                                </select>

                                <button onClick={() => handleBookSession(tutor._id, tutor)}>
                                    Book Session
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
}
