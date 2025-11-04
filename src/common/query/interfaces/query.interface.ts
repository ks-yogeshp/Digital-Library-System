export interface Query<T> {
    data: T[];
    meta?: {
        itemsPerPage: number;
        totalItems: number;
        currentPage: number;
        totalPage: number;
    };
    links?: {
        first: string;
        last: string;
        current: string;
        next: string;
        previous: string;
    };
}