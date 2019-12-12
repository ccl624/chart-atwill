import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { GuageChartComponent } from './guage-chart.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [GuageChartComponent],
  imports: [CommonModule, FormsModule],
  exports: [GuageChartComponent]
})
export class GuageChartModule { }
