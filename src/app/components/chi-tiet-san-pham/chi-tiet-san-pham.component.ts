import { Component, Inject, OnInit } from "@angular/core";
import { NZ_MODAL_DATA } from "ng-zorro-antd/modal";
import { Product, Shop } from "../../models/interface";

@Component({
  selector: 'app-chi-tiet-san-pham',
  standalone: false,
  templateUrl: './chi-tiet-san-pham.component.html',
  styleUrls: ['./chi-tiet-san-pham.component.scss'],
})
export class ChiTietSanPhamComponent implements OnInit {
  product!: Product;
  shop!: Shop;

  constructor(
    @Inject(NZ_MODAL_DATA) public data: any,
  ) { }

  ngOnInit() {
    this.product = this.data.product;
    this.shop = this.data.shop;
  }
}