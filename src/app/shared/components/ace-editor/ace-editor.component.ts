import { Component, OnInit, AfterViewInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
const ace = require('ace-builds/src-min-noconflict/ace');

@Component({
  selector: 'app-ace-editor',
  templateUrl: './ace-editor.component.html',
  styleUrls: ['./ace-editor.component.scss']
})
export class AceEditorComponent implements OnInit, AfterViewInit {

  @ViewChild('aceEditor') public aceEditor: any;

  public id = '001';

  private beautify: any;

  @Input() public text = '';

  @Output() public editorTextChange = new EventEmitter<any>();

  @Output() public runCode = new EventEmitter<any>();

  public editorOpt: any = {
    minLines: 1000,
    printMargin: false
  };

  constructor() { }

  public ngOnInit() {
    // console.log(ace, this.aceEditor, this.aceEditor.getEditor().session);
    this.beautify = ace.require('ace/ext/beautify');
    console.log(this.beautify);
  }

  public beautifyCode() {
    this.beautify.beautify(this.aceEditor.getEditor().session);
  }

  public ngAfterViewInit() {
    // if (this.text) {
    //   this.beautifyCode();
    //   this.runMyCode();
    // }
  }

  public onChange(event: any) {
    this.editorTextChange.emit(event);
  }

  public runMyCode() {
    this.runCode.emit(this.text);
  }

}
