// // import passport from "passport";
// import bcrypt from "bcryptjs";
// import User from "../models/user.model.js";
// import { GraphQLLocalStrategy } from "graphql-passport";

// export const configurePassport = () => {
//     // Remove serialize/deserialize logic as it's not needed for JWT
//     // passport.serializeUser((user, done) => {
//     //     console.log("Serializing user");
//     //     done(null, user.id);
//     // });

//     // passport.deserializeUser(async (id, done) => {
//     //     console.log("Deserializing user");
//     //     try {
//     //         const user = await User.findById(id);
//     //         done(null, user);
//     //     } catch (err) {
//     //         done(err);
//     //     }
//     // });

//     passport.use(
//         new GraphQLLocalStrategy(async (username, password, done) => {
//             try {
//                 const user = await User.findOne({ username });
//                 if (!user) {
//                     throw new Error("Invalid username or password");
//                 }
//                 const validPassword = await bcrypt.compare(password, user.password);

//                 if (!validPassword) {
//                     throw new Error("Invalid username or password");
//                 }
//                 return done(null, user); // No session logic needed here
//             } catch (err) {
//                 return done(err);
//             }
//         })
//     );
// };

import passport from 'passport';
import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import { GraphQLLocalStrategy } from 'graphql-passport';

export const configurePassport = () => {
  // Use GraphQLLocalStrategy for username/password authentication
  passport.use(
    new GraphQLLocalStrategy(async (username, password, done) => {
      try {
        // Find user by username
        const user = await User.findOne({ username });
        if (!user) {
          return done(null, false, { message: 'Invalid username or password' });
        }

        // Check password validity
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
          return done(null, false, { message: 'Invalid username or password' });
        }

        // Return user if authentication is successful
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  // Passport does not require session serialization when using JWT, so we omit that part
  // (No need for serialize/deserialize for JWT)

  // Passport will work with GraphQL context for authentication
  passport.serializeUser((user, done) => {
    done(null, user.id); // We store the user ID in JWT token when creating it
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};
