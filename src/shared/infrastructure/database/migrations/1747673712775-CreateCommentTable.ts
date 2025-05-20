import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCommentTable1747673712775 implements MigrationInterface {
    name = 'CreateCommentTable1747673712775'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`comments\` (\`id\` int NOT NULL AUTO_INCREMENT, \`uuid\` varchar(255) NOT NULL, \`post_uuid\` varchar(255) NOT NULL, \`user_uuid\` varchar(255) NOT NULL, \`content\` text NOT NULL, \`parent_uuid\` varchar(255) NULL, \`create_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`is_deleted\` tinyint NOT NULL DEFAULT 0, \`media_url\` json NULL, INDEX \`IDX_1b26a95e1de1e36a26a15fc40f\` (\`user_uuid\`), INDEX \`IDX_5455c71d4dac683e4cffa09b50\` (\`post_uuid\`), UNIQUE INDEX \`IDX_160936d39977f78f7789e0fb78\` (\`uuid\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`comments\` ADD CONSTRAINT \`FK_5455c71d4dac683e4cffa09b508\` FOREIGN KEY (\`post_uuid\`) REFERENCES \`posts\`(\`uuid\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`comments\` ADD CONSTRAINT \`FK_1b26a95e1de1e36a26a15fc40f1\` FOREIGN KEY (\`user_uuid\`) REFERENCES \`users\`(\`uuid\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`comments\` DROP FOREIGN KEY \`FK_1b26a95e1de1e36a26a15fc40f1\``);
        await queryRunner.query(`ALTER TABLE \`comments\` DROP FOREIGN KEY \`FK_5455c71d4dac683e4cffa09b508\``);
        await queryRunner.query(`DROP INDEX \`IDX_160936d39977f78f7789e0fb78\` ON \`comments\``);
        await queryRunner.query(`DROP INDEX \`IDX_5455c71d4dac683e4cffa09b50\` ON \`comments\``);
        await queryRunner.query(`DROP INDEX \`IDX_1b26a95e1de1e36a26a15fc40f\` ON \`comments\``);
        await queryRunner.query(`DROP TABLE \`comments\``);
    }

}
