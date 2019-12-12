import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-line-demo',
  templateUrl: './line-demo.component.html',
  styleUrls: ['./line-demo.component.scss']
})
export class LineDemoComponent implements OnInit {

  public option: any;

  constructor() { }

  public ngOnInit() {
    this.option = {
      chartId: 'workTime',
      title: {
        show: true,
        text: '20天工作时长变化趋势 ',
        textAlign: 'center',
        left: '50%'
      },
      legend: {
        show: false,
        data: [
          {
            name: '故障率',
            color1: '#f04b49',
          }
        ]
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {            // 坐标轴指示器，坐标轴触发有效
          type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
        },
        backgroundColor: '#fca156',
        formatter: (params: any) => {
          const colors = ['#2e84fa', '#4bd2e3', '#facb65', '#f04b49'];
          const units = ['h', 'h', '%', '%'];
          return params.reduce((sum: string, param: any, index: number) => {
            return sum + `
                  <div style="display:flex;align-items:center;">
                      <i style="
                          margin-right: 5px;
                          width:8px;
                          height:8px;
                          border-radius:50%;
                          background:${this.option.legend.data[index].color1}"
                      ></i>
                      <span>${param.seriesName}: ${param.value}${units[index]}</span>
                  </div>
              `;
          }, `<div>${params[0].axisName}: ${params[0].axisValue}</div>`);
        }
      },
      grid: [
        {
          top: 50,
          left: 70,
          right: 70,
          bottom: 40
        }
      ],
      xAxis: [
        {
          type: 'category',
          name: '日期',
          data: [],
          axisTick: {
            alignWithLabel: true,
            show: true,
          },
          axisLine: {
            show: true,
            color: '#f0f3f6'
          },
          axisLabel: {
            color: '#333f4c'
          },
          splitLine: {
            show: true,
            color: '#f0f3f6'
          }
        }
      ],
      yAxis: [
        {
          type: 'value',
          name: '时长（h）',
          // min: 0,
          // max: null,
          nameTextStyle: {
            fontWeight: 'bold',
            color: '#333'
          },
          axisLine: {
            show: true,
            color: '#f0f3f6'
          },
          axisTick: {
            color: '#f0f3f6'
          },
          axisLabel: {
            color: '#8391a1'
          },
          scale: true,
          splitLine: {
            show: true,
            color: '#f0f3f6'
          }
        }
      ],
      series: [
        {
          name: '开机率',
          type: 'line',
          itemStyle: {
            color: '#fca156'
          },
          lineStyle: {
            color: '#fca156',
            shadowColor: 'rgba(0,0,0,0.02)',
            shadowBlur: 3,
            shadowOffsetY: 5
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [{
                offset: 0, color: 'rgba(252, 161, 86, 0.3)' // 0% 处的颜色
              }, {
                offset: 1, color: 'rgba(255,255,255,0)' // 100% 处的颜色
              }],
              global: false // 缺省为 false
            }
          },
          data: []
        }
      ]
    };

    const curDay = new Date().getTime();
    for (let index = 0; index < 20; index++) {
      const date = this.formatDate(curDay + index * 1000 * 60 * 60 * 24, 'yyyy-MM-dd');
      const dataItem = (Math.random() * 100).toFixed(2);
      this.option.xAxis[0].data.push(date);
      this.option.series[0].data.push(dataItem);
    }

    console.log(this.option);

  }

  private formatDate(date: any, fmt = 'yyyy-MM-dd HH:mm:ss') {
    const tarDate = new Date(date);
    const o = {
        'M+': tarDate.getMonth() + 1, // 月份
        'd+': tarDate.getDate(), // 日
        'h+': tarDate.getHours(), // 小时
        'm+': tarDate.getMinutes(), // 分
        's+': tarDate.getSeconds(), // 秒
        'q+': Math.floor((tarDate.getMonth() + 3) / 3), // 季度
        S: tarDate.getMilliseconds() // 毫秒
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (tarDate.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    for (const k in o) {
        if (new RegExp('(' + k + ')').test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
        }
    }

    return fmt;
}

}
