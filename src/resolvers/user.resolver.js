import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import Transaction from "../models/transaction.model.js";

const userResolver = {
  Mutation: {
    signUp: async (_, { input }, context) => {
      try {
        const { name, username, password, gender, profilePicture } = input;

        if (!username || !name || !password || !gender) {
          throw new Error("All fields are required!");
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) throw new Error("User already exists!");

        const hashedPassword = await bcrypt.hash(password, 10);

        const generatedProfilePicture =
          profilePicture ||
          (gender === "Male"
            ? `https://avatar.iran.liara.run/public/boy?username=${username}`
            : gender === "Female"
            ? `https://avatar.iran.liara.run/public/girl?username=${username}`
            : `https://example.com/default-avatar.png`);

        const newUser = new User({
          username,
          name,
          password: hashedPassword,
          gender,
          profilePicture: generatedProfilePicture,
        });

        await newUser.save();
        await context.login(newUser);

        return newUser;
      } catch (error) {
        console.error("SignUp Error:", error.message);
        throw new Error(error.message || "Internal Server Error!");
      }
    },

    login: async (_, { input }, context) => {
      try {
        const { username, password } = input;

        if (!username || !password) {
          throw new Error("All fields are required!");
        }

        const { user } = await context.authenticate("graphql-local", {
          username,
          password,
        });

        await context.login(user);
        return user;
      } catch (error) {
        console.error("Login Error:", error.message);
        throw new Error(error.message || "Internal Server Error!");
      }
    },

    logout: async (_, __, context) => {
      try {
        await new Promise((resolve, reject) => {
          context.req.logout((err) => {
            if (err) return reject(err);
            resolve();
          });
        });

        await new Promise((resolve, reject) => {
          context.req.session.destroy((err) => {
            if (err) return reject(err);
            resolve();
          });
        });

        context.res.clearCookie("connect.sid");
        return { message: "Logged out successfully!" };
      } catch (error) {
        console.error("Logout Error:", error.message);
        throw new Error(error.message || "Internal Server Error!");
      }
    },

    signOut: async (_, __, { res }) => {
      try {
        res.clearCookie("refreshToken", {
          httpOnly: true,
          secure: true,
          sameSite: "Strict",
        });
        return { message: "User signed out successfully" };
      } catch (error) {
        console.error("SignOut Error:", error.message);
        throw new Error(error.message || "Internal Server Error!");
      }
    },
  },

  Query: {
    authUser: async (_, __, context) => {
      try {
        const user = await context.getUser();
        return user;
      } catch (error) {
        console.error("Auth Error:", error.message);
        throw new Error("Internal Server Error!");
      }
    },

    user: async (_, { userId }) => {
      try {
        return await User.findById(userId);
      } catch (error) {
        console.error("Query Error:", error.message);
        throw new Error(error.message || "Error getting user!");
      }
    },
  },

  User: {
    transactions: async (parent) => {
      try {
        return await Transaction.find({ userId: parent._id });
      } catch (error) {
        console.error("Transaction Error:", error.message);
        throw new Error(error.message || "Internal Server Error!");
      }
    },
  },
};

export default userResolver;
