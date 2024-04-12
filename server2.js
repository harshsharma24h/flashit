// const express = require('express');
// const bodyParser = require('body-parser');
// const bcrypt = require('bcrypt');
// const { MongoClient } = require('mongodb');
// const cors = require('cors');

// const app = express();
// app.use(bodyParser.json());
// app.use(cors()); // Add this line to enable CORS for all origins




// // MongoDB connection
// const uri = 'mongodb+srv://harsh24h:Harsh24h@cluster0.pyykttr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
// const client = new MongoClient(uri);

// async function connectToDatabase() {
//   try {
//     await client.connect();
//     console.log('Connected to MongoDB Atlas');
//     return client.db(); // No need to specify the database name if not provided in the connection string
//   } catch (error) {
//     console.error('Error connecting to MongoDB Atlas:', error);
//     process.exit(1);
//   }
// }

// module.exports = connectToDatabase;

// // Define User schema
// const { Schema, model } = require('mongoose');

// const userSchema = new Schema({
//   username: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
// });

// const User = model('User', userSchema);

// // Register route
// app.post('/register', async (req, res) => {
//   try {
//     const { username, password } = req.body;

//     const db = await connectToDatabase();
//     const existingUser = await db.collection('flushuser').findOne({ username });

//     if (existingUser) {
//       return res.sendStatus(409); // Conflict
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     await db.collection('flushuser').insertOne({ username, password: hashedPassword });

//     // Sort the collection by username ascending
//     const users = await db.collection('flushuser').find().sort({ username: 1 }).toArray();

//     res.status(201).json(users); // Send sorted user data back to the client
//   } catch (error) {
//     console.error('Error registering user:', error);
//     res.sendStatus(500); // Internal Server Error
//   }
// });


// // Login route
// app.post('/login', async (req, res) => {
//     try {
//       const { username, password } = req.body;
  
//       const db = await connectToDatabase();
//       const user = await db.collection('flushuser').findOne({ username });
  
//       if (!user) {
//         return res.sendStatus(401); // Unauthorized
//       }
  
//       const passwordMatch = await bcrypt.compare(password, user.password);
  
//       if (passwordMatch) {
//         return res.sendStatus(200); // OK
//       } else {
//         return res.sendStatus(401); // Unauthorized
//       }
//     } catch (error) {
//       console.error('Error logging in:', error);
//       res.sendStatus(500); // Internal Server Error
//     }
//   });
  




// async function startServer() {
//   try {
//     await connectToDatabase();
//     const PORT = process.env.PORT || 5000;
//     app.listen(PORT, () => {
//       console.log(`Server is running on port ${PORT}`);
//     });
//   } catch (error) {
//     console.error('Error starting server:', error);
//     process.exit(1);
//   }
// }

// startServer();





// after all working 

// const express = require('express');
// const bodyParser = require('body-parser');
// const bcrypt = require('bcrypt');
// const cors = require('cors');
// const mongoose = require('mongoose');

// const app = express();
// app.use(bodyParser.json());
// app.use(cors());

// // MongoDB connection
// const uri = 'mongodb+srv://harsh24h:Harsh24h@cluster0.pyykttr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// async function connectToDatabase() {
//   try {
//     await mongoose.connect(uri, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true
//     });
//     console.log('Connected to MongoDB Atlas');
//   } catch (error) {
//     console.error('Error connecting to MongoDB Atlas:', error);
//     process.exit(1);
//   }
// }

// connectToDatabase();

// // Define User schema
// const userSchema = new mongoose.Schema({
//   username: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
// });

// const User = mongoose.model('User', userSchema);

// // Define Ad schema
// const adSchema = new mongoose.Schema({
//   title: { type: String, required: true },
//   description: { type: String, required: true },
//   price: { type: Number, required: true }
// });

// const Ad = mongoose.model('Ad', adSchema);

// // Register route
// app.post('/register', async (req, res) => {
//   try {
//     const { username, password } = req.body;

//     const existingUser = await User.findOne({ username });

//     if (existingUser) {
//       return res.sendStatus(409); // Conflict
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     await User.create({ username, password: hashedPassword });

//     const users = await User.find().sort({ username: 1 });

//     res.status(201).json(users);
//   } catch (error) {
//     console.error('Error registering user:', error);
//     res.sendStatus(500); // Internal Server Error
//   }
// });

// // Login route 
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

// // Create ad route
// app.post('/create-ad', async (req, res) => {
//   try {
//     const { title, description, price } = req.body;

//     const ad = await Ad.create({ title, description, price });

//     res.status(201).json({ message: 'Ad created successfully', ad });
//   } catch (error) {
//     console.error('Error creating ad:', error);
//     res.status(500).json({ message: 'Failed to create ad' });
//   }
// });

// // Get all ads route
// app.get('/get-ads', async (req, res) => {
//   try {
//     const ads = await Ad.find();
//     res.status(200).json(ads);
//   } catch (error) {
//     console.error('Error getting ads:', error);
//     res.status(500).json({ message: 'Internal Server Error' });
//   }
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });






// ad are creating but images are not desplaying properly 

// const express = require('express');
// const bodyParser = require('body-parser');
// const bcrypt = require('bcrypt');
// const cors = require('cors');
// const mongoose = require('mongoose');
// const multer = require('multer');
// const path = require('path');

// const app = express();
// app.use(bodyParser.json());
// app.use(cors());

// // MongoDB connection
// const uri = 'mongodb+srv://harsh24h:Harsh24h@cluster0.pyykttr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// async function connectToDatabase() {
//   try {
//     await mongoose.connect(uri, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true
//     });
//     console.log('Connected to MongoDB Atlas');
//   } catch (error) {
//     console.error('Error connecting to MongoDB Atlas:', error);
//     process.exit(1);
//   }
// }

// connectToDatabase();

// // Define User schema
// const userSchema = new mongoose.Schema({
//   username: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
// });

// const User = mongoose.model('User', userSchema);

// // Define Ad schema
// const adSchema = new mongoose.Schema({
//   title: { type: String, required: true },
//   description: { type: String, required: true },
//   price: { type: Number, required: true },
//   images: [{ type: String }] // Array of image URLs
// });

// const Ad = mongoose.model('Ad', adSchema);

// // Configure Multer for file uploads
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'uploads/')
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
//   }
// })

// const upload = multer({ storage: storage });

// // Register route
// app.post('/register', async (req, res) => {
//   try {
//     const { username, password } = req.body;

//     const existingUser = await User.findOne({ username });

//     if (existingUser) {
//       return res.sendStatus(409); // Conflict
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     await User.create({ username, password: hashedPassword });

//     const users = await User.find().sort({ username: 1 });

//     res.status(201).json(users);
//   } catch (error) {
//     console.error('Error registering user:', error);
//     res.sendStatus(500); // Internal Server Error
//   }
// });

// // Login route 
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

// // Create ad route with image upload
// app.post('/create-ad', (req, res, next) => {
//   upload.array('images')(req, res, (err) => {
//     if (err) {
//       console.error('Error uploading files:', err);
//       return res.status(500).json({ message: 'Failed to upload files' });
//     }
//     next();
//   });
// }, async (req, res) => {
//   try {
//     const { title, description, price } = req.body;
//     const images = req.files ? req.files.map(file => file.path) : [];

//     const ad = await Ad.create({ title, description, price, images });

//     res.status(201).json({ message: 'Ad created successfully', ad });
//   } catch (error) {
//     console.error('Error creating ad:', error);
//     res.status(500).json({ message: 'Failed to create ad' });
//   }
// });


// // Get all ads route
// app.get('/get-ads', async (req, res) => {
//   try {
//     const ads = await Ad.find();
//     res.status(200).json(ads);
//   } catch (error) {
//     console.error('Error getting ads:', error);
//     res.status(500).json({ message: 'Internal Server Error' });
//   }
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });  



