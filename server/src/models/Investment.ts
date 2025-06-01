export interface Investment {
    id?: number;
    name: string;
    type: "stock" | "crypto";
    amount: number;
    price: number;
    date: string;
}
