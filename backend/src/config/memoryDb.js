/**
 * HotelPro In-Memory Database Engine
 * Provides full Mongoose-compatible persistence and query capabilities
 * when an external MongoDB daemon is not currently active.
 * Switches seamlessly to real MongoDB whenever MONGODB_URI is available.
 */

const bcrypt = require('bcryptjs');

let users = [];
let rooms = [];
let reservations = [];
let idCounter = 1000;

function generateId() {
  idCounter += 1;
  return `507f1f77bcf86cd79943${idCounter.toString(16).padStart(4, '0')}`;
}

// User Document
class UserDoc {
  constructor(data) {
    this._id = (data._id ? data._id.toString() : null) || generateId();
    this.name = data.name;
    this.email = data.email ? data.email.toLowerCase() : '';
    this.password = data.password;
    this.phone = data.phone || '';
    this.role = data.role || 'guest';
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
  }

  async matchPassword(enteredPassword) {
    if (!this.password) return false;
    return await bcrypt.compare(enteredPassword, this.password);
  }

  async save() {
    this.updatedAt = new Date();
    const idx = users.findIndex((u) => u._id === this._id);
    if (idx >= 0) {
      users[idx] = this;
    } else {
      users.push(this);
    }
    return this;
  }

  toObject() {
    const obj = {
      _id: this._id,
      name: this.name,
      email: this.email,
      phone: this.phone,
      role: this.role,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
    if (this.password) obj.password = this.password;
    return obj;
  }
}

// Room Document
class RoomDoc {
  constructor(data) {
    this._id = (data._id ? data._id.toString() : null) || generateId();
    this.roomNumber = data.roomNumber;
    this.title = data.title;
    this.type = data.type || 'Deluxe';
    this.description = data.description || '';
    this.pricePerNight = Number(data.pricePerNight);
    this.maxGuests = Number(data.maxGuests) || 2;
    this.bedType = data.bedType || 'King Bed';
    this.sizeSqFt = Number(data.sizeSqFt) || 450;
    this.amenities = Array.isArray(data.amenities) ? data.amenities : [];
    this.images = Array.isArray(data.images) && data.images.length ? data.images : ['/images/img_1.jpg'];
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.isFeatured = Boolean(data.isFeatured);
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
  }

  async save() {
    this.updatedAt = new Date();
    const idx = rooms.findIndex((r) => r._id === this._id);
    if (idx >= 0) rooms[idx] = this;
    else rooms.push(this);
    return this;
  }

  toObject() {
    return { ...this };
  }
}

// Reservation Document
class ReservationDoc {
  constructor(data) {
    this._id = (data._id ? data._id.toString() : null) || generateId();
    this.user = data.user?._id ? data.user._id.toString() : data.user ? data.user.toString() : null;
    this.room = data.room?._id ? data.room._id.toString() : data.room ? data.room.toString() : null;
    this.guestDetails = data.guestDetails || {};
    this.checkIn = new Date(data.checkIn);
    this.checkOut = new Date(data.checkOut);
    this.adults = Number(data.adults) || 1;
    this.children = Number(data.children) || 0;
    this.totalNights = Number(data.totalNights);
    this.pricePerNight = Number(data.pricePerNight);
    this.subtotal = Number(data.subtotal);
    this.taxAmount = Number(data.taxAmount);
    this.serviceFee = Number(data.serviceFee);
    this.totalPrice = Number(data.totalPrice);
    this.reservationStatus = data.reservationStatus || 'Confirmed';
    this.paymentStatus = data.paymentStatus || 'Unpaid';
    this.paymentDetails = data.paymentDetails || {};
    this.cancellationReason = data.cancellationReason || '';
    this.cancelledAt = data.cancelledAt ? new Date(data.cancelledAt) : null;
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
  }

  populate(field) {
    if (field === 'room' && this.room) {
      const rId = this.room?._id || this.room;
      const rMatch = rooms.find((r) => r._id === rId?.toString());
      if (rMatch) this.room = new RoomDoc(rMatch);
    }
    if (field === 'user' && this.user) {
      const uId = this.user?._id || this.user;
      const uMatch = users.find((u) => u._id === uId?.toString());
      if (uMatch) {
        const uDoc = new UserDoc(uMatch);
        delete uDoc.password;
        this.user = uDoc;
      }
    }
    return this;
  }

  async save() {
    this.updatedAt = new Date();
    const idx = reservations.findIndex((r) => r._id === this._id);
    if (idx >= 0) reservations[idx] = this;
    else reservations.push(this);
    return this;
  }

  toObject() {
    return { ...this };
  }
}

// Chainable & Thenable MemoryQuery class for Mongoose compatibility
class MemoryQuery {
  constructor(resolver) {
    this._resolver = resolver;
    this._selectFields = null;
    this._populateFields = [];
    this._sortCriteria = null;
    this._limitCount = null;
  }

  select(fields) {
    this._selectFields = fields;
    return this;
  }

  populate(field, select) {
    this._populateFields.push({ field, select });
    return this;
  }

  sort(criteria) {
    this._sortCriteria = criteria;
    return this;
  }

  limit(count) {
    this._limitCount = count;
    return this;
  }

  lean() {
    return this;
  }

  async exec() {
    let result = await this._resolver();
    if (result === null || result === undefined) return null;

    const isArray = Array.isArray(result);
    let items = isArray ? result.slice() : [result];

    // 1. Populate relations
    if (this._populateFields.length > 0) {
      items = items.map((doc) => {
        const item = doc instanceof ReservationDoc ? new ReservationDoc(doc) : doc;
        for (const pop of this._populateFields) {
          const field = typeof pop === 'string' ? pop : pop.field;
          const select = typeof pop === 'object' ? pop.select : null;

          if (field === 'room' && item.room) {
            const rId = item.room?._id || item.room;
            const rMatch = rooms.find((r) => r._id === rId?.toString());
            if (rMatch) {
              const rDoc = new RoomDoc(rMatch);
              if (select && typeof select === 'string') {
                const allowed = select.split(' ');
                const filtered = { _id: rDoc._id };
                allowed.forEach((k) => {
                  if (rDoc[k] !== undefined) filtered[k] = rDoc[k];
                });
                item.room = filtered;
              } else {
                item.room = rDoc;
              }
            }
          } else if (field === 'user' && item.user) {
            const uId = item.user?._id || item.user;
            const uMatch = users.find((u) => u._id === uId?.toString());
            if (uMatch) {
              const uDoc = new UserDoc(uMatch);
              delete uDoc.password;
              if (select && typeof select === 'string') {
                const allowed = select.split(' ');
                const filtered = { _id: uDoc._id };
                allowed.forEach((k) => {
                  if (uDoc[k] !== undefined) filtered[k] = uDoc[k];
                });
                item.user = filtered;
              } else {
                item.user = uDoc;
              }
            }
          }
        }
        return item;
      });
    }

    // 2. Select projection
    if (this._selectFields) {
      const selectStr = this._selectFields;
      items = items.map((item) => {
        if (selectStr === '+password') {
          return item;
        }
        if (selectStr === '-password') {
          if (item instanceof UserDoc) {
            const copy = new UserDoc(item);
            delete copy.password;
            return copy;
          }
          const copy = { ...item };
          delete copy.password;
          return copy;
        }
        if (selectStr === 'room') {
          return { room: item.room?._id || item.room };
        }
        return item;
      });
    }

    // 3. Sort ordering
    if (this._sortCriteria && isArray) {
      let key = 'createdAt';
      let dir = -1;
      if (typeof this._sortCriteria === 'string') {
        if (this._sortCriteria.startsWith('-')) {
          key = this._sortCriteria.substring(1);
          dir = -1;
        } else {
          key = this._sortCriteria;
          dir = 1;
        }
      } else if (typeof this._sortCriteria === 'object') {
        const firstKey = Object.keys(this._sortCriteria)[0];
        if (firstKey) {
          key = firstKey;
          dir = this._sortCriteria[firstKey] >= 0 ? 1 : -1;
        }
      }

      items.sort((a, b) => {
        const valA = a[key] instanceof Date ? a[key].getTime() : a[key];
        const valB = b[key] instanceof Date ? b[key].getTime() : b[key];
        if (valA < valB) return -1 * dir;
        if (valA > valB) return 1 * dir;
        return 0;
      });
    }

    // 4. Limit count
    if (this._limitCount !== null && isArray) {
      items = items.slice(0, this._limitCount);
    }

    return isArray ? items : items[0];
  }

  then(resolve, reject) {
    return this.exec().then(resolve, reject);
  }

  catch(reject) {
    return this.exec().catch(reject);
  }
}

// User Model Adapter
const UserModel = {
  findOne(query = {}) {
    return new MemoryQuery(() => {
      const match = users.find((u) => {
        if (query.email && u.email !== query.email.toLowerCase()) return false;
        if (query._id && u._id !== query._id.toString()) return false;
        return true;
      });
      return match ? new UserDoc(match) : null;
    });
  },

  findById(id) {
    return this.findOne({ _id: id });
  },

  find(query = {}) {
    return new MemoryQuery(() => {
      let result = users.slice();
      if (query.role) {
        result = result.filter((u) => u.role === query.role);
      }
      return result.map((u) => new UserDoc(u));
    });
  },

  async create(data) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);
    const doc = new UserDoc({
      ...data,
      password: hashedPassword
    });
    users.push(doc);
    return doc;
  },

  async countDocuments(query = {}) {
    let result = users;
    if (query.role) result = result.filter((u) => u.role === query.role);
    return result.length;
  },

  async deleteMany() {
    users = [];
  }
};

// Room Model Adapter
const RoomModel = {
  find(query = {}) {
    return new MemoryQuery(() => {
      let result = rooms.slice();

      if (query.isActive !== undefined) {
        result = result.filter((r) => r.isActive === query.isActive);
      }
      if (query.type && query.type !== 'All') {
        result = result.filter((r) => r.type === query.type);
      }
      if (query.maxGuests?.$gte) {
        result = result.filter((r) => r.maxGuests >= query.maxGuests.$gte);
      }
      if (query._id?.$nin) {
        const excluded = query._id.$nin.map((id) => id.toString());
        result = result.filter((r) => !excluded.includes(r._id.toString()));
      }
      if (query.pricePerNight?.$gte) {
        result = result.filter((r) => r.pricePerNight >= query.pricePerNight.$gte);
      }
      if (query.pricePerNight?.$lte) {
        result = result.filter((r) => r.pricePerNight <= query.pricePerNight.$lte);
      }
      if (query.$or) {
        const searchRegex = query.$or[0]?.title?.$regex;
        if (searchRegex) {
          const re = new RegExp(searchRegex, 'i');
          result = result.filter((r) => re.test(r.title) || re.test(r.description) || re.test(r.roomNumber));
        }
      }

      return result.map((r) => new RoomDoc(r));
    });
  },

  findById(id) {
    return new MemoryQuery(() => {
      const match = rooms.find((r) => r._id === id?.toString());
      return match ? new RoomDoc(match) : null;
    });
  },

  findOne(query) {
    return new MemoryQuery(() => {
      const match = rooms.find((r) => {
        if (query.roomNumber && r.roomNumber !== query.roomNumber) return false;
        if (query._id && r._id !== query._id.toString()) return false;
        return true;
      });
      return match ? new RoomDoc(match) : null;
    });
  },

  async create(data) {
    const doc = new RoomDoc(data);
    rooms.push(doc);
    return doc;
  },

  async insertMany(list) {
    const created = list.map((d) => new RoomDoc(d));
    rooms.push(...created);
    return created;
  },

  async findByIdAndUpdate(id, update, options = {}) {
    const idx = rooms.findIndex((r) => r._id === id.toString());
    if (idx === -1) return null;
    const updated = new RoomDoc({ ...rooms[idx], ...update, updatedAt: new Date() });
    rooms[idx] = updated;
    return updated;
  },

  async findByIdAndDelete(id) {
    const idx = rooms.findIndex((r) => r._id === id.toString());
    if (idx === -1) return null;
    const deleted = rooms.splice(idx, 1)[0];
    return deleted;
  },

  async countDocuments(query = {}) {
    let result = rooms;
    if (query.isActive !== undefined) {
      result = result.filter((r) => r.isActive === query.isActive);
    }
    return result.length;
  },

  async deleteMany() {
    rooms = [];
  }
};

// Reservation Model Adapter
const ReservationModel = {
  findOne(query = {}) {
    return new MemoryQuery(() => {
      const match = reservations.find((r) => {
        if (query.room && r.room?.toString() !== (query.room._id || query.room).toString()) return false;
        if (query._id && r._id !== query._id.toString()) return false;
        if (query.reservationStatus?.$in && !query.reservationStatus.$in.includes(r.reservationStatus)) {
          return false;
        }
        if (query.checkIn?.$lt && !(new Date(r.checkIn) < new Date(query.checkIn.$lt))) {
          return false;
        }
        if (query.checkOut?.$gt && !(new Date(r.checkOut) > new Date(query.checkOut.$gt))) {
          return false;
        }
        return true;
      });

      return match ? new ReservationDoc(match) : null;
    });
  },

  findById(id) {
    return new MemoryQuery(() => {
      const match = reservations.find((r) => r._id === id?.toString());
      return match ? new ReservationDoc(match) : null;
    });
  },

  find(query = {}) {
    return new MemoryQuery(() => {
      let result = reservations.slice();

      if (query.user) {
        result = result.filter((r) => r.user?.toString() === query.user.toString());
      }
      if (query.room) {
        result = result.filter((r) => r.room?.toString() === query.room.toString());
      }
      if (query.reservationStatus) {
        if (query.reservationStatus.$in) {
          result = result.filter((r) => query.reservationStatus.$in.includes(r.reservationStatus));
        } else if (typeof query.reservationStatus === 'string') {
          result = result.filter((r) => r.reservationStatus === query.reservationStatus);
        }
      }
      if (query.paymentStatus && typeof query.paymentStatus === 'string') {
        result = result.filter((r) => r.paymentStatus === query.paymentStatus);
      }
      if (query.checkIn?.$lt) {
        result = result.filter((r) => new Date(r.checkIn) < new Date(query.checkIn.$lt));
      }
      if (query.checkOut?.$gt) {
        result = result.filter((r) => new Date(r.checkOut) > new Date(query.checkOut.$gt));
      }
      if (query.$or) {
        const searchRegex = query.$or[0]?.['guestDetails.name']?.$regex;
        if (searchRegex) {
          const re = new RegExp(searchRegex, 'i');
          result = result.filter((r) => re.test(r.guestDetails?.name) || re.test(r.guestDetails?.email));
        }
      }

      return result.map((r) => new ReservationDoc(r));
    });
  },

  async create(data) {
    const doc = new ReservationDoc(data);
    reservations.push(doc);
    return doc;
  },

  async countDocuments(query = {}) {
    let list = reservations;
    if (query.reservationStatus) {
      if (query.reservationStatus.$in) {
        list = list.filter((r) => query.reservationStatus.$in.includes(r.reservationStatus));
      } else {
        list = list.filter((r) => r.reservationStatus === query.reservationStatus);
      }
    }
    if (query.checkIn?.$lte) {
      list = list.filter((r) => new Date(r.checkIn) <= new Date(query.checkIn.$lte));
    }
    if (query.checkOut?.$gte) {
      list = list.filter((r) => new Date(r.checkOut) >= new Date(query.checkOut.$gte));
    }
    if (query.checkIn?.$gte && query.checkIn?.$lt) {
      list = list.filter((r) => new Date(r.checkIn) >= query.checkIn.$gte && new Date(r.checkIn) < query.checkIn.$lt);
    }
    if (query.checkOut?.$gte && query.checkOut?.$lt) {
      list = list.filter((r) => new Date(r.checkOut) >= query.checkOut.$gte && new Date(r.checkOut) < query.checkOut.$lt);
    }
    return list.length;
  },

  async aggregate(pipeline = []) {
    // Financial aggregate: sum totalPrice for paid reservations
    const hasPaidMatch = pipeline.some((stage) => stage.$match && stage.$match.paymentStatus === 'Paid');
    if (hasPaidMatch) {
      const paid = reservations.filter((r) => r.paymentStatus === 'Paid' && r.reservationStatus !== 'Cancelled');
      const totalRevenue = paid.reduce((acc, r) => acc + Number(r.totalPrice || 0), 0);
      const totalSubtotal = paid.reduce((acc, r) => acc + Number(r.subtotal || 0), 0);
      const totalTax = paid.reduce((acc, r) => acc + Number(r.taxAmount || 0), 0);
      const totalFees = paid.reduce((acc, r) => acc + Number(r.serviceFee || 0), 0);
      return [{
        _id: null,
        totalRevenue,
        totalSubtotal,
        totalTax,
        totalFees
      }];
    }

    // Guest statistics aggregate: group by user
    const hasUserGroup = pipeline.some((stage) => stage.$group && stage.$group._id === '$user');
    if (hasUserGroup) {
      const map = {};
      reservations.forEach((r) => {
        const uid = (r.user?._id || r.user).toString();
        if (!map[uid]) {
          map[uid] = { _id: uid, bookingCount: 0, totalSpent: 0, lastBookingDate: null };
        }
        map[uid].bookingCount += 1;
        if (r.paymentStatus === 'Paid') {
          map[uid].totalSpent += Number(r.totalPrice || 0);
        }
        if (!map[uid].lastBookingDate || new Date(r.createdAt) > new Date(map[uid].lastBookingDate)) {
          map[uid].lastBookingDate = r.createdAt;
        }
      });
      return Object.values(map);
    }

    return [];
  },

  async deleteMany() {
    reservations = [];
  }
};

module.exports = {
  UserModel,
  RoomModel,
  ReservationModel,
  resetMemoryDb: () => {
    users = [];
    rooms = [];
    reservations = [];
  }
};
