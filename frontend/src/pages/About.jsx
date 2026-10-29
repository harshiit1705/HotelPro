import React from 'react';
import { Award, Compass, Heart, Shield, Users } from 'lucide-react';

export default function About() {
  return (
    <div>
      <section className="inner-hero" style={{ backgroundImage: 'url(/images/hero_2.jpg)' }}>
        <div className="hero-overlay"></div>
        <div className="container" style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          <h1 style={{ color: '#ffffff', fontSize: '46px' }}>Our Heritage &amp; Vision</h1>
          <ul className="breadcrumbs">
            <li><a href="/">Home</a></li>
            <li>&bull;</li>
            <li>About HotelPro</li>
          </ul>
        </div>
      </section>

      <section style={{ padding: '80px 0 60px' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '50px', alignItems: 'center' }}>
            <div>
              <span className="text-uppercase letter-spacing-2" style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '13px' }}>
                Fifty Years of Hospitality
              </span>
              <h2 style={{ fontSize: '36px', margin: '12px 0 20px' }}>Crafted for the Discerning Guest</h2>
              <p style={{ color: 'var(--body-text)', marginBottom: '16px', lineHeight: '1.8' }}>
                Founded with a timeless mission to offer an oasis of calm and refinement, HotelPro has welcomed generations of global voyagers, diplomats, artists, and families seeking authentic hospitality.
              </p>
              <p style={{ color: 'var(--body-text)', marginBottom: '24px', lineHeight: '1.8' }}>
                Every architectural angle, handcrafted timber beam, and coastal balcony is positioned to harmonize with the sweeping ocean tides, creating an effortless sanctuary away from the tempo of modern city life.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ padding: '16px', backgroundColor: 'var(--bg-light)', borderRadius: '8px' }}>
                  <Award size={24} color="var(--primary)" />
                  <h4 style={{ fontSize: '16px', margin: '8px 0 4px' }}>Global Luxury Awards</h4>
                  <p style={{ fontSize: '13px', color: 'var(--body-muted)' }}>Consecutively awarded 5 Stars for excellence in private guest service.</p>
                </div>
                <div style={{ padding: '16px', backgroundColor: 'var(--bg-light)', borderRadius: '8px' }}>
                  <Compass size={24} color="var(--primary)" />
                  <h4 style={{ fontSize: '16px', margin: '8px 0 4px' }}>Bespoke Expeditions</h4>
                  <p style={{ fontSize: '13px', color: 'var(--body-muted)' }}>Curated yacht charters, coastal walks, and culinary masterclasses.</p>
                </div>
              </div>
            </div>

            <div>
              <img
                src="/images/about_feature_image.png"
                alt="Hotel Heritage"
                style={{ width: '100%', borderRadius: '12px', boxShadow: 'var(--shadow-md)' }}
                onError={(e) => {
                  e.target.src = '/images/img_4.jpg';
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Leadership & Curators Section */}
      <section style={{ padding: '60px 0 100px', backgroundColor: 'var(--bg-light)' }}>
        <div className="container">
          <div className="text-center" style={{ maxWidth: '600px', margin: '0 auto 50px' }}>
            <span className="text-uppercase letter-spacing-2" style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '13px' }}>
              The Custodians
            </span>
            <h2 style={{ fontSize: '36px', margin: '10px 0 16px' }}>Leadership &amp; Concierge</h2>
            <p style={{ color: 'var(--body-text)' }}>
              Passionate professionals dedicated to perfecting the fine art of hospitality.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '30px' }}>
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', overflow: 'hidden', textAlign: 'center', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
              <img src="/images/person_1.jpg" alt="General Manager" style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '20px', marginBottom: '4px' }}>Jean-Luc Fontaine</h3>
              <span style={{ color: 'var(--primary-dark)', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase' }}>Managing Director</span>
              <p style={{ color: 'var(--body-muted)', fontSize: '13px', marginTop: '12px' }}>Over 25 years overseeing premier 5-star European and coastal boutique resorts.</p>
            </div>

            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', overflow: 'hidden', textAlign: 'center', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
              <img src="/images/person_2.jpg" alt="Executive Chef" style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '20px', marginBottom: '4px' }}>Elena Rostova</h3>
              <span style={{ color: 'var(--primary-dark)', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase' }}>Executive Head Chef</span>
              <p style={{ color: 'var(--body-muted)', fontSize: '13px', marginTop: '12px' }}>Trained in Lyon and Tokyo, pioneering our organic farm-to-table coastal gastronomy.</p>
            </div>

            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', overflow: 'hidden', textAlign: 'center', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
              <img src="/images/person_3.jpg" alt="Head Concierge" style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '20px', marginBottom: '4px' }}>Marcus Thorne</h3>
              <span style={{ color: 'var(--primary-dark)', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase' }}>Head Concierge &bull; Les Clefs d'Or</span>
              <p style={{ color: 'var(--body-muted)', fontSize: '13px', marginTop: '12px' }}>Master curator of bespoke guest experiences, private aviation, and excursions.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

