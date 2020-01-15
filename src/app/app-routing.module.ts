import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  { path: 'home', loadChildren: './home/home.module#HomeModule' },
  { path: 'line', loadChildren: './demo/line/line.module#LineModule' },
  { path: 'axis-demo', loadChildren: './demo/axis-demo/axis-demo.module#AxisDemoModule' },
  { path: 'china-map', loadChildren: './demo/china-map/china-map.module#ChinaMapModule' },
  { path: 'guage-demo', loadChildren: './demo/guage-demo/guage-demo.module#GuageDemoModule' },
  { path: 'bar-demo', loadChildren: './demo/bar-demo/bar-demo.module#BarDemoModule' },
  { path: 'pie-demo', loadChildren: './demo/pie-demo/pie-demo.module#PieDemoModule' },
  { path: 'bar3D-demo', loadChildren: './demo/bar3D-demo/bar3D-demo.module#Bar3DDemoModule' },
  { path: 'bookshelf-demo', loadChildren: './demo/bookshelf-demo/bookshelf-demo.module#BookshelfDemoModule' },
  { path: '**', pathMatch: 'full', redirectTo: 'home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
