import { Injectable } from '@nestjs/common';
import { Repository, FindOptionsWhere, Raw, ObjectLiteral, FindOperator, ILike, Equal } from 'typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class SearchQueryProvider {

    constructor(
        private readonly dataSource: DataSource
    ){}

    private parseValue(value: any): any {
      if (typeof value !== 'string') return value;
  
      if (value === 'true') return true;
      if (value === 'false') return false;
      
      const num = parseInt(value);
      if (!isNaN(num) && isFinite(num)) return num;
      
      if (Array.isArray(value)) {
        return value.map(v => this.parseValue(v));
  
      }
        return value;
      }
    
  public searchWhere = <T extends ObjectLiteral>(
        repo: Repository<T>,
        search: string,
        partial:boolean = false,
        searchFieldMap?: Record<string,any>,
        visitedEntities: Set<string> =new Set(),
      ): FindOptionsWhere<T>[]=> {

        const result:FindOptionsWhere<any>[] =[]
        const entity = repo.metadata.targetName;

        if(visitedEntities.has(entity)){
          return [];
        }

        visitedEntities.add(entity);

        const fields: string[]= 
          searchFieldMap?.[entity]?.map(f=>f.toString()) ?? 
          repo.metadata.columns.map((c) => c.propertyName);

        fields.forEach((field)=> {
          const column = repo.metadata.columns.find(c => c.propertyName === field);
          if(!column){
            return
          }
          const para = (partial) ? `%${search}%` : search
          // if(column.enum){
            if(column.isArray && !partial){
              result.push({
                [field]: Raw((alias) => `:search ILIKE ANY ( ${alias} ::text[] )`, { search: `${para}` }),
              });
            }else{
              result.push({
                [field]: Raw((alias) => `${alias} ::text ILIKE :search`, { search: `${para}` }),
              });
            }
          // }else{
          //   // console.log(field)
          //   result.push({
          //     [field]: ILike(Equal(para))
          //   })
          // }
          
        });

          repo.metadata.relations.forEach((relation)=> {
            if(!fields.includes(relation.propertyName)){
              return
            }

            const relatedMeta = relation.inverseEntityMetadata;
            const relatedRepo = this.dataSource.getRepository(relatedMeta.target)

            const nestedWhere = this.searchWhere(
              relatedRepo,
              search,
              partial,
              searchFieldMap,
              visitedEntities
            );

            nestedWhere.forEach((w)=> result.push({[relation.propertyName]: w}))
          })

        return result;

      }

      public singleWhere = <T extends ObjectLiteral,V>(search:string,key:string,repo:Repository<T> ,partial:boolean = false): FindOperator<V> | V | undefined => {
        const para = (partial) ? `%${search}%` : search
        const column = repo.metadata.columns.find(c => c.propertyName === key);
        if(!column){
          return
        }
        if(column.isArray && !partial){
          return Raw((alias) => `:search ILIKE ANY ( ${alias} ::text[] )`, { search: `${para}` })
        }else{
          return Raw((alias) => `${alias} ::text ILIKE :search`, { search: `${para}` });
        }
      }
          


}
