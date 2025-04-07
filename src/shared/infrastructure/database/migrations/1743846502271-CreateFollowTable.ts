import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateFollowTable1743846502271 implements MigrationInterface {
    name = 'CreateFollowTable1743846502271'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`follow\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`uuid\` varchar(36) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`follower_uuid\` varchar(255) NOT NULL, \`following_uuid\` varchar(255) NOT NULL, INDEX \`IDX_d98d85e6dd93e76c8a6b7030fd\` (\`uuid\`), INDEX \`IDX_19958c7555de6d9cad21408e58\` (\`follower_uuid\`), INDEX \`IDX_2149ccd3d562898ad418344f5e\` (\`following_uuid\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`followers_count\` int NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`followings_count\` int NOT NULL DEFAULT '0'`);
        await queryRunner.query(`CREATE INDEX \`IDX_951b8f1dfc94ac1d0301a14b7e\` ON \`users\` (\`uuid\`)`);
        await queryRunner.query(`ALTER TABLE \`follow\` ADD CONSTRAINT \`FK_19958c7555de6d9cad21408e589\` FOREIGN KEY (\`follower_uuid\`) REFERENCES \`users\`(\`uuid\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`follow\` ADD CONSTRAINT \`FK_2149ccd3d562898ad418344f5e6\` FOREIGN KEY (\`following_uuid\`) REFERENCES \`users\`(\`uuid\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`follow\` DROP FOREIGN KEY \`FK_2149ccd3d562898ad418344f5e6\``);
        await queryRunner.query(`ALTER TABLE \`follow\` DROP FOREIGN KEY \`FK_19958c7555de6d9cad21408e589\``);
        await queryRunner.query(`DROP INDEX \`IDX_951b8f1dfc94ac1d0301a14b7e\` ON \`users\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`followings_count\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`followers_count\``);
        await queryRunner.query(`DROP INDEX \`IDX_2149ccd3d562898ad418344f5e\` ON \`follow\``);
        await queryRunner.query(`DROP INDEX \`IDX_19958c7555de6d9cad21408e58\` ON \`follow\``);
        await queryRunner.query(`DROP INDEX \`IDX_d98d85e6dd93e76c8a6b7030fd\` ON \`follow\``);
        await queryRunner.query(`DROP TABLE \`follow\``);
    }

}
