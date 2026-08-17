import HttpResponse from "../common/HttpResponse";
import { UserService } from "../services/UserService";
import type { SignupForm, SigninForm } from "../forms/user";
import jwt from "jsonwebtoken";

// A dummy bcrypt hash used to keep signin's timing consistent whether or not
// the email exists — closes a timing side-channel that would otherwise let
// an attacker detect registered emails by measuring response time.
// Computed once at startup and reused.
const DUMMY_HASH_PROMISE = Bun.password.hash(
  "dummy-password-for-timing-consistency",
  {
    algorithm: "bcrypt",
    cost: 10,
  },
);

export class UserController {
  private userService = new UserService();

  async signup(req: Request): Promise<Response> {
    const body = (await req.json()) as SignupForm;

    if (!body.email || !body.email.includes("@")) {
      return HttpResponse.failure("A valid email is required", 400);
    }

    if (!body.password || body.password.length < 8) {
      return HttpResponse.failure(
        "Password must be at least 8 characters",
        400,
      );
    }

    const existing = await this.userService.findByEmail(body.email);

    if (existing) {
      return HttpResponse.failure("Email already in use", 409);
    }

    const user = await this.userService.createUser(body);

    const { password_hash, ...safeUser } = user;

    return HttpResponse.success(
      "User created successfully",
      safeUser,
      201,
    );
  }

  async signin(req: Request): Promise<Response> {
    const body = (await req.json()) as SigninForm;

    if (!body.email || !body.password) {
      return HttpResponse.failure("Invalid email or password", 401);
    }

    const user = await this.userService.findByEmail(body.email);

    // Always run the bcrypt comparison, even if no user was found, so the
    // response takes the same amount of time either way.
    const hashToCheck = user
      ? user.password_hash
      : await DUMMY_HASH_PROMISE;

    const isValid = await this.userService.verifyPassword(
      body.password,
      hashToCheck,
    );

    if (!user || !isValid) {
      return HttpResponse.failure("Invalid email or password", 401);
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" },
    );

    return HttpResponse.success(
      "Signed in successfully",
      { token },
    );
  }
}