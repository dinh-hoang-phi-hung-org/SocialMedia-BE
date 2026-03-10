import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAuthProviderTable1773028919409 implements MigrationInterface {
    name = 'CreateAuthProviderTable1773028919409'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`google_id\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD UNIQUE INDEX \`IDX_0bd5012aeb82628e07f6a1be53\` (\`google_id\`)`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`is_google_account\` tinyint NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`password_hash\` \`password_hash\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`auth_providers\` ADD CONSTRAINT \`FK_262996fd08ab5a69e85b53d0055\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`auth_providers\` DROP FOREIGN KEY \`FK_262996fd08ab5a69e85b53d0055\``);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`password_hash\` \`password_hash\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`is_google_account\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP INDEX \`IDX_0bd5012aeb82628e07f6a1be53\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`google_id\``);
    }

}
