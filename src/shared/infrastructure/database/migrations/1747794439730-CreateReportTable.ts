import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateReportTable1747794439730 implements MigrationInterface {
    name = 'CreateReportTable1747794439730'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`reports\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`uuid\` varchar(36) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`reporter_uuid\` varchar(255) NOT NULL, \`content_type\` varchar(255) NOT NULL, \`content_uuid\` varchar(255) NOT NULL, \`details\` text NULL, \`status\` varchar(255) NOT NULL DEFAULT 'pending', \`reviewed_at\` timestamp NULL, INDEX \`IDX_8e2f2f0d6123151948d3a0537a\` (\`uuid\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`reports\` ADD CONSTRAINT \`FK_7d7156131815c6972860f7d0a55\` FOREIGN KEY (\`reporter_uuid\`) REFERENCES \`users\`(\`uuid\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`reports\` DROP FOREIGN KEY \`FK_7d7156131815c6972860f7d0a55\``);
        await queryRunner.query(`DROP INDEX \`IDX_8e2f2f0d6123151948d3a0537a\` ON \`reports\``);
        await queryRunner.query(`DROP TABLE \`reports\``);
    }

}
