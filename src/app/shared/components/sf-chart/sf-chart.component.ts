import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
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
export class SfChartComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('chartWrap') chartWrap: ElementRef;

  @Input()
  public get option(): any {
    return this.chartOption;
  }
  public set option(value) {
    this.chartOption = value;
    const timeOut = setTimeout(() => {
      if (this.isAutoLoading && Object.prototype.toString.call(value) === '[object Object]' && Object.keys(value).length !== 0) {
        this.sfChartInit();
      }
      clearTimeout(timeOut);
    }, 20);
  }

  @Input() isAutoLoading = true;

  @Output() public initChart = new EventEmitter<any>();

  public subject: Subject<string> = new Subject<string>();

  private chartOption: any = {};

  private svg: any;

  private xAxis: any;

  private yAxis: any;

  private charts: any[] = [];

  private width = 0;

  private height = 0;

  private isLoaded = false;

  private erd: any;

  private subscription: any;

  constructor(
    private sfcService: SfChartService
  ) { }

  public ngOnDestroy() {
    this.erd.removeListener(this.chartWrap.nativeElement, (element: any) => this.listener(element));
    this.subscription.unsubscribe();
  }

  ngOnInit() {
    this.initChart.emit(this.sfChartInit.bind(this));
  }

  public ngAfterViewInit() {
    const parentDom = this.chartWrap.nativeElement;
    const wrapNode = d3.select(parentDom);
    this.width = Number.parseFloat(wrapNode.style('width'));
    this.height = Number.parseFloat(wrapNode.style('height'));
    this.svg = wrapNode.append('svg').attr('width', '100%').attr('height', '100%');

    this.xAxis = new XAxis(this.svg, this.height);
    this.yAxis = new YAxis(this.svg);

    this.subscription = this.subject.pipe(debounceTime(300)).subscribe(async (res: string) => this.resizeChart(res));
    this.listenResize(parentDom);
  }

  private sfChartInit() {
    const margin = this.sfcService.getChartMargin(this.chartOption, this.width, this.height);
    const minAndMax = this.sfcService.getMinAndMax(this.chartOption);
    this.xAxis.updateData(this.chartOption.xAxis, margin, this.width, this.height);
    this.yAxis.updateData(this.chartOption.yAxis, margin, this.width, this.height, minAndMax);
    const x = this.xAxis.scale;
    const y = this.yAxis.scale;
    this.chartOption.series.forEach((serie: any, index: number) => {
      const data = serie.data.map((item: any, i: number) => ({ value: item.value || item, label: this.chartOption.xAxis.data[i] }));
      const chartItem = this.charts.find(item => item.id === serie.type + index);
      if (chartItem) {
        const chartInstance = chartItem.chartInstance;
        chartInstance.updateChart(serie, data, x, y, minAndMax);
      } else {
        const chart = {
          id: serie.type + index,
          chartInstance: new Line(this.svg, serie, data, x, y, minAndMax)
        };
        this.charts.push(chart);
      }

    });
    this.isLoaded = true;
  }

  private async resizeChart(res: string) {
    const whs = res.split(',');
    const w = Number.parseFloat(whs[0]);
    const h = Number.parseFloat(whs[1]);
    const margin = this.sfcService.getChartMargin(this.chartOption, w, h);
    const minAndMax = this.sfcService.getMinAndMax(this.chartOption);
    this.xAxis.resizeAxis(margin, w, h);
    this.yAxis.resizeAxis(margin, w, h);
    this.charts.forEach(chart => chart.chartInstance.resizeChart(this.xAxis.scale, this.yAxis.scale, minAndMax));
  }

  private listenResize(dom: any) {
    this.erd = ERD();
    this.erd.listenTo(dom, (element: any) => this.listener(element));
  }

  private listener(element: any) {
    const w = element.offsetWidth;
    const h = element.offsetHeight;
    if (this.isLoaded) {
      this.subject.next(`${w},${h}`);
    }
  }
}
