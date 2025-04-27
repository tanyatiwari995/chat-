import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: String,
      default: "https://example.com/default-avatar.png",
    },
    gender: {
      type: String,
      enum: [
        "Male",
        "Female",
        "Non-binary",
        "Transgender",
        "Intersex",
        "Genderqueer",
        "Agender",
        "Bigender",
        "Genderfluid",
        "Two-Spirit",
        "Other",
        "Prefer not to say"
      ],
      default: "Prefer not to say"
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
export default User;
