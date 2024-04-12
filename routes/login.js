const express = require('express');
const bcrypt = require('bcrypt');
const connectToDatabase = require('../middlewares/connectToDatabase');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { username, password } = req.body;

    const db = await connectToDatabase();
    const user = await db.collection('flushuser').findOne({ username });

    if (!user) {
      return res.sendStatus(401); // Unauthorized
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
      return res.sendStatus(200); // OK
    } else {
      return res.sendStatus(401); // Unauthorized
    }
  } catch (error) {
    console.error('Error logging in:', error);
    res.sendStatus(500);
  }
});

module.exports = router;
