// import { Product } from "../models/interface";

// export function getMatchingGroups(
//   resultExact: Product[],
//   resultFuzzy: Product[],
//   allGroups: Product[][],
//   priceRange?: [number, number],
//   rateRange?: [number, number]
// ): Product[] {
//   let selectedProducts = resultExact.length > 0 ? resultExact.slice(0, 10) : resultFuzzy.slice(0, 10);
//   const matchingGroupIds = new Set<number>();
//   selectedProducts.forEach(product => {
//     allGroups.forEach((group, groupId) => {
//       const productInGroup = group.find(p => p.id === product.id);
//       if (productInGroup) {
//         matchingGroupIds.add(groupId);
//       }
//     });
//   });
//   let filteredProducts: Product[] = [];
//   allGroups.forEach((group, groupId) => {
//     if (matchingGroupIds.has(groupId)) {
//       const filteredInGroup = group.filter(product => {
//         const validMinPrice = priceRange?.[0] != undefined && !isNaN(priceRange[0]) ? priceRange[0] : -Infinity;
//         const validMaxPrice = priceRange?.[1] != undefined && !isNaN(priceRange[1]) ? priceRange[1] : Infinity;
//         const priceValid = product.price >= validMinPrice && product.price <= validMaxPrice;
//         const validMinRate = rateRange?.[0] != undefined && !isNaN(rateRange[0]) ? rateRange[0] : 0;
//         const validMaxRate = rateRange?.[1] != undefined && !isNaN(rateRange[1]) ? rateRange[1] : 5;
//         const rateValid = product.rate >= validMinRate && product.rate <= validMaxRate;

//         return priceValid && rateValid;
//       });

//       filteredProducts = filteredProducts.concat(filteredInGroup);
//     }
//   });

//   return filteredProducts;
// }

import Fuse from 'fuse.js';
import { Product } from '../models/interface';

let fuse: Fuse<Product>;

export function prepareFuse(products: Product[]): void {
  const options: Fuse.IFuseOptions<Product> = {
    keys: ['name'],
    threshold: 0.4,
  };
  fuse = new Fuse(products, options);
}

export function searchFuzzyProducts(query: string, topN: number = 10): Product[] {
  if (!fuse) return [];
  const result = fuse.search(query).map(res => res.item);
  return result.slice(0, topN);
}

export function getMatchingGroups(
  resultExact: Product[],
  resultFuzzy: Product[],
  allGroups: Product[][],
  keyword: string,
  topN: number = 10,
  priceRange?: [number, number],
  rateRange?: [number, number],
): Product[] {
  let selectedProducts = resultExact.length > 0 ? resultExact.slice(0, 10) : resultFuzzy.slice(0, 10);
  prepareFuse(selectedProducts);
  const resultWithSimilarity = selectedProducts.map(product => {
    const searchResult = searchFuzzyProducts(keyword, topN);
    const similarity = searchResult.find(res => res.id === product.id)?.similarity ?? 0;
    return { ...product, similarity };
  });
  const matchingGroupIds = new Set<number>();
  resultWithSimilarity.forEach(product => {
    allGroups.forEach((group, groupId) => {
      const productInGroup = group.find(p => p.id === product.id);
      if (productInGroup) {
        matchingGroupIds.add(groupId);
      }
    });
  });

  let filteredProducts: Product[] = [];
  allGroups.forEach((group, groupId) => {
    if (matchingGroupIds.has(groupId)) {
      const filteredInGroup = group
        .filter(product => {
          const validMinPrice = priceRange?.[0] != undefined && !isNaN(priceRange[0]) ? priceRange[0] : -Infinity;
          const validMaxPrice = priceRange?.[1] != undefined && !isNaN(priceRange[1]) ? priceRange[1] : Infinity;
          const priceValid = product.price >= validMinPrice && product.price <= validMaxPrice;
          const validMinRate = rateRange?.[0] != undefined && !isNaN(rateRange[0]) ? rateRange[0] : 0;
          const validMaxRate = rateRange?.[1] != undefined && !isNaN(rateRange[1]) ? rateRange[1] : 5;
          const rateValid = product.rate >= validMinRate && product.rate <= validMaxRate;

          return priceValid && rateValid;
        })
        .sort((a, b) => (b.similarity ?? 0) - (a.similarity ?? 0));
      filteredProducts = filteredProducts.concat(filteredInGroup);
    }
  });
  return filteredProducts;
}
