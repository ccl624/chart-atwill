import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SfChartComponent } from './sf-chart.component';
import { SfChartService } from './sf-chart.service';


@NgModule({
  declarations: [SfChartComponent],
  imports: [CommonModule],
  exports: [SfChartComponent],
  providers: [SfChartService]
})
export class SfChartModule { }
