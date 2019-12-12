import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { LineDemoComponent } from './line-demo.component';
import { FormsModule } from '@angular/forms';
import { DemoContainerModule, ChartModule } from 'src/app/shared';

const routes: Routes = [
  { path: '', component: LineDemoComponent }
];

@NgModule({
  declarations: [LineDemoComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
    DemoContainerModule,
    ChartModule
  ],
  exports: [LineDemoComponent]
})
export class LineDemoModule { }
