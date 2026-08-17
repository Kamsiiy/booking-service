import jwt from "jsonwebtoken";
import HttpResponse from "../common/HttpResponse";

export interface AuthenticatedRequest extends Request {
  userId?: number;
}

export async function requireAuth(req: Request): Promise<{ userId: number } | Response> {
  const authHeader = req.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return HttpResponse.failure("Missing or invalid authorization header", 401);
  }

  const token = authHeader.slice("Bearer ".length);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number };
    return { userId: decoded.userId };
  } catch (error) {
    return HttpResponse.failure("Invalid or expired token", 401);
  }
}