import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAcceptedAtToCallLogs1784332801000 implements MigrationInterface {
  name = 'AddAcceptedAtToCallLogs1784332801000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasCallLogsTable = await queryRunner.hasTable('call_logs');
    if (!hasCallLogsTable) {
      return;
    }

    const hasAcceptedAtColumn = await queryRunner.hasColumn('call_logs', 'accepted_at');
    if (!hasAcceptedAtColumn) {
      await queryRunner.query(`ALTER TABLE \`call_logs\` ADD \`accepted_at\` timestamp NULL AFTER \`started_at\``);
    }

    await queryRunner.query(
      `ALTER TABLE \`call_logs\` MODIFY \`status\` enum ('ringing', 'ongoing', 'ended', 'declined', 'missed') NOT NULL DEFAULT 'ringing'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasCallLogsTable = await queryRunner.hasTable('call_logs');
    if (!hasCallLogsTable) {
      return;
    }

    await queryRunner.query(
      `ALTER TABLE \`call_logs\` MODIFY \`status\` enum ('ringing', 'ended', 'declined', 'missed') NOT NULL DEFAULT 'ringing'`,
    );

    const hasAcceptedAtColumn = await queryRunner.hasColumn('call_logs', 'accepted_at');
    if (hasAcceptedAtColumn) {
      await queryRunner.query(`ALTER TABLE \`call_logs\` DROP COLUMN \`accepted_at\``);
    }
  }
}
