const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');

const router = express.Router();

router.post('/users', async (req, res) => {
  //Create new user
  try {
    const user = new User(req.body);
    await user.save();
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token })
  } catch (error) {
    res.status(400).send(error)
  }
});

router.post('/users/login', (req, res) => {
  //Login a registered user
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ email })
    .then(user => {
      if (!user) {
        return res.status(400).send('No user found')
      }
      bcrypt.compare(password, user.password, (err, result) => {
        if (err) {
          return res.status(400).send('Error occurred')
        }
        if (result) {
          const token = user.generateAuthToken();
          res.status(200).send({ "message": "LOGGED IN", user, token})
        } else {
          return res.status(400).send('Password is not correct')
        }
      }); 
    })
    .catch(error => {
      res.status(400).send(email)
    })
});

router.get('/users/me', auth, async(req, res) => {
  // View logged in user profile
  res.send(req.user)
})

module.exports = router;