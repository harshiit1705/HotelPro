import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Search, Filter, LogIn, LogOut, XCircle, Check, AlertCircle, Calendar, CreditCard, User } from 'lucide-react';

export default function ReservationsAdmin() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [actionMsg, setActionMsg] = useState(null);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const res = await api.admin.getReservations({
        status: statusFilter !== 'All' ? statusFilter : undefined,
        paymentStatus: paymentFilter !== 'All' ? paymentFilter : undefined,
        search: search || undefined
      });
      if (res.success) {
        setReservations(res.data);
      }
    } catch (err) {
      console.error('Failed to load reservations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [statusFilter, paymentFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchReservations();
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.admin.updateReservationStatus(id, newStatus);
      setActionMsg(`Reservation status updated to ${newStatus}.`);
      fetchReservations();
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleCancelBooking = async (id) => {
    const reason = prompt('Please specify reason for cancellation by administration:', 'Administrative operational adjustment');
    if (!reason) return;

    try {
      await api.admin.updateReservationStatus(id, 'Cancelled', reason);
      setActionMsg('Reservation marked as Cancelled. Simulated refund issued if applicable.');
      fetchReservations();
    } catch (err) {
      alert(err.message || 'Failed to cancel reservation');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <span className="text-uppercase letter-spacing-2" style={{ color: 'var(--primary-dark)', fontWeight: 'bold', fontSize: '12px' }}>
          Front Desk Operations
        </span>
        <h1 style={{ fontSize: '32px', margin: '4px 0 0' }}>Reservation Registry &amp; Guest Folios</h1>
      </div>

      {actionMsg && (
        <div
          style={{
            backgroundColor: 'var(--success-bg)',
            color: 'var(--success)',
            padding: '14px 20px',
            borderRadius: '8px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <Check size={18} />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div
        style={{
          backgroundColor: '#ffffff',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '24px',
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px', flex: 1, minWidth: '280px' }}>
          <input
            type="text"
            className="form-control"
            style={{ height: '44px' }}
            placeholder="Search by guest name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-dark btn-sm" style={{ padding: '0 20px', height: '44px' }}>
            <Search size={16} />
          </button>
        </form>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--dark)' }}>Status:</span>
            <select
              className="form-control"
              style={{ height: '44px', width: 'auto', padding: '0 12px' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Checked-In">Checked-In</option>
              <option value="Checked-Out">Checked-Out</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--dark)' }}>Payment:</span>
            <select
              className="form-control"
              style={{ height: '44px', width: 'auto', padding: '0 12px' }}
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
            >
              <option value="All">All Payments</option>
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
              <option value="Refunded">Refunded</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reservations Table */}
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Ref &amp; Guest</th>
              <th>Room</th>
              <th>Stay Dates</th>
              <th>Charges</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>
                  Loading reservations...
                </td>
              </tr>
            ) : reservations.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>
                  No reservations matching the selected filters.
                </td>
              </tr>
            ) : (
              reservations.map((res) => (
                <tr key={res._id}>
                  <td>
                    <strong>#{res._id.slice(-6).toUpperCase()}</strong>
                    <div style={{ fontWeight: '600', marginTop: '2px' }}>
                      {res.guestDetails?.name || res.user?.name}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--body-muted)' }}>
                      {res.guestDetails?.email || res.user?.email} &bull; {res.guestDetails?.phone || 'No phone'}
                    </div>
                    {res.guestDetails?.specialRequests && (
                      <div
                        style={{
                          fontSize: '11px',
                          backgroundColor: 'var(--bg-light)',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          marginTop: '4px',
                          color: 'var(--body-text)'
                        }}
                      >
                        <strong>Note:</strong> {res.guestDetails.specialRequests}
                      </div>
                    )}
                  </td>
                  <td>
                    {res.room ? (
                      <>
                        <strong>Room #{res.room.roomNumber}</strong>
                        <div style={{ fontSize: '12px', color: 'var(--body-muted)' }}>{res.room.title}</div>
                        <div style={{ fontSize: '11px', color: 'var(--body-muted)' }}>
                          {res.adults} Adults, {res.children} Children
                        </div>
                      </>
                    ) : (
                      <span style={{ color: 'var(--body-muted)' }}>Archived Room</span>
                    )}
                  </td>
                  <td style={{ fontSize: '13px' }}>
                    <div><strong>In:</strong> {new Date(res.checkIn).toLocaleDateString()}</div>
                    <div><strong>Out:</strong> {new Date(res.checkOut).toLocaleDateString()}</div>
                    <div style={{ fontSize: '11px', color: 'var(--body-muted)' }}>{res.totalNights} nights</div>
                  </td>
                  <td>
                    <strong style={{ fontSize: '15px', color: 'var(--dark)' }}>${res.totalPrice.toFixed(2)}</strong>
                    <div style={{ fontSize: '11px', color: 'var(--body-muted)' }}>
                      ${res.pricePerNight}/night + Tax/Fee
                    </div>
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
                    {res.paymentDetails?.method && (
                      <div style={{ fontSize: '10px', color: 'var(--body-muted)', marginTop: '2px' }}>
                        {res.paymentDetails.method}
                      </div>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {res.reservationStatus === 'Confirmed' && (
                        <button
                          onClick={() => handleUpdateStatus(res._id, 'Checked-In')}
                          className="btn btn-primary btn-sm"
                          style={{ fontSize: '11px', padding: '4px 10px' }}
                          title="Guest Arrival"
                        >
                          <LogIn size={12} />
                          <span>Check In</span>
                        </button>
                      )}

                      {res.reservationStatus === 'Checked-In' && (
                        <button
                          onClick={() => handleUpdateStatus(res._id, 'Checked-Out')}
                          className="btn btn-dark btn-sm"
                          style={{ fontSize: '11px', padding: '4px 10px' }}
                          title="Guest Departure"
                        >
                          <LogOut size={12} />
                          <span>Check Out</span>
                        </button>
                      )}

                      {(res.reservationStatus === 'Confirmed' || res.reservationStatus === 'Pending') && (
                        <button
                          onClick={() => handleCancelBooking(res._id)}
                          className="btn btn-sm"
                          style={{ fontSize: '11px', padding: '4px 10px', backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', border: 'none' }}
                          title="Cancel Reservation"
                        >
                          <XCircle size={12} />
                          <span>Cancel</span>
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

