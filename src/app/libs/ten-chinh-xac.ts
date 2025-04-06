import { Product } from "../models/interface";

function getFailureArray(pattern: string): number[] {
  const failure: number[] = [0];
  let i = 0;
  let j = 1;
  while (j < pattern.length) {
    if (pattern[i] === pattern[j]) {
      i++;
    } else if (i > 0) {
      i = failure[i - 1];
      continue;
    }
    failure.push(i);
    j++;
  }
  return failure;
}

function kmp(pattern: string, text: string): boolean {
  const failure = getFailureArray(pattern);
  let i = 0;
  let j = 0;
  while (i < text.length) {
    if (pattern[j] === text[i]) {
      if (j === pattern.length - 1) return true;
      j++;
    } else if (j > 0) {
      j = failure[j - 1];
      continue;
    }
    i++;
  }
  return false;
}

export function searchProducts(
  pattern: string,
  products: Product[],
  priceRange?: [number, number],
  rateRange?: [number, number]
): Product[] {
  const keyword = pattern.toLowerCase();
  let matched = products.filter((p) => kmp(keyword, p.name.toLowerCase()));
  if (priceRange) {
    const [minPrice, maxPrice] = priceRange;
    const validMinPrice = isNaN(minPrice) ? -Infinity : minPrice;
    const validMaxPrice = isNaN(maxPrice) ? Infinity : maxPrice;
    matched = matched.filter(
      (p) => p.price >= validMinPrice && p.price <= validMaxPrice
    );
  }
  if (rateRange) {
    const [minRate, maxRate] = rateRange;
    const validMinRate = isNaN(minRate) ? 0 : minRate;
    const validMaxRate = isNaN(maxRate) ? 5 : maxRate;
    matched = matched.filter(
      (p) => p.rate >= validMinRate && p.rate <= validMaxRate
    );
  }
  matched = matched.sort((a, b) => b.rate - a.rate);

  return matched;
}
