import { UserController } from "../controllers/UserController";
const controller = new UserController();

export const userRoutes = {
  "/auth/signup": {
    POST: (req: Request) => controller.signup(req),
  },
  "/auth/signin": {
    POST: (req: Request) => controller.signin(req),
  },
};