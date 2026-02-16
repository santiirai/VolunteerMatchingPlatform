import { prisma } from '../libs/prisma.js';
import path from 'path';
import fs from 'fs';

export const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        skills: true,
        location: true,
        createdAt: true,
        updatedAt: true
      }
    });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    // Attach image URL from local store if present
    const mappingFile = path.join(process.cwd(), 'uploads', 'profile.json');
    let imageUrl = null;
    try {
      if (fs.existsSync(mappingFile)) {
        const raw = fs.readFileSync(mappingFile, 'utf8');
        const map = JSON.parse(raw || '{}');
        imageUrl = map[String(user.id)] || null;
      }
    } catch {}
    res.status(200).json({ success: true, data: { ...user, profileImageUrl: imageUrl } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get profile', error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, skills, location } = req.body;
    const data = {};
    if (name !== undefined) data.name = name;
    if (skills !== undefined) data.skills = skills;
    if (location !== undefined) data.location = location;

    // Update basic fields
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data
    });

    // If a file was uploaded by multer, store mapping file for image URL
    if (req.file) {
      const imageUrl = `/uploads/${path.basename(req.file.path)}`;
      const mappingFile = path.join(process.cwd(), 'uploads', 'profile.json');
      let map = {};
      try {
        if (fs.existsSync(mappingFile)) {
          map = JSON.parse(fs.readFileSync(mappingFile, 'utf8') || '{}');
        }
      } catch {}
      map[String(updated.id)] = imageUrl;
      fs.writeFileSync(mappingFile, JSON.stringify(map, null, 2), 'utf8');
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated',
      data: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        skills: updated.skills,
        location: updated.location,
        // Return imageUrl from mapping file
        profileImageUrl: (() => {
          try {
            const mappingFile = path.join(process.cwd(), 'uploads', 'profile.json');
            const map = JSON.parse(fs.readFileSync(mappingFile, 'utf8') || '{}');
            return map[String(updated.id)] || null;
          } catch { return null; }
        })()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update profile', error: error.message });
  }
};
