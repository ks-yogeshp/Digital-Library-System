import { applyDecorators, Injectable, SetMetadata } from '@nestjs/common';

export const MONGO_REPO = 'MONGO_REPO';
export interface MongoRepositoryMetadata {
  schemaName: string;
  schema: any;
}

export const MongoRepository = (schemaName: string, schema: any): ClassDecorator => {
  return applyDecorators(
    Injectable(),
    SetMetadata(MONGO_REPO, { schemaName, schema } as MongoRepositoryMetadata)
  );
};
