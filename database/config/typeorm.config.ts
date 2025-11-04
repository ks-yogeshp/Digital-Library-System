import { DataSource, DataSourceOptions } from 'typeorm';
import DataSeeder from 'database/seeder/data.seeder';
import { SeederOptions } from 'typeorm-extension';
import { ConfigModule } from '@nestjs/config';


ConfigModule.forRoot({
  envFilePath: '.env',
});


const options: DataSourceOptions & SeederOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [__dirname + '/../../src/**/*.entity.{ts,js}'],
  synchronize: process.env.DATABASE_SYNC === 'true',
  seeds: [DataSeeder],
  factories: [__dirname + '/../factories/**/*.{ts,js}'],
  migrations: [__dirname+'/../migrations/**/*.{ts,js}'],
};

export const dataSource = new DataSource(options);