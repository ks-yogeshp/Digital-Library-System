// import { DataSource, EntityTarget } from "typeorm";

import { DataSource, EntityTarget } from "typeorm";

// type EntityInstance<T> =  T extends EntityTarget<infer U> ? U :never;

// export type EntityMapFromDataSource1<D extends DataSource> = {
//     [K in D['entityMetadatas'][number]['name']]: EntityInstance<
//         Extract<D['entityMetadatas'][number]['target'], Function>
//     >;
// }
// export type EntityMapFromDataSource<D extends DataSource> = {
//     [K in D['entityMetadatas'][number]['name']]:
//       Extract<D['entityMetadatas'][number], { name: K }>['target'] extends EntityTarget<infer U>
//         ? U
//         : never;
//   };
  
// export type SearchFieldMap<M extends Record<string, any>> = {
//     [K in keyof M]?: Array<keyof M[K]>;
//   };
type EntityInstance<T> = T extends EntityTarget<infer U> ? U : never;
export type EntityMapFromDataSource<D extends DataSource> = {
    [K in D['entityMetadatas'][number]['name']]: EntityInstance<
      Extract<D['entityMetadatas'][number]['target'], Function>
    >;
  };
  export type SearchFieldMap<M extends Record<string, any>> = {
    [K in keyof M]?: Array<keyof M[K]>;  // now keyof M[K] works because M[K] is an instance type
  };
    

  