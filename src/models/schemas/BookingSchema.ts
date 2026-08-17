import { EntitySchema } from "typeorm";
import { baseColumnOptions } from "./BaseSchema";
import type { BookingEntity } from "../../forms/booking";

export const BookingSchema = new EntitySchema<BookingEntity>({
name: "Booking",
tableName: "bookings",

columns: {
...baseColumnOptions,

id: {
type: "int",
primary: true,
generated: "increment",
},

resource_id: {
type: "int",
},

user_id: { type: "int" },

start_time: {
type: "timestamp",
},

end_time: {
type: "timestamp",
},

status: {
type: String,
default: "confirmed",
},
},

relations: {
  user: {
    type: "many-to-one",
    target: "User",
    joinColumn: { name: "user_id" },
    onDelete: "RESTRICT",
  },
},

});