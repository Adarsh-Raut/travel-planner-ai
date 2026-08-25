import bcrypt from "bcryptjs";
import { User, type PublicUser, toPublicUser } from "../models/user.model.js";
import type { RegisterDto } from "../validators/auth.validators.js";
import { HttpError } from "../utils/http-error.js";

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
