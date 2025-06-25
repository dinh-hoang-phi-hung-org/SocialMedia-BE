import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserSavePostTable1750816971607 implements MigrationInterface {
    name = 'CreateUserSavePostTable1750816971607'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`save_posts\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`uuid\` varchar(36) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`user_uuid\` varchar(255) NOT NULL, \`post_uuid\` varchar(255) NOT NULL, INDEX \`IDX_950633272c0f4cebdd716c14e7\` (\`uuid\`), INDEX \`IDX_c97944ba8737259e08f269dff7\` (\`user_uuid\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`save_posts\` ADD CONSTRAINT \`FK_c97944ba8737259e08f269dff75\` FOREIGN KEY (\`user_uuid\`) REFERENCES \`users\`(\`uuid\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`save_posts\` ADD CONSTRAINT \`FK_48d49c4742399759b0d97daa697\` FOREIGN KEY (\`post_uuid\`) REFERENCES \`posts\`(\`uuid\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`save_posts\` DROP FOREIGN KEY \`FK_48d49c4742399759b0d97daa697\``);
        await queryRunner.query(`ALTER TABLE \`save_posts\` DROP FOREIGN KEY \`FK_c97944ba8737259e08f269dff75\``);
        await queryRunner.query(`DROP INDEX \`IDX_c97944ba8737259e08f269dff7\` ON \`save_posts\``);
        await queryRunner.query(`DROP INDEX \`IDX_950633272c0f4cebdd716c14e7\` ON \`save_posts\``);
        await queryRunner.query(`DROP TABLE \`save_posts\``);
    }

}
