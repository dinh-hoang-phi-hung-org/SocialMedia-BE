import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePostTable1744030146279 implements MigrationInterface {
    name = 'CreatePostTable1744030146279'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`posts\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`uuid\` varchar(36) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`user_uuid\` varchar(255) NOT NULL, \`content\` text NULL, \`media_url\` json NULL, \`is_hidden\` tinyint NOT NULL DEFAULT 0, INDEX \`IDX_5e4c1fdaa5e514bb813e64457a\` (\`uuid\`), INDEX \`IDX_ba71b0ec64f446b537e6c9da71\` (\`user_uuid\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`posts_count\` int NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`posts\` ADD CONSTRAINT \`FK_ba71b0ec64f446b537e6c9da716\` FOREIGN KEY (\`user_uuid\`) REFERENCES \`users\`(\`uuid\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`posts\` DROP FOREIGN KEY \`FK_ba71b0ec64f446b537e6c9da716\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`posts_count\``);
        await queryRunner.query(`DROP INDEX \`IDX_ba71b0ec64f446b537e6c9da71\` ON \`posts\``);
        await queryRunner.query(`DROP INDEX \`IDX_5e4c1fdaa5e514bb813e64457a\` ON \`posts\``);
        await queryRunner.query(`DROP TABLE \`posts\``);
    }

}
