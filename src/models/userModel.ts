import mongoose, { Mongoose } from 'mongoose';
import bcrypt from 'bcrypt';

import { IUnit } from './unitModel';

export interface IUser extends mongoose.Document {
  username: string;
  email: string;
  password: string;
  units: IUnit[];
  passwordConfirm: string | undefined;
  role: string;
  active: boolean;
  activationToken: string | null;
  passwordChangedAt: number | null;
  passwordResetToken: string | null;
  passwordResetTokenExpires: number | null;
  passwordCheck: (candidatePassword: string) => Boolean;
}

const userSchema = new mongoose.Schema<IUser>({
  username: {
    type: String,
    required: [true, 'Please provide your username'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 3,
    select: false,
  },
  passwordConfirm: {
    type: String,
  },
  role: {
    type: String,
    enum: ['user'],
    default: 'user',
  },
  active: {
    type: Boolean,
    default: false,
  },
  activationToken: String,
  passwordChangedAt: Number,
  passwordResetToken: String,
  passwordResetTokenExpires: Number,
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.passwordCheck = async function (candidatePassword: string) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
