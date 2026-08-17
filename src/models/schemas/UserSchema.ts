import { EntitySchema } from "typeorm";
import { baseColumnOptions } from "./BaseSchema";
import type { UserEntity } from "../../forms/user";

export const UserSchema = new EntitySchema<UserEntity>({
  name: "User",
  tableName: "users",
  columns: {
    ...baseColumnOptions,
    id: {
      type: "int",
      primary: true,
      generated: "increment",
    },
    email: {
      type: String,
      unique: true,
    },
    password_hash: {
      type: String,
    },
  },
});