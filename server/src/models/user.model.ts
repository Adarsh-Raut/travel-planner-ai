import mongoose, { Schema } from "mongoose";

export interface UserDocument extends mongoose.Document {
  name?: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDocument>(
  {
    name: { type: String, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true },
);

export interface PublicUser {
  id: string;
  name?: string;
  email: string;
  createdAt: Date;
}

export function toPublicUser(user: UserDocument): PublicUser {
  return {
    id: user._id.toString(),
    ...(user.name ? { name: user.name } : {}),
    email: user.email,
    createdAt: user.createdAt,
  };
}

export const User = mongoose.model<UserDocument>("User", userSchema);
