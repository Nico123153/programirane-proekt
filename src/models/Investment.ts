export interface Investment {
    id?: number;
    type: 'stock' | 'crypto';
    symbol: string;
    quantity: number;
    price: number;
}
