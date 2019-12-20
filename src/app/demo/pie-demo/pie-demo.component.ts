import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-pie-demo',
  templateUrl: './pie-demo.component.html',
  styleUrls: ['./pie-demo.component.scss']
})
export class PieDemoComponent implements OnInit {
  public option: any;

  public option1: any;

  private pieIntance: any;

  constructor() {}

  ngOnInit() {
    this.option = {
      id: 'sf-pie',
      color: [
        '#1264fb',
        '#1b79fa',
        '#4b96fc',
        '#5fbefb',
        '#7be3fd',
        '#34c6d8',
        '#7460ee',
        '#a26ad8',
        '#d96bcc',
        '#fb9715',
        '#fdc75e',
        '#c3da6e',
        '#afea77',
        '#7adf7a',
        '#4ad35b',
        '#87eed0',
        '#a3f5dd',
        '#6cdbbb',
        '#96e3fd',
        '#fe9d9d',
        '#fa7676',
        '#fb6262'
      ],
      legend: {
        type: 'scroll',
        orient: 'vertical',
        right: 10,
        top: 20,
        bottom: 20,
        data: ['张无忌0', '张无忌1', '张无忌2', '张无忌3', '张无忌4', '张无忌5', '张无忌6', '张无忌7', '张无忌8', '张无忌9', '张无忌10', '张无忌11']

        // selected: data.selected
      },
      series: [
        {
          radius: ['0%', '40%'],
          center: ['50%', '50%'],
          padAngle: 0.01,
          cornerRadius: 2,
          label: {
            show: true,
            position: 'inner'
          },
          data: [
            { name: '静夜思1', value: 57 },
            { name: '静夜思2', value: 77 },
            { name: '静夜思3', value: 34 },
            { name: '静夜思4', value: 55 },
            { name: '静夜思5', value: 46 },
            { name: '静夜思6', value: 48 }
          ]
        },
        {
          radius: ['50%', '65%'],
          center: ['50%', '50%'],
          padAngle: 0.01,
          cornerRadius: 2,
          label: {
            show: true,
            borderWidth: 1,
            background: '#ffffff',
            borderColor: '#bbb'
          },
          data: [
            { name: '静夜思，李白', value: 90 },
            { name: '床前明月光，疑是地上霜', value: 54 },
            { name: '床前明月光，疑是地上霜1', value: 32 },
            { name: '床前明月光，疑是地上霜2', value: 77 },
            { name: '床前明月光，疑是地上霜3', value: 61 },
            { name: '床前明月光，疑是地上霜4', value: 15 },
            { name: '床前明月光，疑是地上霜5', value: 25 },
            { name: '床前明月光，疑是地上霜6', value: 81 },
            { name: '床前明月光，疑是地上霜7', value: 6 },
            { name: '床前明月光，疑是地上霜8', value: 33 }
          ]
        }
      ]
    };

    this.option.legend.data = this.option.series[0].data.map(d => d.name).concat(this.option.series[1].data.map(d => d.name));
  }

  public pieSelected(data: any) {
    console.log(data);
  }

  public onPieInit(pieIntance: any) {
    this.pieIntance = pieIntance;
  }
}
