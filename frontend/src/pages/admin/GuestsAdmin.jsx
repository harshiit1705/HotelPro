import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Users, Mail, Phone, Calendar, DollarSign, Shield } from 'lucide-react';

export default function GuestsAdmin() {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGuests() {
      setLoading(true);
      try {
        const res = await api.admin.getGuests();
        if (res.success) {
          setGuests(res.data);
        }
      } catch (err) {
        console.error('Failed to load guest list:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchGuests();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <span className="text-uppercase letter-spacing-2" style={{ color: 'var(--primary-dark)', fontWeight: 'bold', fontSize: '12px' }}>
          Customer Relationship Records
        </span>
        <h1 style={{ fontSize: '32px', margin: '4px 0 0' }}>Registered Guests Directory</h1>
      </div>

      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Guest Profile</th>
              <th>Contact Details</th>
              <th>Member Since</th>
              <th>Lifetime Stays</th>
              <th>Total Revenue</th>
              <th>Last Reservation</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>
                  Loading guest profiles...
                </td>
              </tr>
            ) : guests.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>
                  No registered guests recorded yet.
                </td>
              </tr>
            ) : (
              guests.map((guest) => (
                <tr key={guest._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--primary-light)',
                          color: 'var(--primary-dark)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          fontSize: '15px'
                        }}
                      >
                        {guest.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <strong>{guest.name}</strong>
                        <div style={{ fontSize: '12px', color: 'var(--body-muted)' }}>
                          ID: #{guest._id.slice(-6).toUpperCase()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                      <Mail size={13} color="var(--primary)" />
                      <span>{guest.email}</span>
                    </div>
                    {guest.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', marginTop: '3px' }}>
                        <Phone size={13} color="var(--primary)" />
                        <span>{guest.phone}</span>
                      </div>
                    )}
                  </td>
                  <td style={{ fontSize: '13px' }}>
                    {new Date(guest.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <span
                      style={{
                        padding: '4px 10px',
                        backgroundColor: 'var(--bg-light)',
                        borderRadius: '50px',
                        fontWeight: 'bold',
                        fontSize: '13px',
                        border: '1px solid var(--border-color)'
                      }}
                    >
                      {guest.bookingCount} {guest.bookingCount === 1 ? 'Stay' : 'Stays'}
                    </span>
                  </td>
                  <td>
                    <strong style={{ color: 'var(--success)', fontSize: '15px' }}>
                      ${guest.totalSpent?.toFixed(2) || '0.00'}
                    </strong>
                  </td>
                  <td style={{ fontSize: '13px' }}>
                    {guest.lastBookingDate ? (
                      new Date(guest.lastBookingDate).toLocaleDateString()
                    ) : (
                      <span style={{ color: 'var(--body-muted)' }}>No bookings yet</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

