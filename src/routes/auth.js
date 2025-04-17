// import express from 'express';
// import User from '../models/user.model.js';

// const router = express.Router();

// router.post('/login', async (req, res) => {
//   const { username } = req.body;
//   let user = await User.findOne({ username });
//   if (!user) user = await User.create({ username });
//   res.json(user);
// });

// // export default router;



// routes/auth.js
import express from 'express';
import User from '../models/user.model.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  const { username } = req.body;
  let user = await User.findOne({ username });

  if (!user) {
    user = await User.create({ username });
  }

  req.session.user = user; // Store session
  res.json(user);
});

export default router;
