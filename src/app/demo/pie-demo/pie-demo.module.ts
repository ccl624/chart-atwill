import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { PieDemoComponent } from './pie-demo.component';
import { SfPieModule, DemoContainerModule } from 'src/app/shared';

const routes: Routes = [
  { path: '', component: PieDemoComponent }
];

@NgModule({
  declarations: [PieDemoComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SfPieModule,
    DemoContainerModule
  ],
  exports: [PieDemoComponent]
})
export class PieDemoModule { }
