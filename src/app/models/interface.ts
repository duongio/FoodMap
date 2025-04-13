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

export interface Shop {
  id: string;
  name: string;
  address: string;
  link: string;
  type: string;
  "lat-lon": string;
}