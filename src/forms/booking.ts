

import type { UserEntity } from "./user";
export interface BookingEntity {
  id: number;
  uuid: string;

  resource_id: number;
  user_id: number;
  user?: UserEntity;

  start_time: Date;
  end_time: Date;

  status: "confirmed" | "cancelled";

  created_at: Date;
  updated_at: Date;
}
export interface CreateBookingForm {

  resource_id: number;
  user_id: number;
 
  start_time: Date;
  end_time: Date;

}