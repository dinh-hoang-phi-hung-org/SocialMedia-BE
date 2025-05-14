import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateConversationUserConversationMessageTable1745221739335 implements MigrationInterface {
    name = 'CreateConversationUserConversationMessageTable1745221739335'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`messages\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`uuid\` varchar(36) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`conversation_uuid\` varchar(255) NOT NULL, \`sender_uuid\` varchar(255) NOT NULL, \`content\` text NULL, \`media_url\` json NULL, INDEX \`IDX_6aaade3b9853de4a3f61ca174c\` (\`uuid\`), INDEX \`IDX_f843056bcdc58ffc947d69e8cb\` (\`conversation_uuid\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`conversations\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`uuid\` varchar(36) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`is_group_chat\` tinyint NOT NULL DEFAULT 0, \`title\` varchar(255) NULL, \`updatedAt\` datetime NULL, INDEX \`IDX_18e1869e613e5a943740153211\` (\`uuid\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user_conversation\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`uuid\` varchar(36) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`user_uuid\` varchar(255) NOT NULL, \`conversation_uuid\` varchar(255) NOT NULL, INDEX \`IDX_28c70aba79f096c2d2c4bba3c5\` (\`uuid\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`messages\` ADD CONSTRAINT \`FK_f843056bcdc58ffc947d69e8cb0\` FOREIGN KEY (\`conversation_uuid\`) REFERENCES \`conversations\`(\`uuid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`messages\` ADD CONSTRAINT \`FK_6b1ff9d9bbc8d34414ddf41ccb4\` FOREIGN KEY (\`sender_uuid\`) REFERENCES \`users\`(\`uuid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_conversation\` ADD CONSTRAINT \`FK_72c88e1fa6cef52e070a4fb5576\` FOREIGN KEY (\`user_uuid\`) REFERENCES \`users\`(\`uuid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_conversation\` ADD CONSTRAINT \`FK_f73ad3289175553e3992e140e90\` FOREIGN KEY (\`conversation_uuid\`) REFERENCES \`conversations\`(\`uuid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_conversation\` DROP FOREIGN KEY \`FK_f73ad3289175553e3992e140e90\``);
        await queryRunner.query(`ALTER TABLE \`user_conversation\` DROP FOREIGN KEY \`FK_72c88e1fa6cef52e070a4fb5576\``);
        await queryRunner.query(`ALTER TABLE \`messages\` DROP FOREIGN KEY \`FK_6b1ff9d9bbc8d34414ddf41ccb4\``);
        await queryRunner.query(`ALTER TABLE \`messages\` DROP FOREIGN KEY \`FK_f843056bcdc58ffc947d69e8cb0\``);
        await queryRunner.query(`DROP INDEX \`IDX_28c70aba79f096c2d2c4bba3c5\` ON \`user_conversation\``);
        await queryRunner.query(`DROP TABLE \`user_conversation\``);
        await queryRunner.query(`DROP INDEX \`IDX_18e1869e613e5a943740153211\` ON \`conversations\``);
        await queryRunner.query(`DROP TABLE \`conversations\``);
        await queryRunner.query(`DROP INDEX \`IDX_f843056bcdc58ffc947d69e8cb\` ON \`messages\``);
        await queryRunner.query(`DROP INDEX \`IDX_6aaade3b9853de4a3f61ca174c\` ON \`messages\``);
        await queryRunner.query(`DROP TABLE \`messages\``);
    }

}
