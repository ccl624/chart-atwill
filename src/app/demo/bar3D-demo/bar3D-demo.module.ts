import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { Bar3DDemoComponent } from './bar3D-demo.component';
import { DemoContainerModule, ChartModule, AcezEditorModule } from 'src/app/shared';
import { Bar3DDemoService } from './bar3D-demo.service';

const routes: Routes = [
  { path: '', component: Bar3DDemoComponent }
];

@NgModule({
  declarations: [Bar3DDemoComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    DemoContainerModule,
    ChartModule,
    AcezEditorModule
  ],
  exports: [Bar3DDemoComponent],
  providers: [Bar3DDemoService]
})
export class Bar3DDemoModule { }
