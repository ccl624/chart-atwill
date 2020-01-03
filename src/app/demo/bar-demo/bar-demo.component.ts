import { Component, OnInit } from '@angular/core';
import { BarDemoService } from './bar-demo.service';

@Component({
  selector: 'app-bar-demo',
  templateUrl: './bar-demo.component.html',
  styleUrls: ['./bar-demo.component.scss']
})
export class BarDemoComponent implements OnInit {

  public option: any;

  public myCode = '';

  public chartInit: () => {};

  constructor(
    private barDemoService: BarDemoService
  ) { }

  public ngOnInit() {
    this.barDemoService.getText().subscribe((res: any) => {
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
