import { Component, OnInit } from '@angular/core';
import { LineService } from '../line.service';

@Component({
  selector: 'app-demo2',
  templateUrl: './demo2.component.html',
  styleUrls: ['./demo2.component.scss']
})
export class Demo2Component implements OnInit {

  public option: any = {};

  public myCode = '';

  public chartInit: () => {};

  constructor(
    private lineService: LineService
  ) { }

  public ngOnInit() {
    this.lineService.getText('assets/text/lineDemo2Code.text').subscribe((res: any) => {
      this.myCode = res;
      this.showChartResult(this.myCode);
    });
  }

  public showChartResult(event: any) {
    const codeConfig: any = {};
    new Function(event).bind(codeConfig)();
    this.option = codeConfig.option;
    const timeout = setTimeout(() => {
      this.chartInit();
      clearTimeout(timeout);
    }, 200);
  }

  public onChartInit(callback: any) {
    this.chartInit = callback;
  }
}
