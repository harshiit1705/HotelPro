import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import BookingBar from '../components/BookingBar';
import RoomCard from '../components/RoomCard';
import RoomDetailModal from '../components/RoomDetailModal';
import { Star, Award, Coffee, Utensils, Wifi, Sparkles, ArrowRight } from 'lucide-react';

export default function Home() {
  const [featuredRooms, setFeaturedRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const res = await api.rooms.getAll();
        if (res.success) {
          setFeaturedRooms(res.data.slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to load featured rooms:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchFeatured();
  }, []);

  const handleBookingSuccess = (reservation) => {
    setSelectedRoom(null);
    navigate('/my-bookings');
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section" style={{ backgroundImage: 'url(/images/hero_4.jpg)' }}>
        <div className="hero-overlay"></div>
        <div className="container">
          <div className="hero-content">
            <span className="hero-caption">
              Welcome to 5 <Star size={14} color="var(--primary)" fill="var(--primary)" style={{ display: 'inline' }} /> Luxury Hotel & Resort
            </span>
            <h1 className="hero-title">A Best Place To Stay</h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '18px', maxWidth: '650px', margin: '0 auto 30px' }}>
              Immerse yourself in unrivaled oceanfront serenity, bespoke hospitality, and lavish comfort designed for discerning travelers.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <Link to="/rooms" className="btn btn-primary">
                Explore All Rooms
              </Link>
              <Link to="/about" className="btn btn-outline-white">
                Our Story
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Check-Availability Bar */}
      <div className="container check-availability-wrapper">
        <BookingBar />
      </div>

      {/* Welcome / Story Teaser */}
      <section style={{ padding: '60px 0', backgroundColor: '#ffffff' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '50px', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <img
                src="/images/img_1.jpg"
                alt="Hotel Architecture"
                style={{ width: '100%', borderRadius: '12px', boxShadow: 'var(--shadow-md)' }}
              />
              <img
                src="/images/food-1.jpg"
                alt="Gourmet Dining"
                style={{
                  position: 'absolute',
                  bottom: '-30px',
                  right: '-20px',
                  width: '45%',
                  borderRadius: '10px',
                  border: '5px solid #ffffff',
                  boxShadow: 'var(--shadow-lg)'
                }}
              />
            </div>

            <div>
              <span className="text-uppercase letter-spacing-2" style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '13px' }}>
                Refined Luxury & Comfort
              </span>
              <h2 style={{ fontSize: '38px', margin: '12px 0 20px' }}>Welcome to HotelPro</h2>
              <p style={{ color: 'var(--body-text)', marginBottom: '20px', lineHeight: '1.8' }}>
                Nestled along pristine shores, HotelPro sets the gold standard for contemporary boutique hospitality. From personalized concierge services to award-winning culinary craft, each moment of your stay is tailored to transcend expectations.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Award color="var(--primary)" size={20} />
                  <strong style={{ fontSize: '14px', color: 'var(--dark)' }}>Prime Oceanfront View</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Utensils color="var(--primary)" size={20} />
                  <strong style={{ fontSize: '14px', color: 'var(--dark)' }}>Michelin-Inspired Chefs</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Wifi color="var(--primary)" size={20} />
                  <strong style={{ fontSize: '14px', color: 'var(--dark)' }}>Ultra-Fast Fiber Wi-Fi</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Sparkles color="var(--primary)" size={20} />
                  <strong style={{ fontSize: '14px', color: 'var(--dark)' }}>24/7 Room Concierge</strong>
                </div>
              </div>
              <Link to="/about" className="btn btn-outline-primary">
                Discover More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Rooms & Suites Section */}
      <section style={{ padding: '80px 0', backgroundColor: 'var(--bg-light)' }}>
        <div className="container">
          <div className="text-center" style={{ maxWidth: '650px', margin: '0 auto 50px' }}>
            <span className="text-uppercase letter-spacing-2" style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '13px' }}>
              Handcrafted Living Spaces
            </span>
            <h2 style={{ fontSize: '38px', margin: '10px 0 16px' }}>Signature Rooms &amp; Suites</h2>
            <p style={{ color: 'var(--body-text)' }}>
              Each residence embodies understated sophistication, custom Italian appointments, and breathtaking views designed for rest and inspiration.
            </p>
          </div>

          {loading ? (
            <div className="text-center" style={{ padding: '60px 0' }}>
              <p>Loading handpicked luxury rooms...</p>
            </div>
          ) : (
            <div className="rooms-grid">
              {featuredRooms.map((room) => (
                <RoomCard
                  key={room._id}
                  room={room}
                  onSelect={(r) => setSelectedRoom(r)}
                  onBook={(r) => setSelectedRoom(r)}
                />
              ))}
            </div>
          )}

          <div className="text-center" style={{ marginTop: '50px' }}>
            <Link to="/rooms" className="btn btn-dark">
              <span>View All Available Rooms</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Dining & Experience Showcase */}
      <section
        style={{
          position: 'relative',
          padding: '100px 0',
          backgroundImage: 'url(/images/hero_3.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: '#ffffff'
        }}
      >
        <div className="hero-overlay" style={{ background: 'rgba(0,0,0,0.65)' }}></div>
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className="text-center" style={{ maxWidth: '650px', margin: '0 auto 60px' }}>
            <span className="text-uppercase letter-spacing-2" style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '13px' }}>
              Culinary Artistry
            </span>
            <h2 style={{ fontSize: '38px', color: '#ffffff', margin: '10px 0 16px' }}>Our Restaurant &amp; Lounge</h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              From morning espresso to sunset cocktails and fine dining creations prepared with locally sourced coastal organic harvests.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
            <div style={{ backgroundColor: 'rgba(26, 26, 26, 0.85)', padding: '30px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '20px' }}>$35.00</span>
              <h3 style={{ color: '#ffffff', fontSize: '22px', margin: '10px 0' }}>Coastal Fish Moilee</h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>
                Pan-seared sea bass simmered gently in rich coconut milk, fresh curry leaves, and fragrant turmeric essence.
              </p>
            </div>

            <div style={{ backgroundColor: 'rgba(26, 26, 26, 0.85)', padding: '30px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '20px' }}>$28.00</span>
              <h3 style={{ color: '#ffffff', fontSize: '22px', margin: '10px 0' }}>Truffle Glazed Chicken</h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>
                Free-range organic chicken glazed with black winter truffle reduction, accompanied by roasted root vegetables.
              </p>
            </div>

            <div style={{ backgroundColor: 'rgba(26, 26, 26, 0.85)', padding: '30px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '20px' }}>$16.00</span>
              <h3 style={{ color: '#ffffff', fontSize: '22px', margin: '10px 0' }}>Artisanal Dessert Flight</h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>
                A curated selection of cardamom panna cotta, dark chocolate lava cake, and passion fruit sorbet.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Room Detail / Booking Modal */}
      {selectedRoom && (
        <RoomDetailModal
          room={selectedRoom}
          onClose={() => setSelectedRoom(null)}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
}

