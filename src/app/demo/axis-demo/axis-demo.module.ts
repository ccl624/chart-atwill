import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AxisDemoComponent } from './axis-demo.component';
import { DemoContainerModule, AcezEditorModule } from 'src/app/shared';

const routes: Routes = [
  { path: '', component: AxisDemoComponent }
];

@NgModule({
  declarations: [AxisDemoComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    DemoContainerModule,
    AcezEditorModule
  ],
  exports: [AxisDemoComponent],
})
export class AxisDemoModule { }
