import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Product, Shop } from '../models/interface';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(private http: HttpClient) { }

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>('assets/file_data.json');
  }

  getAllGroups(): Observable<Product[][]> {
    return this.http.get<Product[][]>('assets/product_groups.json');
  }

  getShop(): Observable<Shop[]> {
    return this.http.get<Shop[]>('assets/shop.json');
  }
}
