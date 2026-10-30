import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Profile from '../models/Profile.js';
import History from '../models/History.js';
import { isDbConnected } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data folder and db.json exist for fallback
const initLocalStore = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(
      DB_FILE,
      JSON.stringify({ users: [], profiles: [], histories: [] }, null, 2),
      'utf-8'
    );
  }
};

initLocalStore();

const readLocalStore = () => {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { users: [], profiles: [], histories: [] };
  }
};

const writeLocalStore = (data) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Fallback Store] Error writing to db.json:', err.message);
  }
};

const generateId = () => {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
};

export const UserService = {
  async findByEmail(email) {
    if (isDbConnected()) {
      return await User.findOne({ email: email.toLowerCase() });
    }
    const store = readLocalStore();
    return store.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  async findById(id) {
    if (isDbConnected()) {
      return await User.findById(id);
    }
    const store = readLocalStore();
    const user = store.users.find((u) => u._id === id || u.id === id);
    if (!user) return null;
    const { password, ...safeUser } = user;
    return safeUser;
  },

  async create({ name, email, password }) {
    if (isDbConnected()) {
      const user = new User({ name, email, password });
      await user.save();
      return user;
    }
    const store = readLocalStore();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = {
      _id: generateId(),
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.users.push(newUser);
    writeLocalStore(store);

    // Return user with comparePassword method
    return {
      ...newUser,
      comparePassword: async (candidate) => bcrypt.compare(candidate, newUser.password),
      toJSON: () => {
        const { password, ...safe } = newUser;
        return safe;
      },
    };
  },

  async verifyPassword(user, candidatePassword) {
    if (typeof user.comparePassword === 'function') {
      return await user.comparePassword(candidatePassword);
    }
    return await bcrypt.compare(candidatePassword, user.password);
  },
};

export const ProfileService = {
  async findByUserId(userId) {
    const uid = userId.toString();
    if (isDbConnected()) {
      let profile = await Profile.findOne({ userId });
      if (!profile) {
        profile = await Profile.create({ userId });
      }
      return profile;
    }
    const store = readLocalStore();
    let profile = store.profiles.find((p) => p.userId === uid);
    if (!profile) {
      profile = {
        _id: generateId(),
        userId: uid,
        disabilityTypes: [],
        preferredLanguage: 'English',
        readingLevel: 'Simple',
        fontSize: 'medium',
        dyslexiaFont: false,
        highContrast: false,
        reducedMotion: false,
        autoReadAloud: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      store.profiles.push(profile);
      writeLocalStore(store);
    }
    return profile;
  },

  async updateByUserId(userId, updates) {
    const uid = userId.toString();
    if (isDbConnected()) {
      return await Profile.findOneAndUpdate(
        { userId },
        { $set: updates },
        { new: true, upsert: true, runValidators: true }
      );
    }
    const store = readLocalStore();
    let index = store.profiles.findIndex((p) => p.userId === uid);
    const now = new Date().toISOString();
    if (index === -1) {
      const newProfile = {
        _id: generateId(),
        userId: uid,
        disabilityTypes: updates.disabilityTypes || [],
        preferredLanguage: updates.preferredLanguage || 'English',
        readingLevel: updates.readingLevel || 'Simple',
        fontSize: updates.fontSize || 'medium',
        dyslexiaFont: !!updates.dyslexiaFont,
        highContrast: !!updates.highContrast,
        reducedMotion: !!updates.reducedMotion,
        autoReadAloud: !!updates.autoReadAloud,
        createdAt: now,
        updatedAt: now,
      };
      store.profiles.push(newProfile);
      writeLocalStore(store);
      return newProfile;
    }
    store.profiles[index] = {
      ...store.profiles[index],
      ...updates,
      updatedAt: now,
    };
    writeLocalStore(store);
    return store.profiles[index];
  },
};

export const HistoryService = {
  async create({ userId, featureType, title, inputData, outputData, language, readingLevel }) {
    const uid = userId.toString();
    if (isDbConnected()) {
      return await History.create({
        userId,
        featureType,
        title,
        inputData,
        outputData,
        language,
        readingLevel,
      });
    }
    const store = readLocalStore();
    const newRecord = {
      _id: generateId(),
      userId: uid,
      featureType,
      title,
      inputData,
      outputData,
      language: language || 'English',
      readingLevel: readingLevel || 'Simple',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.histories.unshift(newRecord); // newest first
    writeLocalStore(store);
    return newRecord;
  },

  async findAllByUser(userId) {
    const uid = userId.toString();
    if (isDbConnected()) {
      return await History.find({ userId }).sort({ createdAt: -1 });
    }
    const store = readLocalStore();
    return store.histories
      .filter((h) => h.userId === uid)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async findByIdAndUser(id, userId) {
    const uid = userId.toString();
    if (isDbConnected()) {
      return await History.findOne({ _id: id, userId });
    }
    const store = readLocalStore();
    return store.histories.find((h) => (h._id === id || h.id === id) && h.userId === uid) || null;
  },

  async deleteByIdAndUser(id, userId) {
    const uid = userId.toString();
    if (isDbConnected()) {
      const res = await History.findOneAndDelete({ _id: id, userId });
      return !!res;
    }
    const store = readLocalStore();
    const initialLen = store.histories.length;
    store.histories = store.histories.filter(
      (h) => !((h._id === id || h.id === id) && h.userId === uid)
    );
    writeLocalStore(store);
    return store.histories.length < initialLen;
  },
};
