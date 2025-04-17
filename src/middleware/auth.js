// middleware/auth.js

// export default function auth(req, res, next) {
//     if (!req.session.user) {
     
//       return res.status(401).json({ message: 'Unauthorized' });
//     }
//     next(); 
//   

  export default function auth(req, res, next) {
    if (!req.session.user) {
      return res.status(401).json({ message: 'Unauthorized' });  // Return Unauthorized if no session
    }
    next(); // Proceed to the next middleware/route if authenticated
  }
  