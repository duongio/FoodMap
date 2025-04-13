import { AfterViewInit, Component, Inject, OnInit } from "@angular/core";
import { NZ_MODAL_DATA } from "ng-zorro-antd/modal";
import { Product, Shop } from "../../models/interface";
// import * as L from 'leaflet';
import 'leaflet';
import 'leaflet-routing-machine';

declare module 'leaflet' {
  namespace Routing {
    function control(options: any): any;
  }
}

declare let L: any;

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Marker.prototype.options.icon = L.icon({
  iconUrl: '',
  iconSize: [0, 0], // Không hiển thị
  shadowUrl: '',
  shadowSize: [0, 0]
});
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: 'assets/icons/marker-icon-2x.png',
//   iconUrl: 'assets/icons/marker-icon.png',
//   shadowUrl: 'assets/icons/marker-shadow.png'
// });


@Component({
  selector: 'app-chi-tiet-san-pham',
  standalone: false,
  templateUrl: './chi-tiet-san-pham.component.html',
  styleUrls: ['./chi-tiet-san-pham.component.scss'],
})
export class ChiTietSanPhamComponent implements OnInit, AfterViewInit {
  product!: Product;
  shop!: Shop;
  lat!: any;
  lon!: any;

  constructor(
    @Inject(NZ_MODAL_DATA) public data: any,
  ) { }

  ngOnInit() {
    this.product = this.data.product;
    this.shop = this.data.shop;
    const latLonStr = (this.shop as any)['lat-lon'];
    const [latStr, lonStr] = latLonStr.split(',').map((s: any) => s.trim());
    this.lat = parseFloat(latStr);
    this.lon = parseFloat(lonStr);
  }

  // ngAfterViewInit(): void {
  //   const map = L.map('map').setView([21.0285, 105.8542], 14);

  //   L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  //     attribution: '&copy; OpenStreetMap contributors'
  //   }).addTo(map);

  //   const restaurants = [
  //     { name: "Nhà hàng A", address: "123 Hoàn Kiếm", lat: 21.033, lon: 105.85 },
  //     { name: "Nhà hàng B", address: "45 Cầu Giấy", lat: 21.035, lon: 105.80 },
  //     { name: "Nhà hàng C", address: "78 Ba Đình", lat: 21.028, lon: 105.82 }
  //   ];

  //   restaurants.forEach(restaurant => {
  //     L.marker([restaurant.lat, restaurant.lon])
  //       .addTo(map)
  //       .bindPopup(`<b>${restaurant.name}</b><br>${restaurant.address}`);
  //   });
  // }

  ngAfterViewInit(): void {
    if (typeof window !== 'undefined' && L?.Routing) {
      const map = L.map('map').setView([21.0285, 105.8542], 14);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      const shopIcon = L.icon({
        iconUrl: 'assets/restaurant.png',
        iconSize: [60, 40],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });
      L.marker([this.lat, this.lon], { icon: shopIcon })
        .addTo(map)
        .bindPopup(`<b>${this.shop.name}</b><br>${this.shop.address}`)
        .openPopup();

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          position => {
            const userLat = position.coords.latitude;
            const userLon = position.coords.longitude;

            const userIcon = L.icon({
              iconUrl: 'assets/user.png',
              iconSize: [60, 40],
              iconAnchor: [16, 32],
              popupAnchor: [0, -32],
            });
            L.marker([userLat, userLon], { icon: userIcon })
              .addTo(map)
              .bindPopup("Vị trí của bạn")
              .openPopup();


            L.Routing.control({
              waypoints: [
                L.latLng(userLat, userLon),
                L.latLng(this.lat, this.lon)
              ],
              routeWhileDragging: false
            }).addTo(map);

          },
          error => {
            console.error("Không thể lấy vị trí hiện tại:", error);
            alert("Không thể lấy vị trí của bạn. Vui lòng kiểm tra quyền truy cập định vị.");
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      } else {
        alert("Trình duyệt không hỗ trợ định vị vị trí.");
      }
    } else {
      console.error('L.Routing is not available');
    }
  }
}