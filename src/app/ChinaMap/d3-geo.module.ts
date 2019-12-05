import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { D3GeoComponent } from './d3-geo.component';
import { D3GeoService } from './d3-geo.service';
const routes: Routes = [
  { path: '', component: D3GeoComponent }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  declarations: [D3GeoComponent],
  providers: [D3GeoService]
})

export class D3GeoModule { }


