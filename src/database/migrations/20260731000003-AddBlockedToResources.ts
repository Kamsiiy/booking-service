import { type MigrationInterface, type QueryRunner } from "typeorm";

export class AddBlockedToResources20260731000003
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "booking_service"."resources"
      ADD COLUMN IF NOT EXISTS "blocked" BOOLEAN NOT NULL DEFAULT FALSE;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "booking_service"."resources"
      DROP COLUMN IF EXISTS "blocked";
    `);
  }
}