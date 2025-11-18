import { DataSource } from 'typeorm';

import { datasourceConfig } from './database.module';

const config = datasourceConfig();

const migrationConfig = {
  ...config,
};

// Data source is used with typeorm cli
const connectionSource = new DataSource(migrationConfig);
export default connectionSource;
