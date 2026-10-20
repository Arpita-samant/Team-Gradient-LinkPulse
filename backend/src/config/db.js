import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isVercel = Boolean(process.env.VERCEL);
const DATA_DIR = isVercel ? '/tmp' : path.resolve(__dirname, '../../data');
const DATA_JSON_FILE = isVercel ? path.join('/tmp', 'data.json') : path.resolve(__dirname, '../../data/data.json');
const BACKEND_DATA_JSON_FILE = path.resolve(__dirname, '../../data.json');
const ROOT_DATA_JSON_FILE = path.resolve(__dirname, '../../../data.json');
const LEGACY_STORE_FILE = isVercel ? path.join('/tmp', 'store.json') : path.resolve(__dirname, '../../data/store.json');

// Mongoose Schemas for MongoDB Atlas
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  status: { type: String, enum: ['active', 'suspended'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

const LinkSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  originalUrl: { type: String, required: true },
  shortCode: { type: String, required: true, unique: true },
  customAlias: { type: String, default: null },
  title: { type: String, default: '' },
  tags: [{ type: String }],
  password: { type: String, default: null },
  hasPassword: { type: Boolean, default: false },
  expiryDate: { type: Date, default: null },
  status: { type: String, enum: ['Active', 'Paused', 'Expired', 'Blocked'], default: 'Active' },
  isSuspicious: { type: Boolean, default: false },
  clicks: { type: Number, default: 0 },
  qrScans: { type: Number, default: 0 },
  qrCodeDataUrl: { type: String, default: '' },
  urlHash: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const ClickLogSchema = new mongoose.Schema({
  linkId: { type: String, required: true },
  shortCode: { type: String, required: true },
  userId: { type: String, required: true },
  type: { type: String, enum: ['click', 'qr_scan'], default: 'click' },
  ip: { type: String, default: '127.0.0.1' },
  device: { type: String, default: 'Desktop' },
  browser: { type: String, default: 'Chrome' },
  os: { type: String, default: 'Windows' },
  referrer: { type: String, default: 'Direct' },
  timestamp: { type: Date, default: Date.now }
});

const BlockedDomainSchema = new mongoose.Schema({
  domain: { type: String, required: true, unique: true },
  reason: { type: String, default: 'Suspicious or malicious activity' },
  addedBy: { type: String, default: 'System Admin' },
  createdAt: { type: Date, default: Date.now }
});

const SystemLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  details: { type: String, required: true },
  userId: { type: String, default: null },
  userEmail: { type: String, default: null },
  ip: { type: String, default: '127.0.0.1' },
  timestamp: { type: Date, default: Date.now }
});

export const MongooseModels = {
  User: mongoose.model('User', UserSchema),
  Link: mongoose.model('Link', LinkSchema),
  ClickLog: mongoose.model('ClickLog', ClickLogSchema),
  BlockedDomain: mongoose.model('BlockedDomain', BlockedDomainSchema),
  SystemLog: mongoose.model('SystemLog', SystemLogSchema)
};

// High-fidelity file-backed store (persists to data.json)
class MemoryFileStore {
  constructor() {
    this.data = {
      users: [],
      links: [],
      clickLogs: [],
      blockedDomains: [],
      systemLogs: []
    };
    this.init();
  }

  getTargetFiles() {
    if (isVercel) {
      return [
        path.join('/tmp', 'data.json'),
        path.join('/tmp', 'store.json')
      ];
    }
    return [
      DATA_JSON_FILE,
      BACKEND_DATA_JSON_FILE,
      ROOT_DATA_JSON_FILE,
      LEGACY_STORE_FILE
    ];
  }

  init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
    } catch (e) {
      console.warn('[DB] Could not ensure DATA_DIR:', e.message);
    }

    const candidateFiles = isVercel
      ? [
          path.join('/tmp', 'data.json'),
          path.join('/tmp', 'store.json'),
          BACKEND_DATA_JSON_FILE,
          path.resolve(__dirname, '../../data/data.json'),
          path.resolve(__dirname, '../../data/store.json'),
          ROOT_DATA_JSON_FILE
        ]
      : [DATA_JSON_FILE, BACKEND_DATA_JSON_FILE, ROOT_DATA_JSON_FILE, LEGACY_STORE_FILE];

    let loaded = false;
    for (const f of candidateFiles) {
      if (fs.existsSync(f)) {
        try {
          const raw = fs.readFileSync(f, 'utf-8');
          const parsed = JSON.parse(raw);
          if (parsed && Array.isArray(parsed.users) && parsed.users.length > 0) {
            this.data = parsed;
            loaded = true;
            console.log(`[DB] Loaded persistent data from ${path.basename(f)} (${this.data.users.length} users, ${this.data.links?.length || 0} links)`);
            break;
          }
        } catch (e) {
          console.warn(`[DB] Failed reading candidate ${f}:`, e.message);
        }
      }
    }

    if (!loaded) {
      this.seedInitialData();
    } else {
      this.ensureAdmin();
      this.save();
    }
  }

  ensureAdmin() {
    if (!this.data.users) this.data.users = [];
    const hasAdmin = this.data.users.some(u => u.email === 'samantarpita70@gmail.com');
    if (!hasAdmin) {
      const adminHash = bcrypt.hashSync('arpitasamant12', 10);
      this.data.users.unshift({
        _id: 'usr_admin_arpita_01',
        name: 'Arpita Samant',
        email: 'samantarpita70@gmail.com',
        password: adminHash,
        role: 'admin',
        status: 'active',
        createdAt: new Date().toISOString()
      });
    }
  }

  reload() {
    const candidateFiles = this.getTargetFiles();
    for (const f of candidateFiles) {
      if (fs.existsSync(f)) {
        try {
          const raw = fs.readFileSync(f, 'utf-8');
          const parsed = JSON.parse(raw);
          if (parsed && Array.isArray(parsed.users)) {
            this.data = parsed;
            return;
          }
        } catch (e) {}
      }
    }
  }

  save() {
    this.ensureAdmin();
    const jsonStr = JSON.stringify(this.data, null, 2);
    const targetFiles = this.getTargetFiles();

    for (const file of targetFiles) {
      try {
        const dir = path.dirname(file);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(file, jsonStr, 'utf-8');
      } catch (err) {}
    }
  }

  seedInitialData() {
    const adminHash = bcrypt.hashSync('arpitasamant12', 10);

    const adminUser = {
      _id: 'usr_admin_arpita_01',
      name: 'Arpita Samant',
      email: 'samantarpita70@gmail.com',
      password: adminHash,
      role: 'admin',
      status: 'active',
      createdAt: new Date().toISOString()
    };

    this.data.users = [adminUser];
    this.data.links = [];
    this.data.clickLogs = [];

    this.data.blockedDomains = [
      { _id: 'bd_1', domain: 'malware-test.com', reason: 'Known malware distributor', addedBy: 'Arpita Samant', createdAt: new Date().toISOString() },
      { _id: 'bd_2', domain: 'phishing-site.ru', reason: 'Credential phishing target', addedBy: 'Arpita Samant', createdAt: new Date().toISOString() }
    ];

    this.data.systemLogs = [
      { _id: 'sys_1', action: 'SYSTEM_BOOT', details: 'LinkPulse Initialized. Sole Admin: samantarpita70@gmail.com', ip: '127.0.0.1', timestamp: new Date().toISOString() }
    ];

    this.save();
  }
}

export const memoryStore = new MemoryFileStore();

let cachedPromise = null;
let isMongoConnected = false;
let lastMongoFailTime = 0;

export async function seedMongoAdmin() {
  if (!isMongoDBActive()) return;
  try {
    const existing = await MongooseModels.User.findOne({ email: 'samantarpita70@gmail.com' });
    if (!existing) {
      const adminHash = bcrypt.hashSync('arpitasamant12', 10);
      await MongooseModels.User.create({
        name: 'Arpita Samant',
        email: 'samantarpita70@gmail.com',
        password: adminHash,
        role: 'admin',
        status: 'active',
        createdAt: new Date().toISOString()
      });
      console.log('[DB] Seeded initial admin account in MongoDB Atlas.');
    }
  } catch (err) {
    console.warn('[DB] Could not seed admin in MongoDB:', err.message);
  }
}

export async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    isMongoConnected = true;
    return mongoose.connection;
  }

  const mongoURI = process.env.MONGODB_URI;
  if (!mongoURI || mongoURI.includes('<password>') || mongoURI.includes('<db_password>') || mongoURI.includes('YOUR_PASSWORD') || mongoURI.includes('<your_password>')) {
    return null;
  }

  // If connection failed recently, avoid stalling user requests with repeated 3-sec timeouts
  if (Date.now() - lastMongoFailTime < 60000) {
    return null;
  }

  if (!cachedPromise) {
    cachedPromise = mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000,
      autoIndex: false,
      maxPoolSize: 10
    }).then(async (m) => {
      isMongoConnected = true;
      console.log('[DB] Securely connected to MongoDB Atlas database cluster.');
      await seedMongoAdmin();
      return m;
    }).catch(err => {
      cachedPromise = null;
      isMongoConnected = false;
      lastMongoFailTime = Date.now();
      lastMongoError = err.message;
      console.warn(`[DB] MongoDB Atlas connection error: ${err.message}. Serving from data.json.`);
      return null;
    });
  }

  return await cachedPromise;
}

let lastMongoError = null;

export function getDbDiagnostics() {
  const uri = process.env.MONGODB_URI || '';
  const isConfigured = Boolean(uri && !uri.includes('<password>') && !uri.includes('<db_password>'));
  return {
    database: isMongoDBActive() ? 'MongoDB Atlas (Connected)' : 'Local File Store (Ephemeral on Vercel)',
    persistent: isMongoDBActive(),
    mongoConfigured: isConfigured,
    hasMongoUri: Boolean(uri),
    lastMongoError: lastMongoError,
    activeUsersCount: memoryStore?.data?.users?.length || 0
  };
}

export function isMongoDBActive() {
  return mongoose.connection.readyState === 1;
}
