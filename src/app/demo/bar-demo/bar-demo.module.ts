import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { BarDemoComponent } from './bar-demo.component';
import { DemoContainerModule, ChartModule, AcezEditorModule } from 'src/app/shared';
import { BarDemoService } from './bar-demo.service';

const routes: Routes = [
  { path: '', component: BarDemoComponent }
];

@NgModule({
  declarations: [BarDemoComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    DemoContainerModule,
    ChartModule,
    AcezEditorModule
  ],
  exports: [BarDemoComponent],
  providers: [BarDemoService]
})
export class BarDemoModule { }
