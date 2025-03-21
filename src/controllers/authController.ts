import { Request, Response } from "express";
import crypto from "crypto"; // To generate API keys
import User from "../models/userModel";

// Register User & Generate API Key
export const registerUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { username, password, email } = req.body;
  
      if (!username || !password || !email) {
        res.status(400).json({ message: "Username, email, and password are required" });
        return;
      }
  
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(400).json({ message: "Email already taken" });
        return;
      }
  
      const apiKey = crypto.randomBytes(32).toString("hex");
  
      const newUser = new User({ username, password, email, apiKey });
      await newUser.save();
  
      res.status(201).json({ message: "User registered", apiKey });
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({ message: "Failed to register" });
    }
  };
  

// Login User
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user || user.password !== password) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    res.json({ message: "Login successful", apiKey: user.apiKey });
  } catch (error) {
    res.status(500).json({ message: "Login failed" });
  }
};

// Logout User
export const logoutUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const apiKey = req.header("Authorization")?.replace("Bearer ", "");
  
      if (!apiKey) {
        res.status(400).json({ message: "No API key provided" });
        return;
      }
  
      const user = await User.findOne({ apiKey });
  
      if (!user) {
        res.status(400).json({ message: "Invalid API key" });
        return;
      }
  
      // You could add a `loggedOut` flag or store active sessions instead
      res.json({ message: "Logged out successfully. API key remains valid for future logins." });
    } catch (error) {
      res.status(500).json({ message: "Logout failed" });
    }
  };

// Get User
export const getUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const apiKey = req.header("Authorization");
  
      if (!apiKey) {
        res.status(400).json({ message: "API key required" });
        return;
      }
  
      const user = await User.findOne({ apiKey });
  
      if (!user || user.loggedOut) { // Prevent access if logged out
        res.status(401).json({ message: "Unauthorized or logged out" });
        return;
      }
  
      res.json({ username: user.username });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  };
