const express = require('express');
const bcrypt = require('bcrypt');
const connectToDatabase = require('../middlewares/connectToDatabase');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { username, password } = req.body;

    const db = await connectToDatabase();
    const existingUser = await db.collection('flushuser').findOne({ username });

    if (existingUser) {
      return res.sendStatus(409); // Conflict
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.collection('flushuser').insertOne({ username, password: hashedPassword });

    const users = await db.collection('flushuser').find().sort({ username: 1 }).toArray();

    res.status(201).json(users);
  } catch (error) {
    console.error('Error registering user:', error);
    res.sendStatus(500);
  }
});

module.exports = router;
