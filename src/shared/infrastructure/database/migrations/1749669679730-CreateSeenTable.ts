import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSeenTable1749669679730 implements MigrationInterface {
    name = 'CreateSeenTable1749669679730'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`seen_messages\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`uuid\` varchar(36) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`message_uuid\` varchar(255) NOT NULL, \`user_uuid\` varchar(255) NOT NULL, INDEX \`IDX_fd0e30f92d01b0a5c85b23155a\` (\`uuid\`), UNIQUE INDEX \`IDX_f8327f959b05acde56a3540098\` (\`uuid\`, \`user_uuid\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`messages\` ADD \`type\` enum ('text', 'notification') NULL`);
        await queryRunner.query(`ALTER TABLE \`seen_messages\` ADD CONSTRAINT \`FK_8fb95ed9276c6870367b73df7dd\` FOREIGN KEY (\`message_uuid\`) REFERENCES \`messages\`(\`uuid\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`seen_messages\` ADD CONSTRAINT \`FK_c224719807eece7d2bd91f432db\` FOREIGN KEY (\`user_uuid\`) REFERENCES \`users\`(\`uuid\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`seen_messages\` DROP FOREIGN KEY \`FK_c224719807eece7d2bd91f432db\``);
        await queryRunner.query(`ALTER TABLE \`seen_messages\` DROP FOREIGN KEY \`FK_8fb95ed9276c6870367b73df7dd\``);
        await queryRunner.query(`ALTER TABLE \`messages\` DROP COLUMN \`type\``);
        await queryRunner.query(`DROP INDEX \`IDX_f8327f959b05acde56a3540098\` ON \`seen_messages\``);
        await queryRunner.query(`DROP INDEX \`IDX_fd0e30f92d01b0a5c85b23155a\` ON \`seen_messages\``);
        await queryRunner.query(`DROP TABLE \`seen_messages\``);
    }

}
