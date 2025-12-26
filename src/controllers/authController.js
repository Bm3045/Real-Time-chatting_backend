const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwtUtils');

const register = async (req, res) => {
    try {
        console.log('📝 Registration attempt:', req.body);
        
        const { username, email, password } = req.body;

        // Validation
        if (!username || !email || !password) {
            console.log('❌ Missing fields');
            return res.status(400).json({ 
                error: 'All fields are required',
                details: 'Username, email, and password are mandatory'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ 
            $or: [{ email: email.toLowerCase() }, { username }] 
        });
        
        if (existingUser) {
            console.log('❌ User already exists:', existingUser.email);
            return res.status(400).json({ 
                error: 'User already exists',
                details: existingUser.email === email.toLowerCase() 
                    ? 'Email already registered' 
                    : 'Username already taken'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('🔐 Password hashed successfully');

        // Create user
        const user = new User({
            username,
            email: email.toLowerCase(),
            password: hashedPassword
        });

        await user.save();
        console.log('✅ User saved to database:', user._id);

        // Generate token
        const token = generateToken(user._id);
        console.log('🎟️ Token generated');

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            },
            token
        });
        
    } catch (error) {
        console.error('🔥 Registration error details:', error);
        console.error('🔥 Error stack:', error.stack);
        
        // More specific error messages
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                error: 'Validation failed',
                details: error.message 
            });
        }
        
        if (error.code === 11000) {
            return res.status(400).json({ 
                error: 'Duplicate entry',
                details: 'Username or email already exists' 
            });
        }
        
        res.status(500).json({ 
            error: 'Registration failed',
            details: process.env.NODE_ENV === 'development' 
                ? error.message 
                : 'Internal server error'
        });
    }
};

const login = async (req, res) => {
    try {
        console.log('🔑 Login attempt:', req.body.email);
        
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        // Find user
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            console.log('❌ User not found:', email);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            console.log('❌ Invalid password for:', email);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate token
        const token = generateToken(user._id);
        console.log('✅ Login successful for:', email);

        res.json({
            message: 'Login successful',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                isOnline: true
            },
            token
        });
    } catch (error) {
        console.error('🔥 Login error:', error);
        res.status(500).json({ 
            error: 'Login failed',
            details: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
};

const getProfile = async (req, res) => {
    try {
        res.json({
            user: req.user
        });
    } catch (error) {
        console.error('🔥 Profile error:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
};

module.exports = { register, login, getProfile };