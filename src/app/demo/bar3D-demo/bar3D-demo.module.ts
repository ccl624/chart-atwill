import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { Bar3DDemoComponent } from './bar3D-demo.component';
import { DemoContainerModule, ChartModule } from 'src/app/shared';

const routes: Routes = [
  { path: '', component: Bar3DDemoComponent }
];

@NgModule({
  declarations: [Bar3DDemoComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    DemoContainerModule,
    ChartModule
  ],
  exports: [Bar3DDemoComponent]
})
export class Bar3DDemoModule { }
