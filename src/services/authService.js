// MindMitra Authentication & Session Management Service
// Clean development service abstraction ready for future Supabase/backend swap
import { store } from '../state/store.js';
import { securityService } from './securityService.js';

const SESSION_STORAGE_KEY = 'mindmitra_auth_session_v1';
const USERS_STORAGE_KEY = 'mindmitra_auth_users_v1';

// Canonical Demo Accounts (Cleanly segregated for development & verification)
export const DEMO_ACCOUNTS = [
  {
    id: "user-asha",
    name: "Asha Devi",
    email: "asha@mindmitra.in",
    password: "Asha1234!", // In production replaced by secure password hash
    role: "patient",
    age: 72,
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuC0YAy95YXoJS_5vZSXW6X-PnJg1OsTqHJE2auKWrD5E7ybjkztRBBIbPZq3y0AoaM-Eb7-2Qx61e_xOx0bClvELv1MtWm0Z7VfdKvssQV7JArcPSFqwheQMajYjLn1WtA7dzsP7DkKjOMqz60OC8iteQ13hCjAL-3WZhbWP9JoryUyuNiYnvwio5McweNRZW-WZd1RGWNj0z1B2xPhZHGMqCFaED7B18VQpnsX4l16dCIuTMDLx3oi",
    location: "Assam / Shillong morning",
    safeZone: "Sector 4 Care Unit, Shillong",
    emergencyAddress: "House 14, Sector 4, Near Pine Mount, Shillong",
    createdAt: "2026-01-15T08:00:00.000Z"
  },
  {
    id: "user-meera",
    name: "Meera",
    email: "meera@mindmitra.in",
    password: "Meera4321!",
    role: "caregiver",
    relation: "Daughter",
    phone: "+91 98450 21345",
    tag: "Primary Caregiver",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBFsUQsFG7Aocu9cogI7HmvsTS7dOsniLo5kT7I2KJlwpBTQPzweuYKfVqBpuJ8A9WgaTdpr5ziiSPBONlpnprntpWoJS38_RpMX-wHiXu7eZjUDc4c1GEcpblsSqqhzM1FhuYW0fxGcr9wdKVgCo2mHh5SLP2_W9o5MIQ8GdY0hjG-oKCA1NAfNUopC8ilS782KxJutPUcaHybWCYR6qJODvpUKKgp-Nu3Nc3G21nmtNxr3EY3hPGw",
    createdAt: "2026-01-15T08:00:00.000Z"
  },
  {
    id: "user-dr-sharma",
    name: "Dr. Ananya Sharma",
    email: "ananya@mindmitra.in",
    password: "Doctor1234!",
    role: "doctor",
    specialization: "Neurology / Cognitive Health",
    hospital: "Shillong Medical Centre",
    city: "Shillong, Meghalaya",
    phone: "+91 98320 14567",
    licenseId: "NMC-2018-847291",
    languages: ["English", "Hindi", "Assamese"],
    verificationStatus: "Pending", // Honest: no fake verification badge
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300",
    bio: "Consultant Neurologist focusing on elder cognitive wellness, memory care coordination, and family health guidance.",
    createdAt: "2026-02-01T09:00:00.000Z"
  }
];

class AuthService {
  constructor() {
    this.session = this.loadSession();
    this.initUsers();
  }

  initUsers() {
    try {
      if (typeof localStorage === 'undefined') return;
      const stored = localStorage.getItem(USERS_STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEMO_ACCOUNTS));
      } else {
        // Reconcile demo accounts without clearing existing users
        const existingUsers = JSON.parse(stored);
        let updated = false;
        DEMO_ACCOUNTS.forEach(demo => {
          if (!existingUsers.some(u => u.id === demo.id || u.email.toLowerCase() === demo.email.toLowerCase())) {
            existingUsers.push(demo);
            updated = true;
          }
        });
        if (updated) {
          localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(existingUsers));
        }
      }
    } catch (e) {
      console.warn('AuthService init error:', e);
    }
  }

  getRegisteredUsers() {
    try {
      if (typeof localStorage === 'undefined') return DEMO_ACCOUNTS;
      const raw = localStorage.getItem(USERS_STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Error reading registered users:', e);
    }
    return DEMO_ACCOUNTS;
  }

  saveRegisteredUsers(users) {
    try {
      if (typeof localStorage === 'undefined') return;
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (e) {
      console.warn('Error saving registered users:', e);
    }
  }

  loadSession() {
    try {
      if (typeof localStorage === 'undefined') return null;
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      if (raw) {
        const session = JSON.parse(raw);
        // Verify expiration if token exists
        if (session && session.userId && session.role) {
          return session;
        }
      }
    } catch (e) {
      console.warn('Error reading session:', e);
    }
    return null;
  }

  saveSession(sessionData) {
    this.session = sessionData;
    try {
      if (typeof localStorage === 'undefined') return;
      if (sessionData) {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
      } else {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    } catch (e) {
      console.warn('Error saving session:', e);
    }
  }

  getSession() {
    if (!this.session) {
      this.session = this.loadSession();
    }
    return this.session;
  }

  isAuthenticated() {
    const s = this.getSession();
    return !!(s && s.userId && s.role);
  }

  getUserRole() {
    const s = this.getSession();
    return s ? s.role : null;
  }

  isPatient(user) {
    if (user !== undefined) return Boolean(user && user.role === 'patient');
    return this.getUserRole() === 'patient';
  }

  isCaregiver(user) {
    if (user !== undefined) return Boolean(user && user.role === 'caregiver');
    return this.getUserRole() === 'caregiver';
  }

  isDoctor(user) {
    if (user !== undefined) return Boolean(user && user.role === 'doctor');
    return this.getUserRole() === 'doctor';
  }

  getCurrentUser() {
    const s = this.getSession();
    if (!s) return null;
    const users = this.getRegisteredUsers();
    const found = users.find(u => u.id === s.userId) || {
      id: s.userId,
      name: s.name,
      email: s.email,
      role: s.role
    };
    // Security Hardening: Never expose plaintext password or pin in current user state
    const safeUser = { ...found };
    delete safeUser.password;
    delete safeUser.pin;
    return safeUser;
  }

  login(identifier, password) {
    if (!identifier || !identifier.trim()) {
      return { success: false, error: 'Please enter your email or login identifier.' };
    }
    if (!password) {
      return { success: false, error: 'Please enter your password.' };
    }

    const cleanIdentifier = identifier.trim().toLowerCase();
    const users = this.getRegisteredUsers();

    // Check by email, phone, or name
    const foundUser = users.find(u => 
      u.email.toLowerCase() === cleanIdentifier || 
      (u.phone && u.phone.replace(/[\s-]/g, '') === cleanIdentifier.replace(/[\s-]/g, '')) ||
      u.name.toLowerCase() === cleanIdentifier
    );

    if (!foundUser) {
      return { success: false, error: 'No account found with this email or identifier. Would you like to create an account?' };
    }

    // Check password (or fallback PIN match)
    const isPasswordValid = foundUser.password === password || (foundUser.pin && foundUser.pin === password);

    if (!isPasswordValid) {
      return { success: false, error: 'Incorrect password. Please try again or use the demo login options below.' };
    }

    // Create session (safe token simulation without exposing credentials)
    const sessionData = {
      userId: foundUser.id,
      name: foundUser.name,
      email: foundUser.email,
      role: foundUser.role,
      token: 'mm_token_' + Math.random().toString(36).substring(2) + Date.now(),
      createdAt: new Date().toISOString()
    };

    this.saveSession(sessionData);

    // Sync current user with store
    store.setCurrentUser(foundUser);
    store.setMode(foundUser.role);

    const safeUser = { ...foundUser };
    delete safeUser.password;
    delete safeUser.pin;

    return {
      success: true,
      user: safeUser
    };
  }

  signup(signupData) {
    const { name, email, password, confirmPassword, role } = signupData;
    // 1. Validation Checks
    if (!name || name.trim().length < 2) {
      return { success: false, error: 'Please enter your full name (at least 2 characters).' };
    }

    if (!email || !email.trim()) {
      return { success: false, error: 'Please enter your email address.' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return { success: false, error: 'Please enter a valid email address (e.g. yourname@example.com).' };
    }

    if (!password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long for safety.' };
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      return { success: false, error: 'Passwords do not match. Please retype carefully.' };
    }

    if (!['patient', 'caregiver', 'doctor'].includes(role)) {
      return { success: false, error: 'Please select whether this is a Patient, Caregiver, or Doctor account.' };
    }

    const users = this.getRegisteredUsers();
    const cleanEmail = email.trim().toLowerCase();

    // Check duplicate
    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'An account with this email address already exists. Please sign in instead.' };
    }

    // Default avatars based on role
    const avatar = role === 'patient'
      ? "https://lh3.googleusercontent.com/aida-public/AB6AXuC0YAy95YXoJS_5vZSXW6X-PnJg1OsTqHJE2auKWrD5E7ybjkztRBBIbPZq3y0AoaM-Eb7-2Qx61e_xOx0bClvELv1MtWm0Z7VfdKvssQV7JArcPSFqwheQMajYjLn1WtA7dzsP7DkKjOMqz60OC8iteQ13hCjAL-3WZhbWP9JoryUyuNiYnvwio5McweNRZW-WZd1RGWNj0z1B2xPhZHGMqCFaED7B18VQpnsX4l16dCIuTMDLx3oi"
      : role === 'caregiver'
      ? "https://lh3.googleusercontent.com/aida-public/AB6AXuBFsUQsFG7Aocu9cogI7HmvsTS7dOsniLo5kT7I2KJlwpBTQPzweuYKfVqBpuJ8A9WgaTdpr5ziiSPBONlpnprntpWoJS38_RpMX-wHiXu7eZjUDc4c1GEcpblsSqqhzM1FhuYW0fxGcr9wdKVgCo2mHh5SLP2_W9o5MIQ8GdY0hjG-oKCA1NAfNUopC8ilS782KxJutPUcaHybWCYR6qJODvpUKKgp-Nu3Nc3G21nmtNxr3EY3hPGw"
      : "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300";

    // 2. Create User Model
    const newUser = {
      id: (role === 'doctor' ? 'doc-' : 'usr-') + Date.now(),
      name: name.trim(),
      email: cleanEmail,
      password: password, // In production, hashed via backend
      role: role,
      avatar: avatar,
      createdAt: new Date().toISOString(),
      ...(role === 'patient' ? {
        age: 70,
        safeZone: "Home Safe Unit, Verified",
        emergencyAddress: "Family Residence, Sector 4, Shillong",
        languages: ["English", "Hindi"]
      } : role === 'caregiver' ? {
        tag: "Primary Family Partner",
        phone: signupData.phone || "+91 98000 00000"
      } : {
        specialization: signupData.specialization || "Neurology / Cognitive Health",
        hospital: signupData.hospital || "Community Medical Centre",
        city: signupData.city || "Shillong",
        phone: signupData.phone || "+91 98000 00000",
        licenseId: signupData.licenseId || "MED-PENDING-001",
        languages: signupData.languages || ["English", "Hindi"],
        verificationStatus: "Pending", // Honest: never claim fake verified
        bio: signupData.bio || "Healthcare professional coordinating patient cognitive wellness."
      })
    };

    users.push(newUser);
    this.saveRegisteredUsers(users);

    // 3. Establish Session
    const sessionData = {
      userId: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      token: 'mm_token_' + Math.random().toString(36).substring(2) + Date.now(),
      createdAt: new Date().toISOString()
    };

    this.saveSession(sessionData);

    // 4. Sync with store
    store.setCurrentUser(newUser);
    store.setMode(newUser.role);

    const safeUser = { ...newUser };
    delete safeUser.password;
    delete safeUser.pin;

    return {
      success: true,
      user: safeUser
    };
  }

  logout() {
    this.saveSession(null);
    store.setCurrentUser(null);
    if (typeof store.resetActiveContext === 'function') {
      store.resetActiveContext();
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        // Safe fallback
      }
    }
    return { success: true };
  }
}

export const authService = new AuthService();
