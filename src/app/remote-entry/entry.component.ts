import { Component, OnDestroy, OnInit } from "@angular/core";
import { debounceTime, Subject, takeUntil } from "rxjs";
import { searchProducts } from "../libs/ten-chinh-xac";
import { Product } from "../models/interface";
import { ProductService } from "../services/get-data.service";
import { prepareFuse, searchFuzzyProducts } from "../libs/ten-gan-dung";
import { getMatchingGroups } from "../libs/ten-theo-nhom";

@Component({
    selector: 'app-entry',
    standalone: false,
    templateUrl: './entry.component.html',
    styleUrls: ['./entry.component.scss'],
})
export class EntryComponent implements OnInit, OnDestroy {
    products: Product[] = [];
    allGroups: Product[][] = [];
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
        // this.checkValue();

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

    checkValue() {
        this.giaTu = this.giaTu ? this.giaTu : 0;
        this.giaDen = this.giaDen ? this.giaDen : 1000000;
        this.rating = this.rating ? this.rating : 0;
    }

    onClick(tab: string) {
        this.tab = tab;
    }
}