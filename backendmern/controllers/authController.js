import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/User.js";

const generateToken = (userId) => {
  return jwt.sign(
    {
      id: userId,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

const generateUsername = async (name) => {
  const baseUsername = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, "");

  let username =
    baseUsername || `user${Date.now()}`;

  let exists = await User.findOne({ username });

  let counter = 1;

  while (exists) {
    username = `${baseUsername}${counter}`;
    exists = await User.findOne({ username });
    counter++;
  }

  return username;
};

export const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      username,
      avatar,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters",
      });
    }

    const normalizedEmail =
      email.toLowerCase().trim();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered",
      });
    }

    let finalUsername;

    if (username) {
      finalUsername = username
        .toLowerCase()
        .trim();

      const usernameExists =
        await User.findOne({
          username: finalUsername,
        });

      if (usernameExists) {
        return res.status(409).json({
          success: false,
          message: "Username is already taken",
        });
      }
    } else {
      finalUsername =
        await generateUsername(name);
    }

    const hashedPassword =
      await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      username: finalUsername,
      email: normalizedEmail,
      password: hashedPassword,
      avatar:
        avatar ||
        `https://i.pravatar.cc/150?u=${normalizedEmail}`,
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: "Account created successfully",

      token,

      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        isOnline: user.isOnline,
        lastSeen: user.lastSeen,
      },
    });
  } catch (error) {
    console.error("Register error:", error);

    return res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } =
      req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required",
      });
    }

    // const user = await User.findOne({
    //   email: email.toLowerCase().trim(),
    // }).select("+password");

    // if (!user) {
    //   return res.status(401).json({
    //     success: false,
    //     message: "Invalid email or password",
    //   });
    // }

    // const passwordMatch =
    //   await bcrypt.compare(
    //     password,
    //     user.password
    //   );

    // if (!passwordMatch) {
    //   return res.status(401).json({
    //     success: false,
    //     message: "Invalid email or password",
    //   });
    // }


    const user = await User.findOne({
  email: email.toLowerCase().trim(),
}).select("+password");

if (!user) {
  return res.status(401).json({
    message: "Invalid email or password",
  });
}

const isPasswordCorrect = await bcrypt.compare(
  password,
  user.password
);

if (!isPasswordCorrect) {
  return res.status(401).json({
    message: "Invalid email or password",
  });
}

    user.lastSeen = new Date();

    await user.save();

    const token = generateToken(user._id);

    return res.json({
      success: true,
      message: "Login successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        isOnline: user.isOnline,
        lastSeen: user.lastSeen,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

export const getMe = async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      username: req.user.username,
      email: req.user.email,
      avatar: req.user.avatar,
      bio: req.user.bio,
      isOnline: req.user.isOnline,
      lastSeen: req.user.lastSeen,
    },
  });
};