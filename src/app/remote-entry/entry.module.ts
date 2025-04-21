import { NgModule } from "@angular/core";
import { EntryComponent } from "./entry.component";
import { EntryRoutingModule } from "./entry-routing.module";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule, NZ_ICONS } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';

import { EyeInvisibleOutline } from '@ant-design/icons-angular/icons';

const icons = [
    EyeInvisibleOutline,
]

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
        { provide: NZ_ICONS, useValue: icons },
    ],
    exports: [
        EntryComponent
    ]
})
export class EntryModule { }