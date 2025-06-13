import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFieldToConversation1749783714448 implements MigrationInterface {
    name = 'AddFieldToConversation1749783714448'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`conversations\` ADD \`admin_uuid\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`conversations\` ADD \`group_picture_url\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`conversations\` DROP COLUMN \`group_picture_url\``);
        await queryRunner.query(`ALTER TABLE \`conversations\` DROP COLUMN \`admin_uuid\``);
    }

}
