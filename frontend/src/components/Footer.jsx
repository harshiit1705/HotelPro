import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Award, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <h4 className="footer-title">HotelPro Resort</h4>
            <p style={{ marginBottom: '16px', fontSize: '14px', lineHeight: '1.7' }}>
              Experience timeless elegance, coastal tranquility, and world-class luxury accommodations designed for refined travelers and unforgettable stays.
            </p>
            <div style={{ display: 'flex', gap: '8px', color: 'var(--primary)' }}>
              <Award size={18} />
              <span style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                5-Star Hospitality Standard
              </span>
            </div>
          </div>

          <div>
            <h4 className="footer-title">Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">Home Overview</Link></li>
              <li><Link to="/rooms">Rooms & Suites</Link></li>
              <li><Link to="/about">About Our Heritage</Link></li>
              <li><Link to="/contact">Concierge & Contact</Link></li>
              <li><Link to="/login">Guest & Staff Access</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-title">Accommodations</h4>
            <ul className="footer-links">
              <li><Link to="/rooms?type=Single">Single Deluxe</Link></li>
              <li><Link to="/rooms?type=Double">Double Queen Suite</Link></li>
              <li><Link to="/rooms?type=Family">Family Executive</Link></li>
              <li><Link to="/rooms?type=Presidential">Presidential Oceanfront</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-title">Concierge Desk</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <MapPin size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: '4px' }} />
                <span>98 West 21st Street, Suite 721, New York, NY 10016</span>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <Phone size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
                <span>(+1) 800-452-9800</span>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <Mail size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
                <span>concierge@hotelpro.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            &copy; {new Date().getFullYear()} HotelPro Booking & Management System. All rights reserved. Built with precision and care.
          </p>
        </div>
      </div>
    </footer>
  );
}

