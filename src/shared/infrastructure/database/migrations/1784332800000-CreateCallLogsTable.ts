import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCallLogsTable1784332800000 implements MigrationInterface {
  name = 'CreateCallLogsTable1784332800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`call_logs\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`uuid\` varchar(36) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`conversation_uuid\` varchar(255) NOT NULL, \`room_name\` varchar(255) NOT NULL, \`caller_uuid\` varchar(255) NOT NULL, \`ended_by_uuid\` varchar(255) NULL, \`call_type\` enum ('voice', 'video') NOT NULL, \`status\` enum ('ringing', 'ongoing', 'ended', 'declined', 'missed') NOT NULL DEFAULT 'ringing', \`started_at\` timestamp NOT NULL, \`accepted_at\` timestamp NULL, \`ended_at\` timestamp NULL, \`duration_seconds\` int NULL, INDEX \`IDX_call_logs_uuid\` (\`uuid\`), INDEX \`IDX_call_logs_conversation_uuid\` (\`conversation_uuid\`), INDEX \`IDX_call_logs_room_name\` (\`room_name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`call_logs\` ADD CONSTRAINT \`FK_call_logs_conversation_uuid\` FOREIGN KEY (\`conversation_uuid\`) REFERENCES \`conversations\`(\`uuid\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`call_logs\` ADD CONSTRAINT \`FK_call_logs_caller_uuid\` FOREIGN KEY (\`caller_uuid\`) REFERENCES \`users\`(\`uuid\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`call_logs\` ADD CONSTRAINT \`FK_call_logs_ended_by_uuid\` FOREIGN KEY (\`ended_by_uuid\`) REFERENCES \`users\`(\`uuid\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`call_logs\` DROP FOREIGN KEY \`FK_call_logs_ended_by_uuid\``);
    await queryRunner.query(`ALTER TABLE \`call_logs\` DROP FOREIGN KEY \`FK_call_logs_caller_uuid\``);
    await queryRunner.query(`ALTER TABLE \`call_logs\` DROP FOREIGN KEY \`FK_call_logs_conversation_uuid\``);
    await queryRunner.query(`DROP INDEX \`IDX_call_logs_room_name\` ON \`call_logs\``);
    await queryRunner.query(`DROP INDEX \`IDX_call_logs_conversation_uuid\` ON \`call_logs\``);
    await queryRunner.query(`DROP INDEX \`IDX_call_logs_uuid\` ON \`call_logs\``);
    await queryRunner.query(`DROP TABLE \`call_logs\``);
  }
}
