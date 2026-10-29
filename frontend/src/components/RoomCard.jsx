import React from 'react';
import { Users, Maximize2, Bed, ArrowRight } from 'lucide-react';

export default function RoomCard({ room, onSelect, onBook }) {
  const imageSrc = room.images && room.images.length > 0 ? room.images[0] : '/images/img_1.jpg';

  return (
    <div className="room-card">
      <div className="img-wrap">
        <img
          src={imageSrc}
          alt={room.title}
          onError={(e) => {
            e.target.src = '/images/img_1.jpg';
          }}
        />
        <span className="room-type-badge">{room.type}</span>
      </div>

      <div className="room-card-body">
        <h3 className="room-card-title">{room.title}</h3>
        <span className="room-price-tag">${room.pricePerNight} / per night</span>

        <div className="room-meta-row">
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Users size={14} color="var(--primary)" /> Up to {room.maxGuests} Guests
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Bed size={14} color="var(--primary)" /> {room.bedType || 'King Bed'}
          </span>
          {room.sizeSqFt && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Maximize2 size={13} color="var(--primary)" /> {room.sizeSqFt} sq ft
            </span>
          )}
        </div>

        <div className="room-amenities-tags">
          {room.amenities?.slice(0, 4).map((amenity, idx) => (
            <span key={idx} className="amenity-tag">
              {amenity}
            </span>
          ))}
          {room.amenities?.length > 4 && (
            <span className="amenity-tag" style={{ color: 'var(--primary-dark)', fontWeight: 'bold' }}>
              +{room.amenities.length - 4} more
            </span>
          )}
        </div>

        <div className="room-card-actions">
          <button
            onClick={() => onSelect(room)}
            className="btn btn-dark btn-sm"
            style={{ flex: 1 }}
          >
            Details
          </button>
          <button
            onClick={() => onBook(room)}
            className="btn btn-primary btn-sm"
            style={{ flex: 1 }}
          >
            <span>Book Now</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

