import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateReactionTable1749363080014 implements MigrationInterface {
    name = 'CreateReactionTable1749363080014'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`reactions\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`uuid\` varchar(36) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`user_uuid\` varchar(255) NOT NULL, \`post_uuid\` varchar(255) NULL, \`comment_uuid\` varchar(255) NULL, INDEX \`IDX_2b90f7342b7ea62cbe81379e34\` (\`uuid\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`reactions\` ADD CONSTRAINT \`FK_1f49bc97abe1df93798ba0ef1f4\` FOREIGN KEY (\`user_uuid\`) REFERENCES \`users\`(\`uuid\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`reactions\` ADD CONSTRAINT \`FK_1ef1e2b0f23e05994f6f7389a63\` FOREIGN KEY (\`post_uuid\`) REFERENCES \`posts\`(\`uuid\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`reactions\` ADD CONSTRAINT \`FK_65c34f407fc65c7dda95ca18647\` FOREIGN KEY (\`comment_uuid\`) REFERENCES \`comments\`(\`uuid\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`reactions\` DROP FOREIGN KEY \`FK_65c34f407fc65c7dda95ca18647\``);
        await queryRunner.query(`ALTER TABLE \`reactions\` DROP FOREIGN KEY \`FK_1ef1e2b0f23e05994f6f7389a63\``);
        await queryRunner.query(`ALTER TABLE \`reactions\` DROP FOREIGN KEY \`FK_1f49bc97abe1df93798ba0ef1f4\``);
        await queryRunner.query(`DROP INDEX \`IDX_2b90f7342b7ea62cbe81379e34\` ON \`reactions\``);
        await queryRunner.query(`DROP TABLE \`reactions\``);
    }

}
