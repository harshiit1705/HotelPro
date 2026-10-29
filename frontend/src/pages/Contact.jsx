import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from 'lucide-react';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  return (
    <div>
      <section className="inner-hero" style={{ backgroundImage: 'url(/images/hero_4.jpg)' }}>
        <div className="hero-overlay"></div>
        <div className="container" style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          <h1 style={{ color: '#ffffff', fontSize: '46px' }}>Concierge &amp; Inquiries</h1>
          <ul className="breadcrumbs">
            <li><a href="/">Home</a></li>
            <li>&bull;</li>
            <li>Get in Touch</li>
          </ul>
        </div>
      </section>

      <section style={{ padding: '80px 0 100px' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '60px' }}>
            {/* Contact Form */}
            <div
              style={{
                backgroundColor: '#ffffff',
                padding: '40px',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>Send Us a Message</h2>
              <p style={{ color: 'var(--body-muted)', marginBottom: '24px', fontSize: '14px' }}>
                Our 24-hour concierge team is at your disposal for private inquiries and reservations.
              </p>

              {submitted && (
                <div
                  style={{
                    backgroundColor: 'var(--success-bg)',
                    color: 'var(--success)',
                    padding: '14px 18px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '14px'
                  }}
                >
                  <CheckCircle size={18} />
                  <span>Thank you! Your message has been received by our concierge desk. We will respond promptly.</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Your Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Your Message</label>
                  <textarea
                    className="form-control"
                    rows="5"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Inquire about special dates, private dining, or bespoke services..."
                    required
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  <Send size={15} />
                  <span>Send Message</span>
                </button>
              </form>
            </div>

            {/* Information Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', justifyContent: 'center' }}>
              <div>
                <span className="text-uppercase letter-spacing-2" style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '13px' }}>
                  Direct Channels
                </span>
                <h3 style={{ fontSize: '32px', margin: '8px 0 16px' }}>We Are Here To Assist You</h3>
                <p style={{ color: 'var(--body-text)', lineHeight: '1.8' }}>
                  Whether planning an executive retreat, destination wedding, or tranquil weekend break, our hospitality team will coordinate every nuance.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <MapPin color="var(--primary-dark)" size={22} />
                  </div>
                  <div>
                    <strong style={{ fontSize: '16px', color: 'var(--dark)', display: 'block' }}>Resort Address</strong>
                    <span style={{ color: 'var(--body-text)', fontSize: '14px' }}>98 West 21st Street, Suite 721, New York NY 10016</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Phone color="var(--primary-dark)" size={20} />
                  </div>
                  <div>
                    <strong style={{ fontSize: '16px', color: 'var(--dark)', display: 'block' }}>Reservations Hotline</strong>
                    <span style={{ color: 'var(--body-text)', fontSize: '14px' }}>(+1) 800-452-9800 &bull; (+1) 435-3533</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Mail color="var(--primary-dark)" size={20} />
                  </div>
                  <div>
                    <strong style={{ fontSize: '16px', color: 'var(--dark)', display: 'block' }}>Email Concierge</strong>
                    <span style={{ color: 'var(--body-text)', fontSize: '14px' }}>concierge@hotelpro.com</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Clock color="var(--primary-dark)" size={20} />
                  </div>
                  <div>
                    <strong style={{ fontSize: '16px', color: 'var(--dark)', display: 'block' }}>Front Desk Hours</strong>
                    <span style={{ color: 'var(--body-text)', fontSize: '14px' }}>Open 24 Hours &bull; 7 Days a Week</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

