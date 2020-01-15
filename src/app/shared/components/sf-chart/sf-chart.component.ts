import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { SfChartService } from './sf-chart.service';
import { XAxis, YAxis } from './chart-axis';
import { Line } from './chart-type';
import * as d3 from 'd3';
import * as ERD from 'element-resize-detector';

@Component({
  selector: 'sf-chart',
  templateUrl: './sf-chart.component.html',
  styleUrls: ['./sf-chart.component.scss']
})
export class SfChartComponent implements OnInit, AfterViewInit {

  @ViewChild('chartWrap') chartWrap: ElementRef;

  @Input() option: any = {};

  @Input() isAutoLoading = true;

  @Output() public initChart = new EventEmitter<any>();

  public subject: Subject<string> = new Subject<string>();

  private svg: any;

  private xAxis: any;

  private yAxis: any;

  private charts: any[] = [];

  private width = 0;

  private height = 0;

  constructor(
    private sfcService: SfChartService
  ) { }

  ngOnInit() {
    this.initChart.emit(this.sfChartInit.bind(this));
  }

  public ngAfterViewInit() {
    const parentDom = this.chartWrap.nativeElement;
    const wrapNode = d3.select(parentDom);
    this.listenResize(parentDom);
    this.width = Number.parseFloat(wrapNode.style('width'));
    this.height = Number.parseFloat(wrapNode.style('height'));
    this.svg = wrapNode.append('svg').attr('width', '100%').attr('height', '100%');

    this.xAxis = new XAxis(this.svg);
    this.yAxis = new YAxis(this.svg);

    if (this.isAutoLoading) {
      this.sfChartInit();
    }

    this.subject.pipe(debounceTime(300)).subscribe(async (res) => {
      const whs = res.split(',');
      const w = Number.parseFloat(whs[0]);
      const h =  Number.parseFloat(whs[1]);
      const margin = this.sfcService.getChartMargin(this.option, w, h);
      if (this.xAxis && this.yAxis) {
        this.xAxis.resizeAxis(margin, w, h);
        this.yAxis.resizeAxis(margin, w, h);
        this.charts.forEach(chart => chart.chartInstance.resizeChart(this.xAxis.scale, this.yAxis.scale));
      }
    });
  }

  private sfChartInit() {
    const margin = this.sfcService.getChartMargin(this.option, this.width, this.height);
    const minAndMax = this.sfcService.getMinAndMax(this.option);
    this.xAxis.updateData(this.option.xAxis, margin, this.width, this.height);
    this.yAxis.updateData(this.option.yAxis, margin, this.width, this.height, minAndMax);
    const x = this.xAxis.scale;
    const y = this.yAxis.scale;
    this.option.series.forEach((serie: any, index: number) => {
      const data = serie.data.map((item: any, i: number) => ({ value: item.value || item, label: this.option.xAxis.data[i] }));
      const chartItem = this.charts.find(item => item.id === serie.type + index);
      if (chartItem) {
        const chartInstance = chartItem.chartInstance;
        chartInstance.updateData(x, y, serie, data);
      } else {
        const chart = {
          id: serie.type + index,
          chartInstance: new Line(this.svg, x, y, serie, data)
        };
        this.charts.push(chart);
      }

    });
  }

  private listenResize(dom: any) {
    const erd = ERD();
    erd.listenTo(dom, (element: any) => {
      const w = element.offsetWidth;
      const h = element.offsetHeight;
      this.subject.next(`${w},${h}`);
    });
  }
}
