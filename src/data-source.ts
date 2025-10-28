import { DataSource, DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';
import DataSeeder from './seeder/data.seeder';
import * as dotenv from 'dotenv';


dotenv.config(); // load .env

const options: DataSourceOptions & SeederOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [__dirname + '/**/*.entity.{ts,js}'],
  synchronize: process.env.DATABASE_SYNC === 'true',
  seeds: [DataSeeder],
  factories: [__dirname + '/**/*.factory.{ts,js}'],
};

export const dataSource = new DataSource(options);