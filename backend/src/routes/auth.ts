import { Router } from 'express';
import { safeError } from '../utils/errors.js';
import { z } from 'zod';
import { prisma } from '../prisma.js';
import { hashPassword, comparePassword, generateAccessToken, generateRefreshToken, verifyAccessToken } from '../utils/auth.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { OAuth2Client } from 'google-auth-library';

const router = Router();
const googleClient = new OAuth2Client();

const RegisterSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_-]+$/),
  email: z.string().email(),
  password: z.string().min(8).max(200),
  name: z.string().optional(),
});

const LoginSchema = z.object({
  usernameOrEmail: z.string(),
  password: z.string(),
});

// Register
router.post('/register', async (req, res): Promise<void> => {
  try {
    const data = RegisterSchema.parse(req.body);

    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ username: data.username }, { email: data.email }]
      }
    });

    if (existing) {
      res.status(400).json({ error: 'Username or email already taken' });
      return;
    }

    const passwordHash = await hashPassword(data.password);
    const user = await prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        name: data.name || data.username,
        passwordHash,
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${data.username}`,
      },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        avatarUrl: true,
        bio: true,
        role: true,
        createdAt: true,
      }
    });

    const accessToken = generateAccessToken({ userId: user.id, username: user.username, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id, username: user.username, role: user.role });

    res.status(201).json({ user, accessToken, refreshToken });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation failed', details: err.errors });
      return;
    }
    res.status(500).json({ error: safeError(err, 'Registration failed') });
  }
});

// Login
router.post('/login', async (req, res): Promise<void> => {
  try {
    const data = LoginSchema.parse(req.body);

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: data.usernameOrEmail },
          { email: data.usernameOrEmail }
        ]
      }
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const isValid = await comparePassword(data.password, user.passwordHash);
    if (!isValid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const accessToken = generateAccessToken({ userId: user.id, username: user.username, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id, username: user.username, role: user.role });

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        role: user.role,
        createdAt: user.createdAt,
      },
      accessToken,
      refreshToken,
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation failed', details: err.errors });
      return;
    }
    res.status(500).json({ error: safeError(err, 'Login failed') });
  }
});

// Get Current User
router.get('/me', requireAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        avatarUrl: true,
        bio: true,
        role: true,
        createdAt: true,
        badges: {
          include: { badge: true }
        },
        _count: {
          select: {
            prompts: true,
            stars: true,
            followers: true,
            following: true,
          }
        }
      }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (err: any) {
    res.status(500).json({ error: safeError(err, 'Failed to fetch user profile') });
  }
});

// Google Sign-In verification endpoint
router.post('/google', async (req, res): Promise<void> => {
  try {
    const { credential, accessToken: googleAccessToken } = req.body;
    if (!credential && !googleAccessToken) {
      res.status(400).json({ error: 'Missing Google credential or access token' });
      return;
    }

    let email: string;
    let name: string;
    let picture: string | undefined;

    if (googleAccessToken) {
      // Fetch user profile from Google using the access token from the popup
      const googleUserRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${googleAccessToken}` }
      });
      if (!googleUserRes.ok) {
        res.status(401).json({ error: 'Failed to verify Google access token' });
        return;
      }
      const googleUser: any = await googleUserRes.json();
      email = (googleUser.email || '').toLowerCase();
      name = googleUser.name || googleUser.given_name || email.split('@')[0];
      picture = googleUser.picture;
    } else if (credential.startsWith('dev-google-sim:') && process.env.NODE_ENV !== 'production') {
      // Development-only simulated sign-in. MUST stay gated on NODE_ENV: without the
      // gate, anyone could POST this to obtain a token for any email (account takeover).
      const parts = credential.split(':');
      email = (parts[1] || 'google.creator@gmail.com').toLowerCase();
      name = parts[2] || 'Google Creator';
      picture = `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`;
    } else {
      // Verify the Google ID Token with Google's servers
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: clientId || undefined,
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        res.status(400).json({ error: 'Invalid Google token payload' });
        return;
      }

      email = payload.email.toLowerCase();
      name = payload.name || payload.given_name || email.split('@')[0];
      picture = payload.picture;
    }

    // 1. Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        avatarUrl: true,
        bio: true,
        role: true,
        createdAt: true,
      }
    });

    if (!user) {
      // 2. Generate a clean, unique username
      let baseUsername = email.split('@')[0].replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase();
      if (baseUsername.length < 3) baseUsername = `user_${baseUsername}`;
      if (baseUsername.length > 20) baseUsername = baseUsername.slice(0, 20);

      let uniqueUsername = baseUsername;
      const existingWithUsername = await prisma.user.findUnique({ where: { username: uniqueUsername } });
      if (existingWithUsername) {
        uniqueUsername = `${baseUsername}_${Math.random().toString(36).substring(2, 6)}`;
      }

      // 3. Create new user with random password hash
      const randomPassword = await hashPassword(Math.random().toString(36) + Date.now());
      user = await prisma.user.create({
        data: {
          username: uniqueUsername,
          email,
          name,
          avatarUrl: picture || `https://api.dicebear.com/7.x/bottts/svg?seed=${uniqueUsername}`,
          passwordHash: randomPassword,
        },
        select: {
          id: true,
          username: true,
          email: true,
          name: true,
          avatarUrl: true,
          bio: true,
          role: true,
          createdAt: true,
        }
      });
    }

    // 4. Issue standard OmniPrompt tokens
    const accessToken = generateAccessToken({ userId: user.id, username: user.username, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id, username: user.username, role: user.role });

    res.json({
      user,
      accessToken,
      refreshToken,
    });
  } catch (err: any) {
    console.error('Google Auth Error:', err);
    res.status(401).json({ error: 'Google authentication failed: ' + (safeError(err, 'Invalid token')) });
  }
});

export default router;

