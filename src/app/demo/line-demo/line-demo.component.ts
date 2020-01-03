import { Component, OnInit } from '@angular/core';
import { LineDemoService } from './line-demo.service';

@Component({
  selector: 'app-line-demo',
  templateUrl: './line-demo.component.html',
  styleUrls: ['./line-demo.component.scss']
})
export class LineDemoComponent implements OnInit {

  public option: any;

  public myCode = '';

  public chartInit: () => {};

  constructor(
    private lineDemoService: LineDemoService
  ) {}

  public ngOnInit() {
    this.lineDemoService.getText().subscribe((res: any) => {
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

  public OnInitChart(callback: any) {
    this.chartInit = callback;
  }
}
