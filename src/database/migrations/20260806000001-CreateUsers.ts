import type { MigrationInterface, QueryRunner } from "typeorm";
import pkg from "typeorm";
const { Table } = pkg;

export class CreateUsers20260806000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const tableExists = await queryRunner.hasTable("booking_service.users");
    if (tableExists) return;
    await queryRunner.createTable(
      new Table({
        name: "booking_service.users",
        columns: [
          { name: "id", type: "int", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
          { name: "uuid", type: "uuid", default: "uuid_generate_v4()" },
          { name: "email", type: "varchar", isUnique: true },
          { name: "password_hash", type: "varchar" },
          { name: "created_at", type: "timestamp", default: "CURRENT_TIMESTAMP" },
          { name: "updated_at", type: "timestamp", default: "CURRENT_TIMESTAMP" },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("booking_service.users");
  }
}