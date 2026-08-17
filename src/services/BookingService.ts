import type { BookingEntity, CreateBookingForm } from "../forms/booking";
import { BookingSchema, ResourceSchema } from "../models/schemas";
import { AppDataSource } from "../data-source";
import { BaseService } from "./BaseService";
import { isCancellationAllowed } from "./cancellationPolicyService";

export class BookingService extends BaseService<BookingEntity> {
    resourceRepository: any;
constructor() {
super(BookingSchema);
this.resourceRepository = AppDataSource.getRepository(ResourceSchema);
}

async createBooking(data: Omit<CreateBookingForm, "user_id">, userId: number): Promise<BookingEntity> {

    // Validate dates
 if (new Date(data.start_time) >= new Date(data.end_time)) {
    throw new Error("End time must be after start time.");
}

    // Check resource exists

    const resource = await this.resourceRepository.findOne({
        where: {
            id: data.resource_id,
        },

    });

    if (!resource) {

      throw new Error("Resource not found.");

    }
    if (resource.blocked) {

      throw new Error("Resource is blocked and cannot be booked."); 
    }

    // TODO:

    // Once Feature 1 is merged, check if resource is blocked.

    // Check overlapping confirmed bookings

    const overlap = await this.repository

      .createQueryBuilder("booking")

      .where("booking.resource_id = :resourceId", {

        resourceId: data.resource_id,

      })

      .andWhere("booking.status = :status", {

        status: "confirmed",

      })

      .andWhere(

        "booking.start_time < :endTime AND booking.end_time > :startTime",

        { 
            startTime: data.start_time,
           endTime: data.end_time,

        }

      )

      .getOne();

    if (overlap) {

      throw new Error("Booking overlaps an existing confirmed booking.");

    }

    return await this.create({

      ...data,

      user_id: userId,

      status: "confirmed",

    });

  }

  async updateBooking(

    id: number,

    data: Partial<CreateBookingForm>

  ): Promise<BookingEntity | null> {

    const booking = await this.findById(id);

    if (!booking) {

      throw new Error("Booking not found.");

    }

    if (booking.status === "cancelled") {

      throw new Error("Cancelled bookings cannot be edited.");

    }

    return await this.updateById(id, data);

  }

  async cancelBooking(id: number): Promise<BookingEntity | null> {

    const booking = await this.findById(id);

    if (!booking) {

      throw new Error("Booking not found.");

    }

    if (booking.status === "cancelled") {

      throw new Error("Booking is already cancelled.");

    }


  // Feature 3 addition — cancellation policy check (2h minimum notice).
  // Flag for review with feature2 owner before merge.
  const policyCheck = isCancellationAllowed(booking.start_time);
  if (!policyCheck.allowed) {
    throw new Error(policyCheck.reason);
  }

    return await this.updateById(id, {

      status: "cancelled",

    });

  }

  async getBookings(filters?: {

    resource_id?: number;

    status?: string;
    from?: Date;
    to?: Date;

  }): Promise<BookingEntity[]> {

    const query = this.repository.createQueryBuilder("booking");

    if (filters?.resource_id) {

      query.andWhere("booking.resource_id = :resourceId", {

        resourceId: filters.resource_id,

      });

    }

    if (filters?.status) {

      query.andWhere("booking.status = :status", {

        status: filters.status,

      });

    }
if (filters?.from) {
  query.andWhere("booking.start_time >= :from", {
    from: filters.from,
  });
}

if (filters?.to) {
  query.andWhere("booking.end_time <= :to", {
    to: filters.to,
  });
}
    return await query.getMany();

  }

}