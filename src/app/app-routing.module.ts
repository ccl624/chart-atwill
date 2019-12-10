import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  { path: 'home', loadChildren: './home/home.module#HomeModule' },
  { path: 'd3-geo', loadChildren: './ChinaMap/d3-geo.module#D3GeoModule' },
  { path: '**', pathMatch: 'full', redirectTo: 'd3-geo' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
