import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateNotificationTable1750087303253 implements MigrationInterface {
    name = 'CreateNotificationTable1750087303253'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`notifications\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`uuid\` varchar(36) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`user_uuid\` varchar(255) NOT NULL, \`type\` varchar(255) NOT NULL, \`content\` text NOT NULL, \`related_uuid\` varchar(255) NULL, \`is_read\` tinyint NOT NULL DEFAULT 0, \`user_related_uuid\` varchar(255) NULL, INDEX \`IDX_84989adc90ebf9f1c9b7ba66f0\` (\`uuid\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`notifications\` ADD CONSTRAINT \`FK_7cc90a8f3316903c0bab7d4f7a9\` FOREIGN KEY (\`user_uuid\`) REFERENCES \`users\`(\`uuid\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`notifications\` DROP FOREIGN KEY \`FK_7cc90a8f3316903c0bab7d4f7a9\``);
        await queryRunner.query(`DROP INDEX \`IDX_84989adc90ebf9f1c9b7ba66f0\` ON \`notifications\``);
        await queryRunner.query(`DROP TABLE \`notifications\``);
    }

}
