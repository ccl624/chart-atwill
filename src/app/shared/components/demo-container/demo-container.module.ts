import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DemoContainerComponent } from './demo-container.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [DemoContainerComponent],
  imports: [CommonModule, FormsModule],
  exports: [DemoContainerComponent]
})
export class DemoContainerModule { }
