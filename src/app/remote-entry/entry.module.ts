import { NgModule } from "@angular/core";
import { EntryComponent } from "./entry.component";
import { EntryRoutingModule } from "./entry-routing.module";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';

@NgModule({
    declarations: [
        EntryComponent,
    ],
    imports: [
        CommonModule, FormsModule, ReactiveFormsModule,
        EntryRoutingModule,

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