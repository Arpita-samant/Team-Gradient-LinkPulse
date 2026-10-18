import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

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

// Persistent fallback store for instant zero-dependency execution
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

  init() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(STORE_FILE)) {
      try {
        const raw = fs.readFileSync(STORE_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } catch (err) {
        console.warn('Could not read existing store.json, re-initializing seed data.', err.message);
        this.seedInitialData();
      }
    } else {
      this.seedInitialData();
    }
  }

  save() {
    try {
      fs.writeFileSync(STORE_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save store.json:', err.message);
    }
  }

  seedInitialData() {
    const passwordHash = bcrypt.hashSync('password123', 10);
    const adminHash = bcrypt.hashSync('admin123', 10);

    const adminUser = {
      _id: 'usr_admin_001',
      name: 'Admin',
      email: 'admin@linkpulse.com',
      password: adminHash,
      role: 'admin',
      status: 'active',
      createdAt: new Date('2025-04-01T09:12:00Z').toISOString()
    };

    const arpitaUser = {
      _id: 'usr_arpita_002',
      name: 'Arpita Sharma',
      email: 'arpita@example.com',
      password: passwordHash,
      role: 'user',
      status: 'active',
      createdAt: new Date('2025-04-05T10:00:00Z').toISOString()
    };

    const aaravUser = {
      _id: 'usr_aarav_003',
      name: 'Aarav Sharma',
      email: 'aarav.sharma@example.com',
      password: passwordHash,
      role: 'user',
      status: 'active',
      createdAt: new Date('2025-04-15T10:24:00Z').toISOString()
    };

    const priyaUser = {
      _id: 'usr_priya_004',
      name: 'Priya Shah',
      email: 'priya.shah@example.com',
      password: passwordHash,
      role: 'user',
      status: 'active',
      createdAt: new Date('2025-04-14T15:17:00Z').toISOString()
    };

    const rohanUser = {
      _id: 'usr_rohan_005',
      name: 'Rohan Mehta',
      email: 'rohan.mehta@example.com',
      password: passwordHash,
      role: 'user',
      status: 'active',
      createdAt: new Date('2025-04-12T11:05:00Z').toISOString()
    };

    const nehaUser = {
      _id: 'usr_neha_006',
      name: 'Neha Verma',
      email: 'neha.verma@example.com',
      password: passwordHash,
      role: 'user',
      status: 'active',
      createdAt: new Date('2025-04-10T16:32:00Z').toISOString()
    };

    this.data.users = [adminUser, arpitaUser, aaravUser, priyaUser, rohanUser, nehaUser];

    // Seed links for Arpita matching Page 4 & Page 5
    const linksData = [
      {
        _id: 'lnk_001',
        userId: arpitaUser._id,
        originalUrl: 'https://example.com/long-url/product-launch-2025',
        shortCode: 'abc123',
        customAlias: 'abc123',
        title: 'Product Launch 2025',
        tags: ['marketing', 'campaign'],
        password: null,
        hasPassword: false,
        expiryDate: null,
        status: 'Active',
        isSuspicious: false,
        clicks: 412,
        qrScans: 120,
        createdAt: new Date('2025-10-10T10:00:00Z').toISOString(),
        updatedAt: new Date('2025-10-16T12:00:00Z').toISOString()
      },
      {
        _id: 'lnk_002',
        userId: arpitaUser._id,
        originalUrl: 'https://example.com/company-portfolio/tech-stack',
        shortCode: 'xyz789',
        customAlias: 'xyz789',
        title: 'Company Tech Stack',
        tags: ['portfolio', 'dev'],
        password: null,
        hasPassword: false,
        expiryDate: null,
        status: 'Active',
        isSuspicious: false,
        clicks: 276,
        qrScans: 85,
        createdAt: new Date('2025-10-11T11:00:00Z').toISOString(),
        updatedAt: new Date('2025-10-16T12:00:00Z').toISOString()
      },
      {
        _id: 'lnk_003',
        userId: arpitaUser._id,
        originalUrl: 'https://example.com/annual-sales-report-q3.pdf',
        shortCode: 'def456',
        customAlias: 'def456',
        title: 'Q3 Sales Report',
        tags: ['finance', 'report'],
        password: null,
        hasPassword: false,
        expiryDate: null,
        status: 'Active',
        isSuspicious: false,
        clicks: 198,
        qrScans: 54,
        createdAt: new Date('2025-10-11T14:30:00Z').toISOString(),
        updatedAt: new Date('2025-10-16T12:00:00Z').toISOString()
      },
      {
        _id: 'lnk_004',
        userId: arpitaUser._id,
        originalUrl: 'https://example.com/developer-summit-registration',
        shortCode: 'mno321',
        customAlias: 'mno321',
        title: 'Developer Summit 2025',
        tags: ['events', 'rsvp'],
        password: null,
        hasPassword: false,
        expiryDate: null,
        status: 'Active',
        isSuspicious: false,
        clicks: 124,
        qrScans: 42,
        createdAt: new Date('2025-10-12T09:00:00Z').toISOString(),
        updatedAt: new Date('2025-10-16T12:00:00Z').toISOString()
      },
      {
        _id: 'lnk_005',
        userId: arpitaUser._id,
        originalUrl: 'https://example.com/new-feature-demo-video',
        shortCode: 'pgr654',
        customAlias: 'pgr654',
        title: 'Feature Demo Video',
        tags: ['video', 'marketing'],
        password: null,
        hasPassword: false,
        expiryDate: null,
        status: 'Active',
        isSuspicious: false,
        clicks: 98,
        qrScans: 28,
        createdAt: new Date('2025-10-12T16:00:00Z').toISOString(),
        updatedAt: new Date('2025-10-16T12:00:00Z').toISOString()
      },
      {
        _id: 'lnk_006',
        userId: arpitaUser._id,
        originalUrl: 'https://example.com/exam-portal/notes-2023',
        shortCode: 'exam20a001',
        customAlias: 'exam20a001',
        title: 'Exam Notes Semester 1',
        tags: ['education', 'notes'],
        password: null,
        hasPassword: false,
        expiryDate: null,
        status: 'Active',
        isSuspicious: false,
        clicks: 13,
        qrScans: 4,
        createdAt: new Date('2025-10-12T10:00:00Z').toISOString(),
        updatedAt: new Date('2025-10-12T10:00:00Z').toISOString()
      },
      {
        _id: 'lnk_007',
        userId: arpitaUser._id,
        originalUrl: 'https://example.com/exam-portal/revision-guide',
        shortCode: 'exam20a022',
        customAlias: 'exam20a022',
        title: 'Exam Revision Guide',
        tags: ['education'],
        password: null,
        hasPassword: false,
        expiryDate: null,
        status: 'Active',
        isSuspicious: false,
        clicks: 10,
        qrScans: 3,
        createdAt: new Date('2025-10-12T10:30:00Z').toISOString(),
        updatedAt: new Date('2025-10-12T10:30:00Z').toISOString()
      },
      {
        _id: 'lnk_008',
        userId: arpitaUser._id,
        originalUrl: 'https://example.com/flash-sale-october',
        shortCode: 'exam20a023',
        customAlias: 'exam20a023',
        title: 'Flash Sale Promo',
        tags: ['promo', 'minutes'],
        password: null,
        hasPassword: false,
        expiryDate: null,
        status: 'Paused',
        isSuspicious: false,
        clicks: 8,
        qrScans: 2,
        createdAt: new Date('2025-10-12T11:00:00Z').toISOString(),
        updatedAt: new Date('2025-10-12T11:00:00Z').toISOString()
      },
      {
        _id: 'lnk_009',
        userId: arpitaUser._id,
        originalUrl: 'https://example.com/webinar-slides-october',
        shortCode: 'exam20a024',
        customAlias: 'exam20a024',
        title: 'Webinar Slides',
        tags: ['webinar'],
        password: null,
        hasPassword: false,
        expiryDate: null,
        status: 'Active',
        isSuspicious: false,
        clicks: 8,
        qrScans: 1,
        createdAt: new Date('2025-10-12T12:00:00Z').toISOString(),
        updatedAt: new Date('2025-10-12T12:00:00Z').toISOString()
      },
      {
        _id: 'lnk_010',
        userId: arpitaUser._id,
        originalUrl: 'https://example.com/hackathon-guidelines',
        shortCode: 'exam20a026',
        customAlias: 'exam20a026',
        title: 'Hackathon Rules',
        tags: ['hackathon'],
        password: null,
        hasPassword: false,
        expiryDate: null,
        status: 'Active',
        isSuspicious: false,
        clicks: 3,
        qrScans: 1,
        createdAt: new Date('2025-10-12T13:00:00Z').toISOString(),
        updatedAt: new Date('2025-10-12T13:00:00Z').toISOString()
      },
      {
        _id: 'lnk_011',
        userId: arpitaUser._id,
        originalUrl: 'https://example.com/internal-wiki/team-guidelines',
        shortCode: 'exam20a027',
        customAlias: 'exam20a027',
        title: 'Team Onboarding Wiki',
        tags: ['internal'],
        password: null,
        hasPassword: false,
        expiryDate: null,
        status: 'Paused',
        isSuspicious: false,
        clicks: 3,
        qrScans: 0,
        createdAt: new Date('2025-10-12T14:00:00Z').toISOString(),
        updatedAt: new Date('2025-10-12T14:00:00Z').toISOString()
      },
      {
        _id: 'lnk_012',
        userId: arpitaUser._id,
        originalUrl: 'https://example.com/podcast-episode-42',
        shortCode: 'exam20a028',
        customAlias: 'exam20a028',
        title: 'Podcast Episode 42',
        tags: ['media'],
        password: null,
        hasPassword: false,
        expiryDate: null,
        status: 'Active',
        isSuspicious: false,
        clicks: 1,
        qrScans: 0,
        createdAt: new Date('2025-10-12T15:00:00Z').toISOString(),
        updatedAt: new Date('2025-10-12T15:00:00Z').toISOString()
      },
      {
        _id: 'lnk_013',
        userId: arpitaUser._id,
        originalUrl: 'https://example.com/secret-alpha-preview',
        shortCode: 'exam28a01c',
        customAlias: 'exam28a01c',
        title: 'Alpha Release Link',
        tags: ['preview'],
        password: null,
        hasPassword: false,
        expiryDate: null,
        status: 'Active',
        isSuspicious: false,
        clicks: 2,
        qrScans: 1,
        createdAt: new Date('2025-10-12T16:00:00Z').toISOString(),
        updatedAt: new Date('2025-10-12T16:00:00Z').toISOString()
      },
      {
        _id: 'lnk_014',
        userId: aaravUser._id,
        originalUrl: 'http://free-crypto-giveaway.top/claim-now',
        shortCode: 'freecrypt',
        customAlias: 'freecrypt',
        title: 'Crypto Claim Link',
        tags: ['crypto'],
        password: null,
        hasPassword: false,
        expiryDate: null,
        status: 'Blocked',
        isSuspicious: true,
        clicks: 65,
        qrScans: 10,
        createdAt: new Date('2025-10-14T09:00:00Z').toISOString(),
        updatedAt: new Date('2025-10-14T10:00:00Z').toISOString()
      },
      {
        _id: 'lnk_015',
        userId: priyaUser._id,
        originalUrl: 'http://paypal-verify-account.info/login.php',
        shortCode: 'paypalsec',
        customAlias: 'paypalsec',
        title: 'Account Verification',
        tags: ['alert'],
        password: null,
        hasPassword: false,
        expiryDate: null,
        status: 'Blocked',
        isSuspicious: true,
        clicks: 12,
        qrScans: 2,
        createdAt: new Date('2025-10-15T08:30:00Z').toISOString(),
        updatedAt: new Date('2025-10-15T08:30:00Z').toISOString()
      },
      {
        _id: 'lnk_016',
        userId: rohanUser._id,
        originalUrl: 'http://download-crack-virus.com/setup.exe',
        shortCode: 'crackdown',
        customAlias: 'crackdown',
        title: 'Game Crack Installer',
        tags: ['software'],
        password: null,
        hasPassword: false,
        expiryDate: null,
        status: 'Blocked',
        isSuspicious: true,
        clicks: 8,
        qrScans: 1,
        createdAt: new Date('2025-10-15T14:20:00Z').toISOString(),
        updatedAt: new Date('2025-10-15T14:20:00Z').toISOString()
      }
    ];

    // Total up to 24 links for Arpita
    for (let i = 17; i <= 28; i++) {
      linksData.push({
        _id: `lnk_0${i}`,
        userId: arpitaUser._id,
        originalUrl: `https://example.com/resources/article-${i}`,
        shortCode: `res${i}code`,
        customAlias: null,
        title: `Resource Article #${i}`,
        tags: ['resources', i % 2 === 0 ? 'guides' : 'updates'],
        password: null,
        hasPassword: false,
        expiryDate: null,
        status: i % 5 === 0 ? 'Paused' : 'Active',
        isSuspicious: false,
        clicks: Math.floor(Math.random() * 25) + 3,
        qrScans: Math.floor(Math.random() * 8),
        createdAt: new Date(`2025-10-${(i % 5) + 10}T10:00:00Z`).toISOString(),
        updatedAt: new Date(`2025-10-16T10:00:00Z`).toISOString()
      });
    }

    this.data.links = linksData;

    // Seed click logs matching Page 5 trends:
    // Oct 10: 60, Oct 11: 150, Oct 12: 120, Oct 13: 190, Oct 14: 250, Oct 15: 250, Oct 16: 340 clicks
    const trendDays = [
      { date: '2025-10-10', clicks: 62 },
      { date: '2025-10-11', clicks: 148 },
      { date: '2025-10-12', clicks: 118 },
      { date: '2025-10-13', clicks: 192 },
      { date: '2025-10-14', clicks: 254 },
      { date: '2025-10-15', clicks: 250 },
      { date: '2025-10-16', clicks: 352 }
    ];

    const clickLogs = [];
    let logIdCounter = 1;
    const devices = ['Desktop', 'Desktop', 'Mobile', 'Mobile', 'Tablet'];
    const browsers = ['Chrome', 'Chrome', 'Firefox', 'Safari', 'Edge'];
    const oss = ['Windows', 'Windows', 'macOS', 'iOS', 'Android'];
    const referrers = ['Direct', 'Google', 'Twitter/X', 'LinkedIn', 'Instagram'];

    trendDays.forEach(day => {
      for (let c = 0; c < day.clicks; c++) {
        const link = linksData[c % 5];
        clickLogs.push({
          _id: `log_${logIdCounter++}`,
          linkId: link._id,
          shortCode: link.shortCode,
          userId: arpitaUser._id,
          type: c % 4 === 0 ? 'qr_scan' : 'click',
          ip: `192.0.2.${(c % 150) + 1}`,
          device: devices[c % devices.length],
          browser: browsers[c % browsers.length],
          os: oss[c % oss.length],
          referrer: referrers[c % referrers.length],
          timestamp: new Date(`${day.date}T${String((c % 24)).padStart(2, '0')}:${String((c * 3) % 60).padStart(2, '0')}:00Z`).toISOString()
        });
      }
    });

    this.data.clickLogs = clickLogs;

    this.data.blockedDomains = [
      { _id: 'bd_1', domain: 'malware-test.com', reason: 'Known malware distributor', addedBy: 'Admin', createdAt: new Date().toISOString() },
      { _id: 'bd_2', domain: 'phishing-site.ru', reason: 'Credential phishing target', addedBy: 'Admin', createdAt: new Date().toISOString() },
      { _id: 'bd_3', domain: 'free-crypto-giveaway.top', reason: 'Crypto scam network', addedBy: 'Admin', createdAt: new Date().toISOString() }
    ];

    this.data.systemLogs = [
      { _id: 'sys_1', action: 'SYSTEM_BOOT', details: 'LinkPulse Core Platform initialized', ip: '127.0.0.1', timestamp: new Date('2025-10-16T08:00:00Z').toISOString() },
      { _id: 'sys_2', action: 'SUSPICIOUS_LINK_FLAGGED', details: 'Link "freecrypt" flagged for suspicious domain keywords', ip: '192.0.2.14', timestamp: new Date('2025-10-16T08:15:00Z').toISOString() },
      { _id: 'sys_3', action: 'DOMAIN_BLOCKED', details: 'Domain "free-crypto-giveaway.top" added to permanent blocklist', ip: '127.0.0.1', timestamp: new Date('2025-10-16T08:20:00Z').toISOString() },
      { _id: 'sys_4', action: 'USER_LOGIN', details: 'Admin logged into control console', userEmail: 'admin@linkpulse.com', ip: '127.0.0.1', timestamp: new Date('2025-10-16T09:00:00Z').toISOString() }
    ];

    this.save();
  }
}

export const memoryStore = new MemoryFileStore();

let isMongoConnected = false;

export async function connectDB() {
  const mongoURI = process.env.MONGODB_URI;
  if (!mongoURI) {
    console.log('[DB] No MONGODB_URI provided in environment. Running with LinkPulse high-fidelity persistent JSON store.');
    return;
  }

  try {
    await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 3000 });
    isMongoConnected = true;
    console.log('[DB] Successfully connected to MongoDB Atlas!');
  } catch (err) {
    console.warn(`[DB] MongoDB Atlas connection error: ${err.message}. Seamlessly falling back to LinkPulse persistent store.`);
    isMongoConnected = false;
  }
}

export function isMongoDBActive() {
  return isMongoConnected;
}
