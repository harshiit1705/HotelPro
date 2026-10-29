import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Plus, Edit2, Power, Trash2, Check, X, AlertCircle } from 'lucide-react';

export default function RoomsAdmin() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    roomNumber: '',
    title: '',
    type: 'Deluxe',
    description: '',
    pricePerNight: '',
    maxGuests: 2,
    bedType: 'King Bed',
    sizeSqFt: 450,
    amenities: 'High-Speed Wi-Fi, Air Conditioning, Smart TV, Mini Bar',
    images: '/images/img_1.jpg',
    isFeatured: false
  });

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await api.rooms.getAll({ all: true });
      if (res.success) {
        setRooms(res.data);
      }
    } catch (err) {
      console.error('Failed to load rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const openCreateModal = () => {
    setEditingRoom(null);
    setFormData({
      roomNumber: '',
      title: '',
      type: 'Deluxe',
      description: '',
      pricePerNight: '',
      maxGuests: 2,
      bedType: 'King Bed',
      sizeSqFt: 450,
      amenities: 'High-Speed Wi-Fi, Air Conditioning, Smart TV, Mini Bar',
      images: '/images/img_1.jpg',
      isFeatured: false
    });
    setError(null);
    setModalOpen(true);
  };

  const openEditModal = (room) => {
    setEditingRoom(room);
    setFormData({
      roomNumber: room.roomNumber,
      title: room.title,
      type: room.type,
      description: room.description,
      pricePerNight: room.pricePerNight,
      maxGuests: room.maxGuests,
      bedType: room.bedType || 'King Bed',
      sizeSqFt: room.sizeSqFt || 450,
      amenities: room.amenities?.join(', ') || '',
      images: room.images?.join(', ') || '/images/img_1.jpg',
      isFeatured: room.isFeatured || false
    });
    setError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const payload = {
      ...formData,
      pricePerNight: Number(formData.pricePerNight),
      maxGuests: Number(formData.maxGuests),
      sizeSqFt: Number(formData.sizeSqFt),
      amenities: formData.amenities.split(',').map((s) => s.trim()).filter(Boolean),
      images: formData.images.split(',').map((s) => s.trim()).filter(Boolean)
    };

    try {
      if (editingRoom) {
        await api.rooms.update(editingRoom._id, payload);
        setSuccessMsg(`Room #${payload.roomNumber} updated successfully.`);
      } else {
        await api.rooms.create(payload);
        setSuccessMsg(`New Room #${payload.roomNumber} created successfully.`);
      }
      setModalOpen(false);
      fetchRooms();
    } catch (err) {
      setError(err.message || 'Operation failed');
    }
  };

  const handleToggleActive = async (id, roomNumber, currentStatus) => {
    try {
      await api.rooms.toggleActive(id);
      setSuccessMsg(`Room #${roomNumber} is now ${currentStatus ? 'Deactivated' : 'Active'}.`);
      fetchRooms();
    } catch (err) {
      alert(err.message || 'Failed to toggle status');
    }
  };

  const handleDelete = async (id, roomNumber) => {
    if (!window.confirm(`Are you sure you want to permanently delete Room #${roomNumber}?`)) {
      return;
    }

    try {
      await api.rooms.delete(id);
      setSuccessMsg(`Room #${roomNumber} deleted successfully.`);
      fetchRooms();
    } catch (err) {
      alert(err.message || 'Cannot delete room with active reservations.');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px' }}>
        <div>
          <span className="text-uppercase letter-spacing-2" style={{ color: 'var(--primary-dark)', fontWeight: 'bold', fontSize: '12px' }}>
            Inventory Management
          </span>
          <h1 style={{ fontSize: '32px', margin: '4px 0 0' }}>Hotel Rooms &amp; Living Spaces</h1>
        </div>

        <button onClick={openCreateModal} className="btn btn-primary btn-sm">
          <Plus size={16} />
          <span>Add New Room</span>
        </button>
      </div>

      {successMsg && (
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
          <span>{successMsg}</span>
        </div>
      )}

      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Room #</th>
              <th>Image</th>
              <th>Title &amp; Type</th>
              <th>Nightly Rate</th>
              <th>Capacity</th>
              <th>Bed Type</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '30px' }}>
                  Loading room inventory...
                </td>
              </tr>
            ) : rooms.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '30px' }}>
                  No rooms cataloged yet. Click "Add New Room" to create one.
                </td>
              </tr>
            ) : (
              rooms.map((room) => (
                <tr key={room._id} style={{ opacity: room.isActive ? 1 : 0.65 }}>
                  <td>
                    <strong>#{room.roomNumber}</strong>
                    {room.isFeatured && (
                      <span style={{ display: 'block', fontSize: '10px', color: 'var(--primary-dark)', fontWeight: 'bold' }}>
                        FEATURED
                      </span>
                    )}
                  </td>
                  <td>
                    <img
                      src={room.images?.[0] || '/images/img_1.jpg'}
                      alt={room.title}
                      style={{ width: '60px', height: '45px', objectFit: 'cover', borderRadius: '4px' }}
                      onError={(e) => {
                        e.target.src = '/images/img_1.jpg';
                      }}
                    />
                  </td>
                  <td>
                    <strong>{room.title}</strong>
                    <div style={{ fontSize: '12px', color: 'var(--body-muted)' }}>{room.type} Suite</div>
                  </td>
                  <td>
                    <strong style={{ color: 'var(--primary-dark)' }}>${room.pricePerNight}</strong>
                  </td>
                  <td>{room.maxGuests} Guests</td>
                  <td style={{ fontSize: '13px' }}>{room.bedType || 'King'}</td>
                  <td>
                    {room.isActive ? (
                      <span className="badge badge-paid">Active</span>
                    ) : (
                      <span className="badge badge-cancelled">Inactive</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => openEditModal(room)}
                        className="btn btn-dark btn-sm"
                        style={{ padding: '6px 10px' }}
                        title="Edit Room Specifications"
                      >
                        <Edit2 size={13} />
                      </button>

                      <button
                        onClick={() => handleToggleActive(room._id, room.roomNumber, room.isActive)}
                        className="btn btn-outline-primary btn-sm"
                        style={{ padding: '6px 10px' }}
                        title={room.isActive ? 'Deactivate Room' : 'Activate Room'}
                      >
                        <Power size={13} />
                      </button>

                      <button
                        onClick={() => handleDelete(room._id, room.roomNumber)}
                        className="btn btn-sm"
                        style={{ padding: '6px 10px', backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', border: 'none' }}
                        title="Delete Room"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Room Modal */}
      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '22px' }}>
                {editingRoom ? `Edit Room #${editingRoom.roomNumber}` : 'Catalog New Room Listing'}
              </h3>
              <button className="modal-close-btn" onClick={() => setModalOpen(false)}>
                <X size={22} />
              </button>
            </div>

            <div className="modal-body">
              {error && (
                <div
                  style={{
                    backgroundColor: 'var(--danger-bg)',
                    color: 'var(--danger)',
                    padding: '12px',
                    borderRadius: '6px',
                    marginBottom: '20px',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px', marginBottom: '16px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Room Number</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.roomNumber}
                      onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                      placeholder="e.g. 101"
                      required
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Title / Heading</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Oceanfront Executive Suite"
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Room Type</label>
                    <select
                      className="form-control"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                      <option value="Single">Single</option>
                      <option value="Double">Double</option>
                      <option value="Suite">Suite</option>
                      <option value="Deluxe">Deluxe</option>
                      <option value="Family">Family</option>
                      <option value="Presidential">Presidential</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Nightly Rate ($)</label>
                    <input
                      type="number"
                      min="0"
                      className="form-control"
                      value={formData.pricePerNight}
                      onChange={(e) => setFormData({ ...formData, pricePerNight: e.target.value })}
                      placeholder="180"
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Max Capacity</label>
                    <input
                      type="number"
                      min="1"
                      className="form-control"
                      value={formData.maxGuests}
                      onChange={(e) => setFormData({ ...formData, maxGuests: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Bedding Arrangement</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.bedType}
                      onChange={(e) => setFormData({ ...formData, bedType: e.target.value })}
                      placeholder="e.g. 1 California King"
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Size (Sq Ft)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.sizeSqFt}
                      onChange={(e) => setFormData({ ...formData, sizeSqFt: e.target.value })}
                      placeholder="550"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Provide a luxurious description highlighting space, light, and appointments..."
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Amenities (Comma separated)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.amenities}
                    onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                    placeholder="High-Speed Wi-Fi, Ocean Balcony, Rain Shower, Mini Bar"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Image Paths (Comma separated)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.images}
                    onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                    placeholder="/images/img_1.jpg, /images/slider-1.jpg"
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--primary-dark)' }}
                  />
                  <label htmlFor="isFeatured" style={{ fontSize: '14px', cursor: 'pointer' }}>
                    Feature this room prominently on the homepage
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setModalOpen(false)} className="btn btn-dark btn-sm">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm">
                    {editingRoom ? 'Save Changes' : 'Publish Listing'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

