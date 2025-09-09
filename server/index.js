import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import dotenv from 'dotenv';
import User from './models/User.js';
import sequelize from './config/database.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3003;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist')));

// Initialize database and create tables
async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // Force sync to recreate tables (use with caution in production)
    await sequelize.sync({ force: true });
    console.log('Database models synchronized.');

    // Create default admin user if it doesn't exist
    const adminExists = await User.findOne({ where: { username: 'admin' } });
    if (!adminExists) {
      await User.create({
        username: 'admin',
        password: 'admin', // In production, use proper password hashing
        name: 'Admin User',
        role: 'admin',
        active: true
      });
      console.log('Default admin user created.');
    }
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

initializeDatabase();

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('Login attempt for username:', username);

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    const user = await User.findOne({ 
      where: { 
        username,
        active: true
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    // In production, use proper password comparison with hashing
    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    // Update last active timestamp
    await user.update({ lastActive: new Date() });
    
    // Return user data without password
    const { password: _, ...userWithoutPassword } = user.toJSON();
    
    res.json({
      success: true,
      message: 'Login successful',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// User management endpoints
app.get('/api/users', async (_req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching users' });
  }
});


app.get('/api/users', async (res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });
    console.log('Users fetched:', users);  // Add this log to see if users are fetched
    res.json({ success: true, users });
  } catch (error) {
    console.error('Error fetching users:', error); // Log the error here
    res.status(500).json({ success: false, message: 'Error fetching users' });
  }
});

// const users = await User.findAll({
//   attributes: { exclude: ['password'] }
// });



app.post('/api/users', async (req, res) => {
  try {
    const { username, password, name, email, role } = req.body;
    console.log('Received user creation request:', { username, name, email, role });

    // Validate required fields
    if (!username || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Username, password, and name are required'
      });
    }

    // Check if username already exists
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Username already exists'
      });
    }

    // Create new user with all required fields
    const user = await User.create({
      username,
      password, // In production, hash the password
      name,
      email: email || null,
      role: role || 'user',
      active: true,
      joinDate: new Date(),
      lastActive: new Date()
    });

    console.log('User created successfully:', user.toJSON());

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user.toJSON();
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message
    });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    await user.update(req.body);
    const { password, ...userWithoutPassword } = user.toJSON();
    res.json({ success: true, user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating user' });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    await user.destroy();
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting user' });
  }
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log('Press Ctrl+C to stop the server');
}); 