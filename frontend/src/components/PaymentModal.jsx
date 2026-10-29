import React, { useState } from 'react';
import { api } from '../services/api';
import { X, CreditCard, ShieldCheck, AlertCircle } from 'lucide-react';

export default function PaymentModal({ reservation, onClose, onSuccess }) {
  const [method, setMethod] = useState('Visa •••• 4242 (Test Mode)');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePay = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.reservations.pay(reservation._id, { paymentMethod: method });
      if (res.success) {
        onSuccess(res.data);
      }
    } catch (err) {
      setError(err.message || 'Payment simulation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CreditCard size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '20px' }}>Secure Payment Simulation</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div
            style={{
              backgroundColor: 'var(--bg-light)',
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '20px',
              border: '1px solid var(--border-color)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '14px' }}>
              <span>Reservation Ref:</span>
              <strong>#{reservation._id.slice(-6).toUpperCase()}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '14px' }}>
              <span>Room:</span>
              <strong>{reservation.room?.title || 'Selected Suite'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 'bold' }}>
              <span>Total Amount:</span>
              <strong style={{ color: 'var(--primary-dark)' }}>${reservation.totalPrice.toFixed(2)}</strong>
            </div>
          </div>

          {error && (
            <div style={{ color: 'var(--danger)', fontSize: '14px', marginBottom: '16px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handlePay}>
            <div className="form-group">
              <label className="form-label">Select Test Payment Method</label>
              <select
                className="form-control"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
              >
                <option value="Visa •••• 4242 (Test Mode)">Visa •••• 4242 (Instant Approved)</option>
                <option value="MasterCard •••• 5521 (Test Mode)">MasterCard •••• 5521 (Instant Approved)</option>
                <option value="American Express •••• 3005 (Test Mode)">Amex •••• 3005 (Instant Approved)</option>
              </select>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '12px',
                color: 'var(--body-muted)',
                marginBottom: '24px'
              }}
            >
              <ShieldCheck size={16} color="var(--success)" />
              <span>Sandbox Test Mode: No real financial charges will be incurred.</span>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={onClose} className="btn btn-dark btn-sm">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
                {loading ? 'Processing...' : `Pay $${reservation.totalPrice.toFixed(2)}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

