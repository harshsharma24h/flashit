const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const session = require('express-session');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Set a default secret key for session encryption
const sessionSecret = 'your_default_secret_key';

app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false
}));





const requireLogin = (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: Missing token' });
    }

    try {
        const decoded = jwt.verify(token.split(' ')[1], sessionSecret);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
};




// MongoDB connection
const uri = 'mongodb+srv://harsh24h:Harsh24h@cluster0.pyykttr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB Atlas');
}).catch(error => {
    console.error('Error connecting to MongoDB Atlas:', error);
    process.exit(1);
});

// Define User schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    adsPosted: { type: Number, default: 0 }
});

const User = mongoose.model('User', userSchema);

// Define Ad schema
const adSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    number: { type: Number, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    images: [{ data: Buffer, contentType: String }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const Ad = mongoose.model('Ad', adSchema);

const storage = multer.memoryStorage();
const upload = multer({
    storage: storage
}).array('images', 5);

const generateToken = (user) => {
    const token = jwt.sign({ userId: user._id }, sessionSecret, { expiresIn: '1h' });
    return token;
};

// Register route
app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        const existingUser = await User.findOne({ username });

        if (existingUser) {
            return res.sendStatus(409); // Conflict
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({ username, password: hashedPassword });

        const users = await User.find().sort({ username: 1 });

        res.status(201).json(users);
    } catch (error) {
        console.error('Error registering user:', error);
        res.sendStatus(500); // Internal Server Error
    }
});

// Login route
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find the user by username
        const user = await User.findOne({ username });

        // Check if user exists and password is correct
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // Set user session data
        req.session.user = {
            _id: user._id,
            username: user.username
        };
        console.log('User session data:', req.session.user);


        // Send response with user token or any other necessary data
        const token = generateToken(user);
        return res.status(200).json({ token });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});




// // Get user profile route
// app.get('/user-profile', requireLogin, async (req, res) => {
//     try {
//         const userId = req.user.userId; // Retrieve user ID from decoded JWT token

//         // Fetch user data from the database based on user ID
//         const user = await User.findById(userId);
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         // Count the number of ads posted by the user
//         const adsPosted = await Ad.countDocuments({ createdBy: userId });

//         // Respond with username and number of ads posted by the user
//         res.status(200).json({
//             username: user.username,
//             adsPosted: adsPosted
//         });
//     } catch (error) {
//         console.error('Error getting user profile:', error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// });





// testing user profil rout 

// Get user profile route
// Update user profile route to include base64-encoded images
app.get('/user-profile', requireLogin, async (req, res) => {
    try {
        const userId = req.user.userId; // Retrieve user ID from decoded JWT token

        // Fetch user data from the database based on user ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Fetch all ads posted by the user
        const ads = await Ad.find({ createdBy: userId }).populate('createdBy'); // Populate createdBy field with user information

        // Convert images to base64 format
        const adsWithBase64Images = ads.map(ad => {
            const base64Images = ad.images ? ad.images.map(image => ({
                contentType: image.contentType,
                data: image.data ? image.data.toString('base64') : null
            })) : [];
            return { ...ad.toObject(), images: base64Images };
        });

        // Respond with username and ads posted by the user
        res.status(200).json({
            username: user.username,
            adsPosted: adsWithBase64Images
        });
    } catch (error) {
        console.error('Error getting user profile:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
















// Logout route
app.post('/logout', (req, res) => {
    try {
        // Destroy the session and clear the user data
        req.session.destroy((err) => {
            if (err) {
                console.error('Error logging out:', err);
                return res.status(500).json({ message: 'Internal Server Error' });
            }
            res.status(200).json({ message: 'Logged out successfully' });
        });
    } catch (error) {
        console.error('Error logging out:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});







// Create ad route
// Create ad route
app.post('/create-ad', requireLogin, upload, async (req, res) => {
    try {
        const { title, description, number, price, category } = req.body;
        const createdBy = req.user.userId; // Retrieve user ID from session data

        // Retrieve username from the database based on createdBy
        const user = await User.findById(createdBy);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Process uploaded images
        const images = req.files.map(file => ({
            data: file.buffer,
            contentType: file.mimetype
        }));

        // Create the ad document with username
        const ad = await Ad.create({
            title,
            description,
            number,
            price,
            category,
            images,
            createdBy: {
                _id: user._id,
                username: user.username // Store username along with the ad
            }
        });

        // Update the count of ads posted by the user
        await User.findByIdAndUpdate(createdBy, { $inc: { adsPosted: 1 } });

        res.status(201).json({ message: 'Ad created successfully', ad });
    } catch (error) {
        console.error('Error creating ad:', error);
        res.status(500).json({ message: 'Failed to create ad' });
    }
});





// Delete ad route
app.delete('/delete-ad/:id', async (req, res) => {
    try {
        const adId = req.params.id;
        const deletedAd = await Ad.findByIdAndDelete(adId);
        if (!deletedAd) {
            return res.status(404).json({ message: 'Ad not found' });
        }
        res.status(200).json({ message: 'Ad deleted successfully', deletedAd });
    } catch (error) {
        console.error('Error deleting ad:', error);
        res.status(500).json({ message: 'Failed to delete ad' });
    }
});







// Get all ads route
app.get('/get-ads', async (req, res) => {
    try {
        const ads = await Ad.find().populate('createdBy'); // Populate createdBy field with user information
        const adsWithBase64Images = ads.map(ad => {
            const base64Images = ad.images ? ad.images.map(image => ({
                contentType: image.contentType,
                data: image.data ? image.data.toString('base64') : null
            })) : [];
            return { ...ad.toObject(), images: base64Images };
        });
        res.status(200).json(adsWithBase64Images);
    } catch (error) {
        console.error('Error getting ads:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});







const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});