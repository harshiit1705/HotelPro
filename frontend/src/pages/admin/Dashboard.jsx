import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { TrendingUp, BedDouble, CalendarCheck, DollarSign, Users, LogIn, LogOut, CheckCircle, RefreshCw } from 'lucide-react';

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMetrics = async () => {
    setRefreshing(true);
    try {
      const res = await api.admin.getMetrics();
      if (res.success) {
        setMetrics(res.data);
      }
    } catch (err) {
      console.error('Failed to load admin metrics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleQuickStatus = async (id, newStatus) => {
    try {
      await api.admin.updateReservationStatus(id, newStatus);
      fetchMetrics();
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="text-center" style={{ padding: '80px 0' }}>
        <p>Loading administrative dashboard metrics...</p>
      </div>
    );
  }

  const { rooms, occupancy, reservations, financials, guests, recentReservations } = metrics || {
    rooms: { total: 0, active: 0, inactive: 0 },
    occupancy: { rate: 0, occupiedRooms: 0, availableRooms: 0 },
    reservations: { total: 0, confirmed: 0, checkedIn: 0, checkedOut: 0, cancelled: 0, todayCheckIns: 0, todayCheckOuts: 0 },
    financials: { totalRevenue: 0 },
    guests: { total: 0 },
    recentReservations: []
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px' }}>
        <div>
          <span className="text-uppercase letter-spacing-2" style={{ color: 'var(--primary-dark)', fontWeight: 'bold', fontSize: '12px' }}>
            Operations &amp; Intelligence
          </span>
          <h1 style={{ fontSize: '32px', margin: '4px 0 0' }}>Hotel Administration Dashboard</h1>
        </div>

        <button
          onClick={fetchMetrics}
          className="btn btn-outline-primary btn-sm"
          disabled={refreshing}
        >
          <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
          <span>{refreshing ? 'Updating...' : 'Refresh Metrics'}</span>
        </button>
      </div>

      {/* KPI Metrics Cards */}
      <div className="admin-metrics-grid">
        <div className="metric-card">
          <div>
            <span style={{ fontSize: '13px', color: 'var(--body-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Occupancy Rate
            </span>
            <div className="metric-val">{occupancy.rate}%</div>
            <span style={{ fontSize: '12px', color: 'var(--body-text)' }}>
              {occupancy.occupiedRooms} occupied / {rooms.active} active rooms
            </span>
          </div>
          <div className="metric-icon-wrap">
            <TrendingUp size={24} />
          </div>
        </div>

        <div className="metric-card">
          <div>
            <span style={{ fontSize: '13px', color: 'var(--body-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Recorded Revenue
            </span>
            <div className="metric-val">${financials.totalRevenue.toLocaleString()}</div>
            <span style={{ fontSize: '12px', color: 'var(--success)' }}>
              Derived from verified paid stays
            </span>
          </div>
          <div className="metric-icon-wrap" style={{ backgroundColor: '#e8f5e9', color: '#2e7d32' }}>
            <DollarSign size={24} />
          </div>
        </div>

        <div className="metric-card">
          <div>
            <span style={{ fontSize: '13px', color: 'var(--body-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Room Listings
            </span>
            <div className="metric-val">{rooms.active}</div>
            <span style={{ fontSize: '12px', color: 'var(--body-text)' }}>
              {rooms.total} total ({rooms.inactive} deactivated)
            </span>
          </div>
          <div className="metric-icon-wrap" style={{ backgroundColor: '#e1f5fe', color: '#0288d1' }}>
            <BedDouble size={24} />
          </div>
        </div>

        <div className="metric-card">
          <div>
            <span style={{ fontSize: '13px', color: 'var(--body-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Registered Guests
            </span>
            <div className="metric-val">{guests.total}</div>
            <span style={{ fontSize: '12px', color: 'var(--body-text)' }}>
              {reservations.total} lifetime bookings
            </span>
          </div>
          <div className="metric-icon-wrap" style={{ backgroundColor: '#fff3e0', color: '#ef6c00' }}>
            <Users size={24} />
          </div>
        </div>
      </div>

      {/* Operational Highlights Banner */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '20px',
          backgroundColor: '#ffffff',
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '36px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LogIn size={22} color="var(--primary-dark)" />
          </div>
          <div>
            <strong style={{ fontSize: '18px', display: 'block' }}>{reservations.todayCheckIns} Expected Check-Ins</strong>
            <span style={{ fontSize: '13px', color: 'var(--body-muted)' }}>Scheduled arrivals for today</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#e1f5fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LogOut size={22} color="#0288d1" />
          </div>
          <div>
            <strong style={{ fontSize: '18px', display: 'block' }}>{reservations.todayCheckOuts} Expected Check-Outs</strong>
            <span style={{ fontSize: '13px', color: 'var(--body-muted)' }}>Departures scheduled for today</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle size={22} color="#2e7d32" />
          </div>
          <div>
            <strong style={{ fontSize: '18px', display: 'block' }}>{reservations.checkedIn} Currently In-House</strong>
            <span style={{ fontSize: '13px', color: 'var(--body-muted)' }}>Active guests currently checked in</span>
          </div>
        </div>
      </div>

      {/* Recent Reservations Table */}
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: '22px' }}>Recent Reservations &amp; Front Desk Queue</h3>
        <Link to="/admin/reservations" className="btn btn-outline-primary btn-sm">
          View All Reservations
        </Link>
      </div>

      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Ref #</th>
              <th>Guest</th>
              <th>Room</th>
              <th>Stay Dates</th>
              <th>Total</th>
              <th>Reservation Status</th>
              <th>Payment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {recentReservations?.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '30px' }}>
                  No reservations recorded yet.
                </td>
              </tr>
            ) : (
              recentReservations?.map((res) => (
                <tr key={res._id}>
                  <td>
                    <strong>#{res._id.slice(-6).toUpperCase()}</strong>
                  </td>
                  <td>
                    <strong>{res.guestDetails?.name || res.user?.name}</strong>
                    <div style={{ fontSize: '12px', color: 'var(--body-muted)' }}>
                      {res.guestDetails?.email || res.user?.email}
                    </div>
                  </td>
                  <td>
                    {res.room ? (
                      <>
                        <strong>Room #{res.room.roomNumber}</strong>
                        <div style={{ fontSize: '12px', color: 'var(--body-muted)' }}>{res.room.title}</div>
                      </>
                    ) : (
                      <span style={{ color: 'var(--body-muted)' }}>Deactivated</span>
                    )}
                  </td>
                  <td style={{ fontSize: '13px' }}>
                    {new Date(res.checkIn).toLocaleDateString()} &rarr; {new Date(res.checkOut).toLocaleDateString()}
                    <div style={{ color: 'var(--body-muted)', fontSize: '11px' }}>{res.totalNights} nights</div>
                  </td>
                  <td>
                    <strong>${res.totalPrice.toFixed(2)}</strong>
                  </td>
                  <td>
                    <span className={`badge badge-${res.reservationStatus.toLowerCase().replace('-', '')}`}>
                      {res.reservationStatus}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${res.paymentStatus.toLowerCase().replace('-', '')}`}>
                      {res.paymentStatus}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {res.reservationStatus === 'Confirmed' && (
                        <button
                          onClick={() => handleQuickStatus(res._id, 'Checked-In')}
                          className="btn btn-primary btn-sm"
                          style={{ fontSize: '11px', padding: '4px 10px' }}
                          title="Perform Check-In"
                        >
                          Check In
                        </button>
                      )}
                      {res.reservationStatus === 'Checked-In' && (
                        <button
                          onClick={() => handleQuickStatus(res._id, 'Checked-Out')}
                          className="btn btn-dark btn-sm"
                          style={{ fontSize: '11px', padding: '4px 10px' }}
                          title="Perform Check-Out"
                        >
                          Check Out
                        </button>
                      )}
                    </div>
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

