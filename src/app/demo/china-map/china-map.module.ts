import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { ChinaMapComponent } from './china-map.component';
import { ChinaMapService } from './china-map.service';
const routes: Routes = [
  { path: '', component: ChinaMapComponent }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ChinaMapComponent],
  providers: [ChinaMapService]
})

export class ChinaMapModule { }


