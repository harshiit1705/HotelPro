import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { X, Check, Calendar, Users, DollarSign, ShieldAlert, CreditCard } from 'lucide-react';

export default function RoomDetailModal({ room, initialDates = {}, onClose, onSuccess }) {
  const { user, isAuthenticated } = useAuth();

  // Helper for formatting date
  const formatDate = (date) => {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    return [year, month, day].join('-');
  };

  const todayStr = formatDate(new Date());
  const defaultCheckOut = new Date();
  defaultCheckOut.setDate(defaultCheckOut.getDate() + 2);
  const defaultCheckOutStr = formatDate(defaultCheckOut);

  const [checkIn, setCheckIn] = useState(initialDates.checkIn || todayStr);
  const [checkOut, setCheckOut] = useState(initialDates.checkOut || defaultCheckOutStr);
  const [adults, setAdults] = useState(initialDates.adults || 2);
  const [children, setChildren] = useState(initialDates.children || 0);

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [specialRequests, setSpecialRequests] = useState('');
  const [simulatePayment, setSimulatePayment] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Price calculation preview
  const calcNights = () => {
    const d1 = new Date(checkIn);
    const d2 = new Date(checkOut);
    const diff = Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  };

  const nights = calcNights();
  const subtotal = Math.round(room.pricePerNight * nights * 100) / 100;
  const tax = Math.round(subtotal * 0.1 * 100) / 100;
  const serviceFee = 25;
  const total = Math.round((subtotal + tax + serviceFee) * 100) / 100;

  const handleBooking = async (e) => {
    e.preventDefault();
    setError(null);

    if (!isAuthenticated) {
      setError('Please sign in or create a guest account to complete your reservation.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        roomId: room._id,
        checkIn,
        checkOut,
        adults: Number(adults),
        children: Number(children),
        guestDetails: {
          name,
          email,
          phone,
          specialRequests
        },
        simulatePayment
      };

      const res = await api.reservations.create(payload);
      if (res.success) {
        onSuccess(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to complete reservation. Room may be unavailable for these dates.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '24px' }}>{room.title}</h3>
            <span style={{ fontSize: '13px', color: 'var(--primary-dark)', fontWeight: 'bold' }}>
              Room #{room.roomNumber} &bull; {room.type} Suite
            </span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          {/* Gallery Preview */}
          <div style={{ borderRadius: '8px', overflow: 'hidden', height: '280px', marginBottom: '24px' }}>
            <img
              src={room.images?.[0] || '/images/img_1.jpg'}
              alt={room.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                e.target.src = '/images/img_1.jpg';
              }}
            />
          </div>

          <p style={{ marginBottom: '20px', lineHeight: '1.7' }}>{room.description}</p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px',
              padding: '16px',
              backgroundColor: 'var(--bg-light)',
              borderRadius: '8px',
              marginBottom: '24px',
              textAlign: 'center'
            }}
          >
            <div>
              <span style={{ fontSize: '12px', color: 'var(--body-muted)', textTransform: 'uppercase' }}>Nightly Rate</span>
              <p style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--primary-dark)' }}>${room.pricePerNight}</p>
            </div>
            <div>
              <span style={{ fontSize: '12px', color: 'var(--body-muted)', textTransform: 'uppercase' }}>Capacity</span>
              <p style={{ fontSize: '18px', fontWeight: 'bold' }}>{room.maxGuests} Guests</p>
            </div>
            <div>
              <span style={{ fontSize: '12px', color: 'var(--body-muted)', textTransform: 'uppercase' }}>Bed Type</span>
              <p style={{ fontSize: '18px', fontWeight: 'bold' }}>{room.bedType || 'King'}</p>
            </div>
          </div>

          <h4 style={{ fontSize: '18px', marginBottom: '12px' }}>Included Luxury Amenities</h4>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '8px',
              marginBottom: '30px'
            }}
          >
            {room.amenities?.map((amenity, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                <Check size={16} color="var(--primary)" />
                <span>{amenity}</span>
              </div>
            ))}
          </div>

          <hr style={{ borderColor: 'var(--border-color)', margin: '24px 0' }} />

          <h4 style={{ fontSize: '20px', marginBottom: '16px' }}>Reserve Your Stay</h4>

          {error && (
            <div
              style={{
                backgroundColor: 'var(--danger-bg)',
                color: 'var(--danger)',
                padding: '12px 16px',
                borderRadius: '6px',
                marginBottom: '20px',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <ShieldAlert size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleBooking}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Check-In Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={checkIn}
                  min={todayStr}
                  onChange={(e) => setCheckIn(e.target.value)}
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Check-Out Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={checkOut}
                  min={checkIn || todayStr}
                  onChange={(e) => setCheckOut(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Adults</label>
                <select
                  className="form-control"
                  value={adults}
                  onChange={(e) => setAdults(Number(e.target.value))}
                >
                  <option value="1">1 Adult</option>
                  <option value="2">2 Adults</option>
                  <option value="3">3 Adults</option>
                  <option value="4">4 Adults</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Children</label>
                <select
                  className="form-control"
                  value={children}
                  onChange={(e) => setChildren(Number(e.target.value))}
                >
                  <option value="0">0 Children</option>
                  <option value="1">1 Child</option>
                  <option value="2">2 Children</option>
                  <option value="3">3 Children</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Guest Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Eleanor Vance"
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. eleanor@example.com"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Contact Phone</label>
              <input
                type="tel"
                className="form-control"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Special Requests or Preferences</label>
              <textarea
                className="form-control"
                rows="2"
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="High floor, quiet corner, early arrival, airport transfer, etc."
              />
            </div>

            {/* Price Breakdown Box */}
            <div
              style={{
                backgroundColor: 'var(--bg-light)',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                marginBottom: '24px'
              }}
            >
              <h5 style={{ fontSize: '15px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>
                Transparent Pricing Breakdown
              </h5>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                <span>${room.pricePerNight} &times; {nights} {nights === 1 ? 'night' : 'nights'}</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                <span>Hotel Occupancy Tax (10%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                <span>Resort & Concierge Fee</span>
                <span>${serviceFee.toFixed(2)}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '12px',
                  marginTop: '12px',
                  borderTop: '2px solid var(--border-color)',
                  fontWeight: 'bold',
                  fontSize: '18px',
                  color: 'var(--dark)'
                }}
              >
                <span>Estimated Total</span>
                <span style={{ color: 'var(--primary-dark)' }}>${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment simulation toggle */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 18px',
                backgroundColor: 'var(--primary-light)',
                borderRadius: '8px',
                border: '1px solid var(--primary-border)',
                marginBottom: '24px'
              }}
            >
              <input
                type="checkbox"
                id="simulatePayment"
                checked={simulatePayment}
                onChange={(e) => setSimulatePayment(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--primary-dark)' }}
              />
              <label htmlFor="simulatePayment" style={{ fontSize: '14px', color: 'var(--dark)', cursor: 'pointer' }}>
                <strong>Confirm Instant Payment (Test Mode Simulation)</strong>
                <span style={{ display: 'block', fontSize: '12px', color: 'var(--body-muted)' }}>
                  Marks payment as 'Paid' via simulated test card. Leave unchecked to pay at desk upon arrival.
                </span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={onClose} className="btn btn-dark btn-sm">
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Processing Reservation...' : `Confirm Reservation &bull; $${total.toFixed(2)}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

