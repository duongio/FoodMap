import {
    AfterViewInit,
    Component,
    OnDestroy,
    OnInit
} from "@angular/core";
import {
    debounceTime,
    Subject,
    takeUntil
} from "rxjs";
import { searchProducts } from "../libs/ten-chinh-xac";
import { Product, Shop } from "../models/interface";
import { ProductService } from "../services/get-data.service";
import { prepareFuse, searchFuzzyProducts } from "../libs/ten-gan-dung";
import { getMatchingGroups } from "../libs/ten-theo-nhom";
import { NzModalService } from 'ng-zorro-antd/modal';
import { ChiTietSanPhamComponent } from "../components/chi-tiet-san-pham/chi-tiet-san-pham.component";
import 'leaflet';
import 'leaflet-routing-machine';
import { calculateDistance } from "../libs/distance"; // Ensure this function is correct and exported

declare module 'leaflet' {
    namespace Routing {
        function control(options: any): any;
    }
}
declare let L: any;

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Marker.prototype.options.icon = L.icon({
    iconUrl: '',
    iconSize: [0, 0],
    shadowUrl: '',
    shadowSize: [0, 0]
});

@Component({
    selector: 'app-entry',
    standalone: false,
    templateUrl: './entry.component.html',
    styleUrls: ['./entry.component.scss'],
})
export class EntryComponent implements OnInit, OnDestroy, AfterViewInit {
    products: Product[] = [];
    allGroups: Product[][] = [];
    shops: Shop[] = [];
    shop!: Shop;

    tenSanPham: string = '';
    giaTu: number = NaN;
    giaDen: number = NaN;
    rating: number = NaN;

    resultExact: Product[] = [];
    resultFuzzy: Product[] = [];
    resultGroup: Product[] = [];
    resultProducts: Product[] = [];

    tab: string = 'exact';
    private destroy$ = new Subject<void>();
    private changeGia = new Subject<any>();
    private map: any;
    private userMarker: any;
    private userLatLng: any;

    constructor(
        private productService: ProductService,
        private nzModalService: NzModalService,
    ) { }

    ngOnInit() {
        this.productService.getProducts()
            .pipe(takeUntil(this.destroy$))
            .subscribe(response => {
                this.products = response.map(p => ({
                    ...p,
                    price: typeof p.price === 'string' ? this.parsePrice(p.price) : p.price
                }));
            });

        this.productService.getAllGroups()
            .pipe(takeUntil(this.destroy$))
            .subscribe(response => {
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
            .subscribe(response => {
                this.shops = response;
            });

        this.changeGia
            .pipe(debounceTime(500), takeUntil(this.destroy$))
            .subscribe(() => {
                this.searchSP();
            });
    }

    ngAfterViewInit(): void {
        this.initMap();
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    parsePrice(priceStr: string): number {
        return parseInt(priceStr.replace(/\./g, '').replace('đ', '').trim());
    }

    onName() { this.changeGia.next(null); }
    onGiaTu() { this.changeGia.next(null); }
    onGiaDen() { this.changeGia.next(null); }
    onRating() { this.changeGia.next(null); }

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

        if (this.tab === 'exact') {
            this.resultProducts = this.resultExact;
        } else if (this.tab === 'fuzzy') {
            this.resultProducts = this.resultFuzzy;
        } else if (this.tab === 'group') {
            this.resultProducts = this.resultGroup;
        }

        setTimeout(() => this.updateMapMarkers(), 0);
    }

    initMap() {
        if (!this.map) {
            this.map = L.map('map1').setView([21.0285, 105.8542], 14);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(this.map);
        }

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                this.userLatLng = { lat, lng: lon };

                const userIcon = L.icon({
                    iconUrl: 'assets/user.png',
                    iconSize: [60, 40],
                    iconAnchor: [20, 40],
                    popupAnchor: [0, -40],
                });

                this.userMarker = L.marker([lat, lon], { icon: userIcon })
                    .addTo(this.map)
                    .bindPopup("<b>Vị trí của bạn</b>")
                    .openPopup();

                this.map.setView([lat, lon], 14);

                setTimeout(() => this.updateMapMarkers(), 0);
            }, err => {
                console.warn("Không thể lấy vị trí người dùng:", err.message);
            });
        } else {
            console.warn("Trình duyệt không hỗ trợ Geolocation.");
        }
    }

    updateMapMarkers() {
        if (!this.map || !this.userLatLng) return;

        const shopIcon = L.icon({
            iconUrl: 'assets/restaurant.png',
            iconSize: [60, 40],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32],
        });

        const maxDistanceKm = 3;

        this.map.eachLayer((layer: any) => {
            if (layer instanceof L.Marker && layer !== this.userMarker) {
                this.map.removeLayer(layer);
            }
        });

        this.resultProducts.forEach(product => {
            const shop = this.shops.find(shop => shop.id === product.id);
            if (!shop) return;

            const latLonStr = (shop as any)['lat-lon'];
            if (!latLonStr) return;

            const [latStr, lonStr] = latLonStr.split(',').map((s: string) => s.trim());
            const lat = parseFloat(latStr);
            const lon = parseFloat(lonStr);

            const distance = calculateDistance(this.userLatLng.lat, this.userLatLng.lng, lat, lon);
            if (distance <= maxDistanceKm) {
                const marker = L.marker([lat, lon], { icon: shopIcon }).addTo(this.map);

                const popupId = `popup-${product.id}`;
                marker.bindPopup(`
                    <b>${product.name}</b><br/>
                    <i>${shop.name}</i><br/>
                    ${shop.address}<br/>
                    Giá: ${product.price.toLocaleString()}đ<br/>
                    Cách bạn khoảng: ${distance.toFixed(2)} km<br/>
                    <button id="${popupId}" style="margin-top:5px;color:#1890ff;border:none;background:none;cursor:pointer;">Xem chi tiết</button>
                `);

                marker.on('popupopen', () => {
                    setTimeout(() => {
                        const btn = document.getElementById(popupId);
                        if (btn) {
                            btn.addEventListener('click', () => {
                                this.onClickProduct(product);
                            });
                        }
                    }, 100);
                });
            }
        });
    }


    onClick(tab: string) {
        this.tab = tab;
        if (tab === 'exact') {
            this.resultProducts = this.resultExact;
        } else if (tab === 'fuzzy') {
            this.resultProducts = this.resultFuzzy;
        } else if (tab === 'group') {
            this.resultProducts = this.resultGroup;
        }
        this.updateMapMarkers();
    }

    onClickProduct(product: Product) {
        this.shop = this.shops.find(shop => shop.id === product.id)!;
        this.nzModalService.create({
            nzTitle: '',
            nzContent: ChiTietSanPhamComponent,
            nzFooter: null,
            nzWidth: '95vw',
            nzBodyStyle: {
                padding: '20px',
                'border-radius': '10px',
                'overflow-y': 'auto',
                height: '90vh',
            },
            nzStyle: { top: '10px' },
            nzClassName: 'no-padding-title-modal',
            nzCentered: true,
            nzData: { product, shop: this.shop, parent: this }
        });
    }
}
