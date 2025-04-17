const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/login', async (req, res) => {
  const { username } = req.body;
  let user = await User.findOne({ username });
  if (!user) user = await User.create({ username });
  res.json(user);
});

// module.exports = router;
export default router;  // default export for router
