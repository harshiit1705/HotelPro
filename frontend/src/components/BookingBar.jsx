import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Home, Search } from 'lucide-react';

export default function BookingBar({ initialValues = {}, onSearch = null }) {
  const navigate = useNavigate();

  // Helper for formatting date to YYYY-MM-DD
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

  const [checkIn, setCheckIn] = useState(initialValues.checkIn || todayStr);
  const [checkOut, setCheckOut] = useState(initialValues.checkOut || defaultCheckOutStr);
  const [adults, setAdults] = useState(initialValues.adults || 2);
  const [children, setChildren] = useState(initialValues.children || 0);
  const [type, setType] = useState(initialValues.type || 'All');

  const handleSubmit = (e) => {
    e.preventDefault();

    const searchParams = {
      checkIn,
      checkOut,
      guests: Number(adults) + Number(children),
      adults,
      children,
      type
    };

    if (onSearch) {
      onSearch(searchParams);
    } else {
      const query = new URLSearchParams({
        checkIn,
        checkOut,
        guests: Number(adults) + Number(children),
        adults,
        children,
        type: type !== 'All' ? type : ''
      }).toString();

      navigate(`/rooms?${query}`);
    }
  };

  return (
    <div className="block-32">
      <form onSubmit={handleSubmit} className="booking-form-grid">
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={14} color="var(--primary)" /> Check In
          </label>
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
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={14} color="var(--primary)" /> Check Out
          </label>
          <input
            type="date"
            className="form-control"
            value={checkOut}
            min={checkIn || todayStr}
            onChange={(e) => setCheckOut(e.target.value)}
            required
          />
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Users size={14} color="var(--primary)" /> Guests
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <select
              className="form-control"
              value={adults}
              onChange={(e) => setAdults(Number(e.target.value))}
              title="Adults"
            >
              <option value="1">1 Adult</option>
              <option value="2">2 Adults</option>
              <option value="3">3 Adults</option>
              <option value="4">4+ Adults</option>
            </select>
            <select
              className="form-control"
              value={children}
              onChange={(e) => setChildren(Number(e.target.value))}
              title="Children"
            >
              <option value="0">0 Kids</option>
              <option value="1">1 Kid</option>
              <option value="2">2 Kids</option>
              <option value="3">3+ Kids</option>
            </select>
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Home size={14} color="var(--primary)" /> Room Type
          </label>
          <select
            className="form-control"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="All">All Room Types</option>
            <option value="Single">Single Room</option>
            <option value="Double">Double Room</option>
            <option value="Suite">Suite</option>
            <option value="Deluxe">Deluxe Room</option>
            <option value="Family">Family Suite</option>
            <option value="Presidential">Presidential Suite</option>
          </select>
        </div>

        <div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '50px' }}>
            <Search size={16} />
            <span>Check Availability</span>
          </button>
        </div>
      </form>
    </div>
  );
}

