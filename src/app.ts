import "reflect-metadata";
import { AppDataSource } from "./data-source";
import { resourceRoutes } from "./routes/resource";
import { bookingRoutes } from "./routes/booking";
import { AvailabilityRoutes } from "./routes/availability";
import { bookingHistoryRoutes } from "./routes/bookingHistory";
import { userRoutes } from "./routes/user";
const routes = {
  "/health": {
    GET: () => Response.json({ status: "ok" }, { status: 200 }),
  },
  ...resourceRoutes,
  ...bookingRoutes,
  ...AvailabilityRoutes,
  ...bookingHistoryRoutes,
   ...userRoutes,
};

AppDataSource.initialize()
  .then(() => {
    const server = Bun.serve({
      port: Number(process.env.PORT ?? 3000),
      routes,
      fetch() {
        return Response.json({ success: false, message: "Not found" }, { status: 404 });
      },
    });

    console.log(`booking-service running at http://localhost:${server.port}`);
  })
  .catch((error) => {
    console.error("Failed to initialize database connection:", error);});