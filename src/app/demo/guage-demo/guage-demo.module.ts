import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { GuageDemoComponent } from './guage-demo.component';
import { FormsModule } from '@angular/forms';
import { DemoContainerModule, GuageChartModule } from 'src/app/shared';

const routes: Routes = [
  { path: '', component: GuageDemoComponent }
];

@NgModule({
  declarations: [GuageDemoComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
    DemoContainerModule,
    GuageChartModule
  ],
  exports: [GuageDemoComponent]
})
export class GuageDemoModule { }
