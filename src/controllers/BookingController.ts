import type { BunRequest } from "bun";
import HttpResponse from "../common/HttpResponse";
import { BookingService } from "../services/BookingService";
import type { CreateBookingForm } from "../forms/booking";
import { requireAuth } from "../middleware/auth";

export class BookingController {
  private bookingService = new BookingService();

  async list(req: BunRequest<"/bookings">): Promise<Response> {
    try {
      const url = new URL(req.url);

      const resource_id = url.searchParams.get("resource_id");
      const status = url.searchParams.get("status");
      const from = url.searchParams.get("from");
      const to = url.searchParams.get("to");

      const bookings = await this.bookingService.getBookings({
        resource_id: resource_id ? Number(resource_id) : undefined,
        status: status ?? undefined,
        from: from ? new Date(from) : undefined,
        to: to ? new Date(to) : undefined,
      });

      return HttpResponse.success(
        "Bookings fetched successfully",
        bookings
      );
    } catch (error) {
      return HttpResponse.failure(
        error instanceof Error ? error.message : "Something went wrong",
        500
      );
    }
  }

  async create(req: Request): Promise<Response> {
    try {
      const auth = await requireAuth(req); if (auth instanceof Response) return auth;
      const body = await req.json();

      const booking = await this.bookingService.createBooking(body as CreateBookingForm, auth.userId); 

      return HttpResponse.success(
        "Booking created successfully",
        booking,
        201
      );
    } catch (error) {
      return HttpResponse.failure(
        error instanceof Error ? error.message : "Something went wrong",
        400
      );
    }
  }

  async update(req: BunRequest<"/bookings/:id">): Promise<Response> {
    try {
      const auth = await requireAuth(req); if (auth instanceof Response) return auth;
      const id = Number(req.params.id);
      const body = await req.json();

      const booking = await this.bookingService.updateBooking(id, body as Partial<CreateBookingForm>);

      if (!booking) {
        return HttpResponse.notFound("Booking not found");
      }

      return HttpResponse.success(
        "Booking updated successfully",
        booking
      );
    } catch (error) {
      return HttpResponse.failure(
        error instanceof Error ? error.message : "Something went wrong",
        400
      );
    }
  }

  async cancel(req: BunRequest<"/bookings/:id/cancel">): Promise<Response> {
    try {
      const auth = await requireAuth(req); if (auth instanceof Response) return auth;
      const id = Number(req.params.id);

      const booking = await this.bookingService.cancelBooking(id);

      if (!booking) {
        return HttpResponse.notFound("Booking not found");
      }

      return HttpResponse.success(
        "Booking cancelled successfully",
        booking
      );
    } catch (error) {
      return HttpResponse.failure(
        error instanceof Error ? error.message : "Something went wrong",
        400
      );
    }
  }
}