import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { Demo1Component } from './demo1/demo1.component';
import { Demo2Component } from './demo2/demo2.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'demo1' },
  { path: 'demo1', component: Demo1Component },
  { path: 'demo2/:id', component: Demo2Component },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LineRoutingModule { }
