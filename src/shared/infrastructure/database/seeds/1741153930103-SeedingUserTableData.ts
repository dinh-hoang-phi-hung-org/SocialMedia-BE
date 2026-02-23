import { UserOrmEntity } from '@/modules/users/infrastructure/orm/users.entity.orm';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import * as fs from 'fs';
import { hashPassword } from '@/shared/helpers/bcrypt';
import { UserRole } from '@/shared/enum/role';

export class SeedingUserTableData1741153930103 implements Seeder {
  track = true;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<any> {
    try {
      const userData = fs.readFileSync('./dist/shared/infrastructure/database/seeds/data-seeds/user-data.json');
      const parsedUserData = JSON.parse(userData.toString());
      if (parsedUserData) {
        const existingUsers = await dataSource.manager.find(UserOrmEntity);
        const entities = await Promise.all(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          parsedUserData.map(async (e: any) => {
            const exists = existingUsers.some((existing) => existing.username === e.username);
            if (exists) {
              return null;
            }
            const hashedPassword = await hashPassword(e.password);
            const user = new UserOrmEntity();
            user.uuid = e.uuid;
            user.username = e.username;
            user.email = e.email;
            user.password_hash = hashedPassword;
            user.first_name = e.firstName;
            user.last_name = e.lastName;
            user.is_active = e.isActive;
            user.role = e.role as UserRole;
            return user;
          }),
        );
        await dataSource.manager.save(entities.filter((entity) => entity !== null));
      } else {
        throw new Error('Not Found User');
      }
    } catch (error) {
      throw new Error(error);
    }
  }
}
