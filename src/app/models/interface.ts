export interface Product {
  id: string;
  image: string;
  name: string;
  price: number;
  rate: number;
  count: number;
  similarity?: number;
  groupId?: number;
}