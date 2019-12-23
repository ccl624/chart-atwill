import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { SfPieComponent } from './sf-pie.component';

@NgModule({
  declarations: [SfPieComponent],
  imports: [CommonModule],
  exports: [SfPieComponent]
})
export class SfPieModule { }
