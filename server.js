const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken'); // Add this line to import JWT






const app = express();
app.use(bodyParser.json());
app.use(cors());



const session = require('express-session');

app.use(session({
  secret: 'your_secret_key', // Replace with a secret key for session encryption
  resave: false,
  saveUninitialized: false
}));





// Define requireLogin middleware
const requireLogin = (req, res, next) => {
  console.log('Session:', req.session); // Check the session object
  if (!req.session || !req.session.user) {
    console.log('Unauthorized');
    return res.status(401).json({ message: 'Unauthorized' });
  }
  console.log('Authorized');
  next();
};
 





// MongoDB connection
const uri = 'mongodb+srv://harsh24h:Harsh24h@cluster0.pyykttr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'; // Replace 'YOUR_MONGODB_URI' with your MongoDB Atlas URI

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
  adsPosted: { type: Number, default: 0 } // New field to store the count of ads posted by the user
});

const User = mongoose.model('User', userSchema);

// Define Ad schema
// Update the Ad schema to store images as binary data
const adSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  number: { type: Number, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true }, // New category field
  images: [{ data: Buffer, contentType: String }] ,// Store images as binary data
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Reference to the user who created the ad
});

const Ad = mongoose.model('Ad', adSchema);

// Multer storage configuration
const storage = multer.memoryStorage(); // Store files in memory as buffers
const upload = multer({
  storage: storage
}).array('images', 5); // Allow multiple image uploads, with a limit of 5





// Function to generate JWT token
const generateToken = (user) => {
  // Replace 'your_secret_key' with your actual secret key used for signing the token
  const token = jwt.sign({ userId: user._id }, 'your_secret_key', { expiresIn: '1h' });
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

// // // Login route 
// app.post('/login', async (req, res) => {
//   try {
//     const { username, password } = req.body;

//     const user = await User.findOne({ username });

//     if (!user) {
//       return res.sendStatus(401); // Unauthorized
//     }

//     const passwordMatch = await bcrypt.compare(password, user.password);

//     if (passwordMatch) {
//       return res.sendStatus(200); // OK
//     } else {
//       return res.sendStatus(401); // Unauthorized
//     }
//   } catch (error) {
//     console.error('Error logging in:', error);
//     res.sendStatus(500); // Internal Server Error
//   }
// });



// test rout for login 

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
      // Generate and send a token upon successful login
      const token = generateToken(user);
      console.log("this coming from ferver file",token)
      return res.status(200).json({ token }); // Return token in JSON format
    } else {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});













// // Create ad route with image upload
// app.post('/create-ad', async (req, res) => {
//   try {
//     upload(req, res, async (err) => {
//       if (err) {
//         console.error(err);
//         return res.status(500).send('Error uploading file');
//       }
      
//       const { title, description, price,number,category } = req.body;
//       const images = req.files || [];

//       // Convert images to binary data
//       const imageBuffers = images.map(image => ({
//         data: image.buffer,
//         contentType: image.mimetype
//       }));

//       const ad = await Ad.create({ title, description,number, price,category, images: imageBuffers });

//       res.status(201).json({ message: 'Ad created successfully', ad });
//     });
//   } catch (error) {
//     console.error('Error creating ad:', error);
//     res.status(500).json({ message: 'Failed to create ad' });
//   }
// });





// test rout 


app.post('/create-ad', requireLogin, async (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Error uploading file');
      }

      const { title, description, price, number, category } = req.body;
      const images = req.files || [];

      // Convert images to binary data
      const imageBuffers = images.map(image => ({
        data: image.buffer,
        contentType: image.mimetype
      }));

      // Get the user ID from the session
      const userId = req.session.user._id;

      // Create the ad associated with the logged-in user
      const ad = await Ad.create({ title, description, number, price, category, images: imageBuffers, createdBy: userId });

      // Update the adsPosted count for the user
      await User.findByIdAndUpdate(userId, { $inc: { adsPosted: 1 } });

      res.status(201).json({ message: 'Ad created successfully', ad });
    });
  } catch (error) {
    console.error('Error creating ad:', error);
    res.status(500).json({ message: 'Failed to create ad' });
  }
});












app.delete('/delete-ad/:id', async (req, res) => {
  try {
    const adId = req.params.id;

    // Find ad by ID and delete it
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
    const ads = await Ad.find();

    const adsWithBase64Images = ads.map(ad => {
      const base64Images = ad.images ? ad.images.map(image => ({
        contentType: image.contentType,
        data: image.data ? image.data.toString('base64') : null
      })) : []; // Handle case where ad.images is undefined or empty
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
