import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFieldIsDeletedPost1748483138171 implements MigrationInterface {
    name = 'AddFieldIsDeletedPost1748483138171'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`posts\` ADD \`is_deleted\` tinyint NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`posts\` DROP COLUMN \`is_deleted\``);
    }

}
