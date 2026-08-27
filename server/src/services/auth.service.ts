import bcrypt from "bcryptjs";
import {
  User,
  type PublicUser,
  type UserDocument,
  toPublicUser,
} from "../models/user.model.js";
import type { LoginDto, RegisterDto } from "../validators/auth.validators.js";
import { HttpError } from "../utils/http-error.js";
import { logger } from "../config/logger.js";

const BCRYPT_SALT_ROUNDS = 12;

function isDuplicateKeyError(err: unknown): boolean {
  return (err as { code?: number }).code === 11000;
}

export async function registerUser(dto: RegisterDto): Promise<PublicUser> {
  const existing = await User.exists({ email: dto.email });
  if (existing) {
    throw new HttpError(
      409,
      "EMAIL_TAKEN",
      "An account with this email already exists",
    );
  }

  const passwordHash = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);

  try {
    const user = await User.create({
      ...(dto.name !== undefined ? { name: dto.name } : {}),
      email: dto.email,
      passwordHash,
    });
    logger.info({ userId: user._id.toString(), email: dto.email }, "auth.register");
    return toPublicUser(user);
  } catch (err) {
    if (isDuplicateKeyError(err)) {
      throw new HttpError(
        409,
        "EMAIL_TAKEN",
        "An account with this email already exists",
      );
    }
    throw err;
  }
}

export async function loginUser(dto: LoginDto): Promise<UserDocument> {
  // Same generic error for unknown email and wrong password to prevent
  // user enumeration.
  const invalidCredentials = new HttpError(
    401,
    "INVALID_CREDENTIALS",
    "Invalid email or password",
  );

  const user = await User.findOne({ email: dto.email });
  if (!user) throw invalidCredentials;

  const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);
  if (!passwordMatches) throw invalidCredentials;

  logger.info({ userId: user._id.toString(), email: dto.email }, "auth.login");
  return user;
}

export async function getUserById(id: string): Promise<PublicUser | null> {
  const user = await User.findById(id);
  return user ? toPublicUser(user) : null;
}

export { toPublicUser };

