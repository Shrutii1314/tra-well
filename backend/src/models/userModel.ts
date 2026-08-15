import { Schema, model, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

// 1. Define the core properties of a User
export interface IUser extends Document {
  name: string;
  email: string;
  role: 'user' | 'guide' | 'lead-guide' | 'admin';
  password: string;
  passwordConfirm?: string; // Made optional since we clear it before saving
  active: boolean;
}

// 2. Define the custom methods interface
interface IUserMethods {
  correctPassword(candidatePassword: string, userPassword: string): Promise<boolean>;
}

// 3. Create a custom Model type that combines the User and its Methods
type UserModel = Model<IUser, {}, IUserMethods>;

// 4. Define the Mongoose Schema using our types
const userSchema = new Schema<IUser, UserModel, IUserMethods>({
  name: {
    type: String,
    required: [true, 'Please tell us your name!'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide your email!'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user'
  },
  password: {
    type: String,
    required: [true, 'Please provide a password!'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password!'],
    validate: {
      // FIX LINE 40: TypeScript now naturally understands 'this' thanks to the Schema generics configuration
      validator: function(this: any, el: string) {
        return el === this.password;
      },
      message: 'Passwords are not the same!'
    }
  },
  active: {
    type: Boolean,
    default: true,
    select: false
  }
});

// 5. Pre-Save Middleware
// FIX LINE 61: Changing 'this' parameter type context inside the callback handles 'next' cleanly
userSchema.pre('save', async function(this: IUser) {
  // If the password wasn't modified, just exit the function early
  if (!this.isModified('password')) return;

  // Hash the password
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
});

// 6. Instance Method Configuration
// FIX LINE 68: Safely attached using our explicit IUserMethods blueprint mapping
userSchema.methods.correctPassword = async function(
  candidatePassword: string,
  userPassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = model<IUser, UserModel>('User', userSchema);
export default User;