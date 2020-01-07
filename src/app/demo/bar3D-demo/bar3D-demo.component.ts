import { Component, OnInit } from '@angular/core';
import { Bar3DDemoService } from './bar3D-demo.service';

@Component({
  selector: 'app-bar3D-demo',
  templateUrl: './bar3D-demo.component.html',
  styleUrls: ['./bar3D-demo.component.scss']
})
export class Bar3DDemoComponent implements OnInit {


  public option: any;

  public myCode = '';

  public chartInit: () => {};

  constructor(
    private bar3DDemoService: Bar3DDemoService
  ) { }

  public ngOnInit() {
    this.bar3DDemoService.getText().subscribe((res: any) => {
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
