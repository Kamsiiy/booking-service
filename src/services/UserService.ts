import { BaseService } from "./BaseService";
import { UserSchema } from "../models/schemas";
import type { UserEntity, SignupForm } from "../forms/user";

export class UserService extends BaseService<UserEntity> {
  constructor() {
    super(UserSchema);
  }

  async createUser(data: SignupForm): Promise<UserEntity> {
    // Using bcrypt explicitly (not Bun's default argon2id) per assignment spec.
    // Cost factor 10 is bcrypt's standard default — balances brute-force
    // resistance against hashing time (~100ms on typical hardware).
    const password_hash = await Bun.password.hash(data.password, {
      algorithm: "bcrypt",
      cost: 10,
    });

    return await this.create({
      email: data.email,
      password_hash,
    });
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return await this.findByField("email", email);
  }

  async verifyPassword(
    plainPassword: string,
    hash: string,
  ): Promise<boolean> {
    return await Bun.password.verify(plainPassword, hash);
  }
}