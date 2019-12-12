import { Component, OnInit, AfterViewInit, Input, Output, EventEmitter, TemplateRef } from '@angular/core';

@Component({
  selector: 'guage-demo',
  templateUrl: './guage-demo.component.html',
  styleUrls: ['./guage-demo.component.scss'],
})

export class GuageDemoComponent implements OnInit, AfterViewInit {

  public introduce = '指、报表中的一种图表类型，FineReport可以轻松设计出仪表盘来展示用户的数据，清晰的看出某个指标值所在的范围。';

  public params: any[] = [
    { parameter: 'id', explanation: '仪表盘ID' },
    { parameter: 'max', explanation: '仪表盘最大值' },
    { parameter: 'min', explanation: '仪表盘最小值' },
    { parameter: 'currentVal', explanation: '仪表盘当前值' },
    { parameter: 'guageAngle', explanation: '仪表盘弧度（Math.PI * 3 / 2）' },
    { parameter: 'interval', explanation: '仪表盘粒度' },
    { parameter: 'showSides', explanation: '是否展示仪表盘两端' },
    { parameter: 'unit', explanation: '展示数据单位' },
    { parameter: 'showInput', explanation: '是否展示输入框' },
    { parameter: 'fixed', explanation: '数据精度（保留小数点后几位）' },
    { parameter: 'ply', explanation: '表盘厚度' }
  ];

  public htmlStr = '<guage-chart [option]="chartOption" [sfValue]="value"></guage-chart>';

  constructor() { }

  public ngOnInit() {

  }

  public ngAfterViewInit() {

  }


}
