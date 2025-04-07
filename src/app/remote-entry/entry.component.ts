import { Component, OnDestroy, OnInit } from "@angular/core";
import { debounceTime, Subject, takeUntil } from "rxjs";
import { searchProducts } from "../libs/ten-chinh-xac";
import { Product, Shop } from "../models/interface";
import { ProductService } from "../services/get-data.service";
import { prepareFuse, searchFuzzyProducts } from "../libs/ten-gan-dung";
import { getMatchingGroups } from "../libs/ten-theo-nhom";
import { NzModalService } from 'ng-zorro-antd/modal';
import { ChiTietSanPhamComponent } from "../components/chi-tiet-san-pham/chi-tiet-san-pham.component";

@Component({
    selector: 'app-entry',
    standalone: false,
    templateUrl: './entry.component.html',
    styleUrls: ['./entry.component.scss'],
})
export class EntryComponent implements OnInit, OnDestroy {
    products: Product[] = [];
    allGroups: Product[][] = [];
    shops: Shop[] = [];
    shop!: Shop;

    tenSanPham: string = '';
    giaTu: number = NaN;
    giaDen: number = NaN;
    rating: number = NaN;

    changeGia = new Subject<any>();

    resultExact: Product[] = [];
    resultFuzzy: Product[] = [];
    resultGroup: Product[] = [];

    tab: string = 'exact';

    private destroy$ = new Subject<void>();

    constructor(
        private productService: ProductService,
        private nzModalService: NzModalService,
    ) { }

    ngOnInit() {
        this.productService.getProducts()
            .pipe(takeUntil(this.destroy$))
            .subscribe((response) => {
                this.products = response.map(p => ({
                    ...p,
                    price: typeof p.price === 'string' ? this.parsePrice(p.price) : p.price
                }));
            });
        this.productService.getAllGroups()
            .pipe(takeUntil(this.destroy$))
            .subscribe((response) => {
                this.allGroups = response.map(group => {
                    if (Array.isArray(group)) {
                        return group.map(product => ({
                            ...product,
                            price: typeof product.price === 'string' ? this.parsePrice(product.price) : product.price
                        }));
                    } else {
                        console.warn("Một nhóm không phải là mảng:", group);
                        return group;
                    }
                });
            });
        this.productService.getShop()
            .pipe(takeUntil(this.destroy$))
            .subscribe((response) => {
                this.shops = response;
            });
        this.changeGia
            .pipe(debounceTime(500), takeUntil(this.destroy$))
            .subscribe(value => {
                this.searchSP();
            });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    parsePrice(priceStr: string): number {
        return parseInt(priceStr.replace(/\./g, '').replace('đ', '').trim());
    }

    onName(data: any) {
        this.changeGia.next(this.tenSanPham);
    }

    onGiaTu(data: any) {
        this.changeGia.next(this.giaTu);
    }

    onGiaDen(data: any) {
        this.changeGia.next(this.giaDen);
    }

    onRating(data: any) {
        this.changeGia.next(this.rating);
    }

    searchSP() {
        this.resultExact = searchProducts(
            this.tenSanPham,
            this.products,
            [this.giaTu, this.giaDen],
            [this.rating, 5]
        );

        prepareFuse(this.products);
        this.resultFuzzy = searchFuzzyProducts(
            this.tenSanPham,
            [this.giaTu, this.giaDen],
            [this.rating, 5],
            40
        );

        this.resultGroup = getMatchingGroups(
            this.resultExact,
            this.resultFuzzy,
            this.allGroups,
            this.tenSanPham,
            40,
            [this.giaTu, this.giaDen],
            [this.rating, 5]
        );
    }

    onClick(tab: string) {
        this.tab = tab;
    }

    onClickProduct(product: Product) {
        this.shop = this.shops.find(shop => shop.id === product.id)!;
        this.nzModalService.create({
            nzTitle: '',
            nzContent: ChiTietSanPhamComponent,
            nzFooter: null,
            // nzWidth: '90vw',
            nzBodyStyle: {
                'padding': '20px',
                'border-radius': '10px',
                'overflow-y': 'auto',
                // 'height': '85vh',
            },
            nzStyle: { top: '20px' },
            nzClassName: 'no-padding-title-modal',
            nzCentered: true,
            nzData: { product, shop: this.shop, parent: this }
        })
    }
}