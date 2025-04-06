import Fuse from 'fuse.js';
import { Product } from '../models/interface';

let fuse: Fuse<Product>;

export function prepareFuse(products: Product[]) {
  const options: Fuse.IFuseOptions<Product> = {
    keys: ['name'],
    threshold: 0.4,
  };
  fuse = new Fuse(products, options);
}

export function searchFuzzyProducts(
  query: string,
  priceRange?: [number, number],
  rateRange?: [number, number],
  topN: number = 10
): Product[] {
  if (!fuse) return [];
  const result = fuse.search(query).map(res => res.item);
  return result
    .filter((product) => {
      const validMinPrice = priceRange?.[0] != undefined && !isNaN(priceRange[0]) ? priceRange[0] : -Infinity;
      const validMaxPrice = priceRange?.[1] != undefined && !isNaN(priceRange[1]) ? priceRange[1] : Infinity;
      const priceValid = product.price >= validMinPrice && product.price <= validMaxPrice;
      const validMinRate = rateRange?.[0] != undefined && !isNaN(rateRange[0]) ? rateRange[0] : 0;
      const validMaxRate = rateRange?.[1] != undefined && !isNaN(rateRange[1]) ? rateRange[1] : 5;
      const rateValid = product.rate >= validMinRate && product.rate <= validMaxRate;

      return priceValid && rateValid;
    })
    .slice(0, topN);
}
