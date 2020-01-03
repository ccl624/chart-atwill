import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { LineDemoComponent } from './line-demo.component';
import { DemoContainerModule, ChartModule, AcezEditorModule } from 'src/app/shared';
import { LineDemoService } from './line-demo.service';

const routes: Routes = [
  { path: '', component: LineDemoComponent }
];

@NgModule({
  declarations: [LineDemoComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    DemoContainerModule,
    ChartModule,
    AcezEditorModule
  ],
  exports: [LineDemoComponent],
  providers: [LineDemoService]
})
export class LineDemoModule { }
