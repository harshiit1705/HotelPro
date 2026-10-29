import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import PaymentModal from '../components/PaymentModal';
import { Calendar, CreditCard, XCircle, CheckCircle, Clock, MapPin, AlertCircle } from 'lucide-react';

export default function MyBookings() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingReservation, setPayingReservation] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [message, setMessage] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.reservations.getMy();
      if (res.success) {
        setReservations(res.data);
      }
    } catch (err) {
      console.error('Failed to load guest bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you wish to cancel this reservation? If paid, a simulated refund will be issued.')) {
      return;
    }

    setCancellingId(id);
    try {
      const res = await api.reservations.cancel(id, 'Cancelled via Guest Portal');
      if (res.success) {
        setMessage({ type: 'success', text: 'Reservation cancelled successfully.' });
        fetchBookings();
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to cancel reservation.' });
    } finally {
      setCancellingId(null);
    }
  };

  const handlePaymentSuccess = (updatedReservation) => {
    setPayingReservation(null);
    setMessage({ type: 'success', text: 'Payment completed successfully (Test Mode).' });
    fetchBookings();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Confirmed':
        return <span className="badge badge-confirmed">Confirmed</span>;
      case 'Checked-In':
        return <span className="badge badge-checkedin">Checked-In</span>;
      case 'Checked-Out':
        return <span className="badge badge-checkedout">Checked-Out</span>;
      case 'Cancelled':
        return <span className="badge badge-cancelled">Cancelled</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  const getPaymentBadge = (status) => {
    switch (status) {
      case 'Paid':
        return <span className="badge badge-paid">Paid</span>;
      case 'Unpaid':
        return <span className="badge badge-unpaid">Payment Due</span>;
      case 'Refunded':
        return <span className="badge badge-refunded">Refunded</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  return (
    <div>
      <section className="inner-hero" style={{ backgroundImage: 'url(/images/hero_2.jpg)' }}>
        <div className="hero-overlay"></div>
        <div className="container" style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          <h1 style={{ color: '#ffffff', fontSize: '46px' }}>My Reservations</h1>
          <ul className="breadcrumbs">
            <li><a href="/">Home</a></li>
            <li>&bull;</li>
            <li>Guest Portal</li>
          </ul>
        </div>
      </section>

      <section style={{ padding: '60px 0 100px' }}>
        <div className="container">
          {message && (
            <div
              style={{
                backgroundColor: message.type === 'success' ? 'var(--success-bg)' : 'var(--danger-bg)',
                color: message.type === 'success' ? 'var(--success)' : 'var(--danger)',
                padding: '14px 20px',
                borderRadius: '8px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
              <span>{message.text}</span>
            </div>
          )}

          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ fontSize: '28px' }}>Your Travel Itinerary</h2>
            <p style={{ color: 'var(--body-muted)', fontSize: '14px' }}>
              View reservation confirmations, check payment statuses, or manage upcoming stays.
            </p>
          </div>

          {loading ? (
            <div className="text-center" style={{ padding: '60px 0' }}>
              <p>Loading your reservation history...</p>
            </div>
          ) : reservations.length === 0 ? (
            <div
              className="text-center"
              style={{
                padding: '60px 20px',
                backgroundColor: 'var(--bg-light)',
                borderRadius: '12px',
                border: '1px dashed var(--border-color)'
              }}
            >
              <Calendar size={40} color="var(--primary)" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '24px', marginBottom: '8px' }}>No Active Bookings Found</h3>
              <p style={{ color: 'var(--body-text)', maxWidth: '450px', margin: '0 auto 20px' }}>
                You have not created any reservations yet. Browse our luxury suites and plan your next memorable escape.
              </p>
              <a href="/rooms" className="btn btn-primary btn-sm">
                Explore Rooms
              </a>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {reservations.map((res) => {
                const room = res.room;
                const canCancel = res.reservationStatus === 'Confirmed' || res.reservationStatus === 'Pending';
                const canPay = res.paymentStatus === 'Unpaid' && res.reservationStatus !== 'Cancelled';

                return (
                  <div
                    key={res._id}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid var(--border-color)',
                      boxShadow: 'var(--shadow-sm)',
                      padding: '24px',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                      gap: '24px',
                      alignItems: 'center'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                      <img
                        src={room?.images?.[0] || '/images/img_1.jpg'}
                        alt={room?.title}
                        style={{ width: '120px', height: '90px', borderRadius: '8px', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                          {getStatusBadge(res.reservationStatus)}
                          {getPaymentBadge(res.paymentStatus)}
                        </div>
                        <h3 style={{ fontSize: '20px', marginBottom: '4px' }}>
                          {room?.title || 'Luxury Suite'}
                        </h3>
                        <span style={{ fontSize: '13px', color: 'var(--body-muted)' }}>
                          Booking Ref: #{res._id.slice(-6).toUpperCase()} &bull; Room #{room?.roomNumber || 'N/A'}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Calendar size={15} color="var(--primary)" />
                        <span>
                          <strong>Check-In:</strong> {new Date(res.checkIn).toLocaleDateString()}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Calendar size={15} color="var(--primary)" />
                        <span>
                          <strong>Check-Out:</strong> {new Date(res.checkOut).toLocaleDateString()} ({res.totalNights} {res.totalNights === 1 ? 'night' : 'nights'})
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CreditCard size={15} color="var(--primary)" />
                        <span>
                          <strong>Grand Total:</strong> ${res.totalPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                      {canPay && (
                        <button
                          onClick={() => setPayingReservation(res)}
                          className="btn btn-primary btn-sm"
                        >
                          <CreditCard size={14} />
                          <span>Pay Now</span>
                        </button>
                      )}

                      {canCancel && (
                        <button
                          onClick={() => handleCancel(res._id)}
                          className="btn btn-dark btn-sm"
                          disabled={cancellingId === res._id}
                        >
                          <XCircle size={14} />
                          <span>{cancellingId === res._id ? 'Cancelling...' : 'Cancel Stay'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Payment simulation modal */}
      {payingReservation && (
        <PaymentModal
          reservation={payingReservation}
          onClose={() => setPayingReservation(null)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}

