import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AceEditorComponent } from './ace-editor.component';
import { AceEditorModule } from 'ng2-ace-editor';

@NgModule({
  declarations: [AceEditorComponent],
  imports: [CommonModule, AceEditorModule],
  exports: [AceEditorComponent]
})
export class AcezEditorModule { }
