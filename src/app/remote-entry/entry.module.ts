import { NgModule } from "@angular/core";
import { EntryComponent } from "./entry.component";
import { EntryRoutingModule } from "./entry-routing.module";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { ChiTietSanPhamComponent } from "../components/chi-tiet-san-pham/chi-tiet-san-pham.component";
import { MapComponent } from "../components/map/map.component";

@NgModule({
    declarations: [
        EntryComponent,

        ChiTietSanPhamComponent,
        MapComponent,
    ],
    imports: [
        CommonModule, FormsModule, ReactiveFormsModule,
        EntryRoutingModule,

        NzModalModule,
        NzButtonModule,
        NzIconModule,
        NzInputModule,
    ],
    providers: [
    ],
    exports: [
        EntryComponent
    ]
})
export class EntryModule { }