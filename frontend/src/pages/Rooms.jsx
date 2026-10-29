import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import RoomCard from '../components/RoomCard';
import RoomDetailModal from '../components/RoomDetailModal';
import BookingBar from '../components/BookingBar';
import { SlidersHorizontal, RefreshCw, AlertCircle } from 'lucide-react';

export default function Rooms() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  const guests = searchParams.get('guests') || '';
  const type = searchParams.get('type') || '';

  const fetchRooms = async (params = {}) => {
    setLoading(true);
    try {
      const res = await api.rooms.getAll(params);
      if (res.success) {
        setRooms(res.data);
      }
    } catch (err) {
      console.error('Failed to load rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms({
      checkIn,
      checkOut,
      guests,
      type
    });
  }, [checkIn, checkOut, guests, type]);

  const handleSearch = (newParams) => {
    const query = new URLSearchParams();
    if (newParams.checkIn) query.append('checkIn', newParams.checkIn);
    if (newParams.checkOut) query.append('checkOut', newParams.checkOut);
    if (newParams.guests) query.append('guests', newParams.guests);
    if (newParams.type && newParams.type !== 'All') query.append('type', newParams.type);

    navigate(`/rooms?${query.toString()}`);
  };

  const handleBookingSuccess = (reservation) => {
    setSelectedRoom(null);
    navigate('/my-bookings');
  };

  return (
    <div>
      {/* Inner Hero */}
      <section className="inner-hero" style={{ backgroundImage: 'url(/images/hero_1.jpg)' }}>
        <div className="hero-overlay"></div>
        <div className="container" style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          <h1 style={{ color: '#ffffff', fontSize: '46px' }}>Rooms &amp; Suites</h1>
          <ul className="breadcrumbs">
            <li><a href="/">Home</a></li>
            <li>&bull;</li>
            <li>Accommodations</li>
          </ul>
        </div>
      </section>

      {/* Filter / Search Bar */}
      <div className="container" style={{ marginTop: '-40px', position: 'relative', zIndex: 10 }}>
        <BookingBar
          initialValues={{ checkIn, checkOut, guests, type }}
          onSearch={handleSearch}
        />
      </div>

      {/* Room Results Section */}
      <section style={{ padding: '60px 0 100px' }}>
        <div className="container">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: '20px',
              borderBottom: '1px solid var(--border-color)',
              marginBottom: '30px'
            }}
          >
            <div>
              <h2 style={{ fontSize: '28px' }}>Available Living Spaces</h2>
              <p style={{ color: 'var(--body-muted)', fontSize: '14px' }}>
                {loading
                  ? 'Checking real-time calendar availability...'
                  : `Showing ${rooms.length} ${rooms.length === 1 ? 'room' : 'rooms'} matching your criteria`}
                {checkIn && checkOut && (
                  <span style={{ color: 'var(--primary-dark)', fontWeight: 'bold', marginLeft: '6px' }}>
                    for {checkIn} &rarr; {checkOut}
                  </span>
                )}
              </p>
            </div>

            {(checkIn || type || guests) && (
              <button
                onClick={() => navigate('/rooms')}
                className="btn btn-outline-primary btn-sm"
              >
                <RefreshCw size={14} />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          {loading ? (
            <div className="text-center" style={{ padding: '80px 0' }}>
              <p style={{ fontSize: '18px', color: 'var(--body-muted)' }}>Checking room availability...</p>
            </div>
          ) : rooms.length === 0 ? (
            <div
              className="text-center"
              style={{
                padding: '60px 20px',
                backgroundColor: 'var(--bg-light)',
                borderRadius: '12px',
                border: '1px dashed var(--border-color)'
              }}
            >
              <AlertCircle size={40} color="var(--primary)" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '24px', marginBottom: '8px' }}>No Rooms Available</h3>
              <p style={{ color: 'var(--body-text)', maxWidth: '500px', margin: '0 auto 24px' }}>
                All rooms matching your selected dates and guest count are fully reserved. Please consider alternate dates or adjusting your guest count.
              </p>
              <button onClick={() => navigate('/rooms')} className="btn btn-primary btn-sm">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="rooms-grid">
              {rooms.map((room) => (
                <RoomCard
                  key={room._id}
                  room={room}
                  onSelect={(r) => setSelectedRoom(r)}
                  onBook={(r) => setSelectedRoom(r)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Booking Modal */}
      {selectedRoom && (
        <RoomDetailModal
          room={selectedRoom}
          initialDates={{ checkIn, checkOut, guests }}
          onClose={() => setSelectedRoom(null)}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
}

