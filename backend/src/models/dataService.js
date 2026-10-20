import { isMongoDBActive, MongooseModels, memoryStore } from '../config/db.js';
import { customAlphabet } from 'nanoid';

const idGen = customAlphabet('1234567890abcdef', 12);

export const UserService = {
  async find(query = {}) {
    memoryStore.reload();
    let users = memoryStore.data.users
      .filter(u => {
        for (const [k, v] of Object.entries(query)) {
          if (u[k] !== v) return false;
        }
        return true;
      })
      .map(({ password, ...u }) => u);

    if (isMongoDBActive()) {
      try {
        const mongoUsers = await MongooseModels.User.find(query).select('-password').lean();
        if (mongoUsers && mongoUsers.length > 0) {
          const knownEmails = new Set(users.map(u => u.email));
          for (const mu of mongoUsers) {
            if (!knownEmails.has(mu.email)) {
              users.push(mu);
            }
          }
        }
      } catch (err) {}
    }

    return users;
  },

  async findWithPassword(query = {}) {
    memoryStore.reload();
    const user = memoryStore.data.users.find(u => {
      for (const [k, v] of Object.entries(query)) {
        if (k === 'email') {
          if (!u.email || u.email.trim().toLowerCase() !== String(v).trim().toLowerCase()) return false;
        } else if (u[k] !== v) {
          return false;
        }
      }
      return true;
    });

    if (user) return user;

    if (isMongoDBActive()) {
      try {
        const mongoUser = await MongooseModels.User.findOne(query).lean();
        if (mongoUser) {
          memoryStore.data.users.push(mongoUser);
          memoryStore.save();
          return mongoUser;
        }
      } catch (err) {}
    }

    return null;
  },

  async findById(id) {
    memoryStore.reload();
    const user = memoryStore.data.users.find(u => u._id === String(id) || String(u._id) === String(id));
    if (user) {
      const { password, ...safeUser } = user;
      return safeUser;
    }
    if (isMongoDBActive()) {
      try {
        return await MongooseModels.User.findById(id).select('-password').lean();
      } catch (err) {}
    }
    return null;
  },

  async findByEmail(email) {
    if (!email) return null;
    const clean = String(email).trim().toLowerCase();
    memoryStore.reload();
    const user = memoryStore.data.users.find(u => u.email && u.email.trim().toLowerCase() === clean);
    if (user) return user;

    if (isMongoDBActive()) {
      try {
        return await MongooseModels.User.findOne({ email: clean }).lean();
      } catch (err) {}
    }
    return null;
  },

  async create(userData) {
    const cleanData = {
      ...userData,
      email: userData.email ? String(userData.email).trim().toLowerCase() : userData.email
    };

    memoryStore.reload();
    const newUser = {
      _id: `usr_${idGen()}`,
      ...cleanData,
      status: cleanData.status || 'active',
      role: cleanData.role || 'user',
      createdAt: new Date().toISOString()
    };

    const existingIdx = memoryStore.data.users.findIndex(u => u.email === cleanData.email);
    if (existingIdx >= 0) {
      memoryStore.data.users[existingIdx] = newUser;
    } else {
      memoryStore.data.users.push(newUser);
    }
    memoryStore.save();

    if (isMongoDBActive()) {
      try {
        await MongooseModels.User.create(cleanData);
      } catch (err) {
        console.warn('[DB] Mongo user sync warning:', err.message);
      }
    }

    return newUser;
  },

  async updateById(id, updates) {
    memoryStore.reload();
    const idx = memoryStore.data.users.findIndex(u => u._id === id || String(u._id) === String(id));
    if (idx !== -1) {
      memoryStore.data.users[idx] = { ...memoryStore.data.users[idx], ...updates };
      memoryStore.save();
    }

    if (isMongoDBActive()) {
      try {
        return await MongooseModels.User.findByIdAndUpdate(id, updates, { new: true }).select('-password').lean();
      } catch (err) {}
    }

    if (idx === -1) return null;
    const { password, ...safeUser } = memoryStore.data.users[idx];
    return safeUser;
  },

  async deleteById(id) {
    memoryStore.reload();
    const idx = memoryStore.data.users.findIndex(u => u._id === id || String(u._id) === String(id));
    let removed = false;
    if (idx !== -1) {
      memoryStore.data.users.splice(idx, 1);
      memoryStore.save();
      removed = true;
    }

    if (isMongoDBActive()) {
      try {
        await MongooseModels.User.findByIdAndDelete(id);
        removed = true;
      } catch (err) {}
    }

    return removed;
  },

  async count() {
    memoryStore.reload();
    return memoryStore.data.users.length;
  }
};

export const LinkService = {
  async find(query = {}, { sort = { createdAt: -1 }, limit, skip } = {}) {
    if (isMongoDBActive()) {
      let q = MongooseModels.Link.find(query);
      if (sort) q = q.sort(sort);
      if (skip) q = q.skip(skip);
      if (limit) q = q.limit(limit);
      return await q.lean();
    }

    let results = memoryStore.data.links.filter(l => {
      for (const [k, v] of Object.entries(query)) {
        if (k === 'userId' && String(l.userId) !== String(v)) return false;
        if (k === 'status' && l.status !== v) return false;
        if (k === 'isSuspicious' && l.isSuspicious !== v) return false;
        if (k === '$or') {
          const matched = v.some(subQ => {
            if (subQ.shortCode && l.shortCode.toLowerCase().includes(subQ.shortCode.$regex.toLowerCase())) return true;
            if (subQ.originalUrl && l.originalUrl.toLowerCase().includes(subQ.originalUrl.$regex.toLowerCase())) return true;
            if (subQ.title && l.title.toLowerCase().includes(subQ.title.$regex.toLowerCase())) return true;
            return false;
          });
          if (!matched) return false;
        }
      }
      return true;
    });

    results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (skip) results = results.slice(skip);
    if (limit) results = results.slice(0, limit);
    return results;
  },

  async findByShortCode(shortCode) {
    if (isMongoDBActive()) {
      return await MongooseModels.Link.findOne({ shortCode }).lean();
    }
    return memoryStore.data.links.find(l => l.shortCode.toLowerCase() === shortCode.toLowerCase()) || null;
  },

  async findById(id) {
    if (isMongoDBActive()) {
      return await MongooseModels.Link.findById(id).lean();
    }
    return memoryStore.data.links.find(l => l._id === id) || null;
  },

  async create(linkData) {
    const cleanLink = {
      ...linkData,
      userId: String(linkData.userId || 'usr_anonymous')
    };
    if (isMongoDBActive()) {
      const created = await MongooseModels.Link.create(cleanLink);
      return created.toObject();
    }
    const newLink = {
      _id: `lnk_${idGen()}`,
      ...cleanLink,
      clicks: 0,
      qrScans: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    memoryStore.data.links.unshift(newLink);
    memoryStore.save();
    return newLink;
  },

  async updateById(id, updates) {
    if (isMongoDBActive()) {
      return await MongooseModels.Link.findByIdAndUpdate(id, { ...updates, updatedAt: new Date() }, { new: true }).lean();
    }
    const idx = memoryStore.data.links.findIndex(l => l._id === id);
    if (idx === -1) return null;
    memoryStore.data.links[idx] = {
      ...memoryStore.data.links[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    memoryStore.save();
    return memoryStore.data.links[idx];
  },

  async deleteById(id) {
    if (isMongoDBActive()) {
      return await MongooseModels.Link.findByIdAndDelete(id);
    }
    const idx = memoryStore.data.links.findIndex(l => l._id === id);
    if (idx === -1) return false;
    memoryStore.data.links.splice(idx, 1);
    memoryStore.save();
    return true;
  },

  async incrementClicks(id, isQr = false) {
    if (isMongoDBActive()) {
      const update = { $inc: { clicks: 1 } };
      if (isQr) update.$inc.qrScans = 1;
      return await MongooseModels.Link.findByIdAndUpdate(id, update, { new: true });
    }
    const link = memoryStore.data.links.find(l => l._id === id);
    if (link) {
      link.clicks = (link.clicks || 0) + 1;
      if (isQr) link.qrScans = (link.qrScans || 0) + 1;
      memoryStore.save();
    }
    return link;
  },

  async count(query = {}) {
    if (isMongoDBActive()) {
      return await MongooseModels.Link.countDocuments(query);
    }
    return memoryStore.data.links.filter(l => {
      for (const [k, v] of Object.entries(query)) {
        if (l[k] !== v) return false;
      }
      return true;
    }).length;
  }
};

export const ClickLogService = {
  async create(logData) {
    const cleanLog = {
      ...logData,
      userId: String(logData.userId || '')
    };
    if (isMongoDBActive()) {
      return await MongooseModels.ClickLog.create(cleanLog);
    }
    const log = {
      _id: `log_${idGen()}`,
      ...cleanLog,
      timestamp: new Date().toISOString()
    };
    memoryStore.data.clickLogs.push(log);
    memoryStore.save();
    return log;
  },

  async find(query = {}) {
    if (isMongoDBActive()) {
      return await MongooseModels.ClickLog.find(query).lean();
    }
    return memoryStore.data.clickLogs.filter(cl => {
      for (const [k, v] of Object.entries(query)) {
        if (k === 'userId' && String(cl.userId) !== String(v)) return false;
        if (cl[k] !== v) return false;
      }
      return true;
    });
  },

  async count(query = {}) {
    if (isMongoDBActive()) {
      return await MongooseModels.ClickLog.countDocuments(query);
    }
    return memoryStore.data.clickLogs.filter(cl => {
      for (const [k, v] of Object.entries(query)) {
        if (k === 'userId' && String(cl.userId) !== String(v)) return false;
        if (cl[k] !== v) return false;
      }
      return true;
    }).length;
  }
};

export const BlockedDomainService = {
  async getAll() {
    if (isMongoDBActive()) {
      return await MongooseModels.BlockedDomain.find().lean();
    }
    return memoryStore.data.blockedDomains;
  },

  async add(domain, reason = 'Malicious domain', addedBy = 'Admin') {
    const cleanDomain = domain.trim().toLowerCase();
    if (isMongoDBActive()) {
      return await MongooseModels.BlockedDomain.create({ domain: cleanDomain, reason, addedBy });
    }
    const exists = memoryStore.data.blockedDomains.find(d => d.domain === cleanDomain);
    if (exists) return exists;
    const newBlocked = {
      _id: `bd_${idGen()}`,
      domain: cleanDomain,
      reason,
      addedBy,
      createdAt: new Date().toISOString()
    };
    memoryStore.data.blockedDomains.push(newBlocked);
    memoryStore.save();
    return newBlocked;
  },

  async remove(domain) {
    const cleanDomain = domain.trim().toLowerCase();
    if (isMongoDBActive()) {
      return await MongooseModels.BlockedDomain.findOneAndDelete({ domain: cleanDomain });
    }
    const idx = memoryStore.data.blockedDomains.findIndex(d => d.domain === cleanDomain);
    if (idx !== -1) {
      memoryStore.data.blockedDomains.splice(idx, 1);
      memoryStore.save();
      return true;
    }
    return false;
  }
};

export const SystemLogService = {
  async log(action, details, { userId = null, userEmail = null, ip = '127.0.0.1' } = {}) {
    const entry = {
      action,
      details,
      userId,
      userEmail,
      ip,
      timestamp: new Date().toISOString()
    };
    if (isMongoDBActive()) {
      return await MongooseModels.SystemLog.create(entry);
    }
    entry._id = `sys_${idGen()}`;
    memoryStore.data.systemLogs.unshift(entry);
    // Keep max 200 logs
    if (memoryStore.data.systemLogs.length > 200) {
      memoryStore.data.systemLogs.pop();
    }
    memoryStore.save();
    return entry;
  },

  async getAll(limit = 50) {
    if (isMongoDBActive()) {
      return await MongooseModels.SystemLog.find().sort({ timestamp: -1 }).limit(limit).lean();
    }
    return memoryStore.data.systemLogs.slice(0, limit);
  }
};
