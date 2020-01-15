import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DemoContainerModule, ChartModule, AcezEditorModule, SfChartModule } from 'src/app/shared';
import { LineRoutingModule } from './line.routing';
import { LineService } from './line.service';
import { Demo1Component } from './demo1/demo1.component';
import { Demo2Component } from './demo2/demo2.component';


@NgModule({
  declarations: [Demo1Component, Demo2Component],
  imports: [
    CommonModule,
    LineRoutingModule,
    DemoContainerModule,
    ChartModule,
    AcezEditorModule,
    SfChartModule
  ],
  providers: [LineService]
})
export class LineModule { }
