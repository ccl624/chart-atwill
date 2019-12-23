import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { BarDemoComponent } from './bar-demo.component';
import { DemoContainerModule, ChartModule } from 'src/app/shared';

const routes: Routes = [
  { path: '', component: BarDemoComponent }
];

@NgModule({
  declarations: [BarDemoComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    DemoContainerModule,
    ChartModule
  ],
  exports: [BarDemoComponent]
})
export class BarDemoModule { }
