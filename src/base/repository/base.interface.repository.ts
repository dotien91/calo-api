export interface BaseInterfaceRepository<T> {
  create(data: T | any): Promise<T>;
  findOneById(id: string, projection?: any): Promise<T>;
  findOneByCondition(filterCondition: any): Promise<T>;
  paginate(
    page: number,
    limit: number,
    filterCondition?: any,
    projection?: any,
    sort?: any
  ): Promise<T[]>;
  findAll(): Promise<T[]>;
  remove(id: string): Promise<T>;
  count(filterCondition?: any): Promise<number>;
  findOneByConditionAndUpdate(filterCondition: any, data: any): Promise<T>;
}
