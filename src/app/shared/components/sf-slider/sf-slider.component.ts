import { Component, OnInit, Input, Output, AfterViewInit, EventEmitter, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import * as d3 from 'd3';
import * as ERD from 'element-resize-detector';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'sf-slider',
  templateUrl: './sf-slider.component.html',
  styleUrls: ['./sf-slider.component.scss']
})
export class SfSliderComponent implements OnInit, AfterViewInit {

  @ViewChild('sliderWrap', { static: true }) public sliderWrap: ElementRef;

  private width = 0;

  private height = 0;

  private svg: any;

  private sliderH = 32;

  public subject: Subject<string> = new Subject<string>();

  public option = {
    grid: {
      top: 0,
      left: 30,
      right: 30,
      bottom: 20
    },
    axis: {
      data: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00', '23:59']
    },
    series: [
      {
        name: 'aaaa',
        data: [
          {
            timeScope: ['2020/02/05 00:00', '2020/02/05 03:00'],
            color: 'red'
          },
          {
            timeScope: ['2020/02/05 03:00', '2020/02/05 12:00'],
            color: 'green'
          }
        ]
      },
      {
        name: 'bbbb',
        data: [
          {
            timeScope: ['2020/02/05 00:00', '2020/02/05 03:00'],
            color: 'red'
          },
          {
            timeScope: ['2020/02/05 03:00', '2020/02/05 13:00'],
            color: 'green'
          }
        ]
      },
      {
        name: 'cccc',
        data: [
          {
            timeScope: ['2020/02/05 00:00', '2020/02/05 03:00'],
            color: 'red'
          },
          {
            timeScope: ['2020/02/05 03:00', '2020/02/05 20:00'],
            color: 'green'
          }
        ]
      }
    ]
  };

  private scaleX: any;

  private scaleY: any;

  private margin: any;

  private erd: any;

  private isLoaded = false;

  private subscription: any;

  private transition:any;

  constructor() { }


  public ngOnDestroy() {
    this.erd.removeListener(this.sliderWrap.nativeElement, (element: any) => this.listener(element));
    this.subscription.unsubscribe();
  }

  ngOnInit() {
    this.transition = d3.transition().duration(300)
    this.subscription = this.subject.pipe(debounceTime(300)).subscribe(async (res: string) => this.resizeChart(res));
  }

  ngAfterViewInit() {
    const parentDom = this.sliderWrap.nativeElement;
    const wrapNode = d3.select(parentDom);
    this.width = Number.parseFloat(wrapNode.style('width'));
    this.height = Number.parseFloat(wrapNode.style('height'));
    this.svg = wrapNode.append('svg').attr('width', '100%').attr('height', '100%');
    this.margin = this.getChartMargin(this.option, this.width, this.height);
    this.listenResize(parentDom);
    this.drawAxisX();
    this.drawAxisY();
    this.drawSlider();
  }

  private sliderEnter(sliderEnter: any, radius: number, mainBarW: number) {
    const that = this;

    const sliderNode = sliderEnter.append('g')
      .attr('class', 'slide-g')
      .attr('transform', (d: any) => `translate(${this.margin.left},${this.scaleY(d.name) + this.scaleY.step() / 2 - radius})`)

    const clipPath = sliderNode.append('defs')
      .attr('class', 'clip-defs')
      .append('clipPath')
      .attr('stroke', 'blue')
      .attr('id', 'area-clip');

    // 创建滑尺
    clipPath.append('path')
      .attr('fill', '#d3d2d4')
      .attr('d', `
        M${radius},0
        A${radius},${radius} 0 0,0 ${radius},${radius * 2}
        L${mainBarW - radius},${radius * 2}
        A${radius},${radius} 0 0,0 ${mainBarW - radius},0
        Z
      `);

    sliderNode.append('rect')
      .attr('class', 'main-slider')
      .attr('width', mainBarW)
      .attr('height', this.sliderH)
      .attr('fill', '#d3d2d4')
      .attr('clip-path', 'url(#area-clip)')
    // 创建区域分段
    sliderNode.each(function (d: any) {
      const curNode = d3.select(this);
      that.drawPartSlider(curNode, d, mainBarW);
    });
  }

  private sliderUpdate(sliderUpdate: any, radius: number, mainBarW: number) {
    const that = this;
    sliderUpdate
      .attr('transform', (d: any) => `translate(${this.margin.left},${this.scaleY(d.name) + this.scaleY.step() / 2 - radius})`)
      .selectAll('.clip-defs path')
      .attr('d', `
        M${radius},0
        A${radius},${radius} 0 0,0 ${radius},${radius * 2}
        L${mainBarW - radius},${radius * 2}
        A${radius},${radius} 0 0,0 ${mainBarW - radius},0
        Z
      `)
    sliderUpdate.selectAll('.main-slider').attr('width', mainBarW);
    sliderUpdate.each(function (d: any) {
      const curNode = d3.select(this);
      that.drawPartSlider(curNode, d, mainBarW);
    })
  }

  // 创建滑尺
  private drawSlider() {
    const radius = this.sliderH / 2;
    const mainBarW = this.width - this.margin.left - this.margin.right;

    const sliderUpdate = this.svg.selectAll('.slide-g').data(this.option.series);
    this.sliderUpdate(sliderUpdate, radius, mainBarW)

    const sliderEnter = sliderUpdate.enter();
    this.sliderEnter(sliderEnter, radius, mainBarW);

    const sliderExit = sliderUpdate.exit();
    sliderExit.remove();
  }

  private partSliderEnter(partEnter: any) {
    const partNodes = partEnter.append('g')
      .attr('class', 'slider-part');

    partNodes.append('rect')
      .attr('class', 'slider-part-rect')
      .attr('x', (p: any) => this.scaleX(new Date(p.timeScope[0])) - this.margin.left)
      .attr('width', (p: any) => this.scaleX(new Date(p.timeScope[1])) - this.scaleX(new Date(p.timeScope[0])))
      .attr('height', this.sliderH)
      .attr('fill', (p: any) => p.color)
      .attr('clip-path', 'url(#area-clip)');

    partNodes.append('text')
      .attr('class', 'slider-part-text')
      .attr('fill', '#ffffff')
      .text((p: any) => {
        const time = new Date(p.timeScope[1]).getTime() - new Date(p.timeScope[0]).getTime();
        return (time / (24 * 60 * 60 * 10)).toFixed(1) + '%';
      })
      .attr('x', (p: any) => {
        const w = this.scaleX(new Date(p.timeScope[1])) - this.scaleX(new Date(p.timeScope[0]));
        return this.scaleX(new Date(p.timeScope[0])) - this.margin.left + w / 2;
      })
      .attr('y', this.sliderH / 2)
      .style('font-size', 12)
      .attr('dominant-baseline', 'middle')
      .attr('text-anchor', 'middle');
  }

  private partSliderUpdate(partUpdate: any) {
    partUpdate.selectAll('.slider-part-rect')
      .attr('x', (p: any) => this.scaleX(new Date(p.timeScope[0])) - this.margin.left)
      .attr('width', (p: any) => this.scaleX(new Date(p.timeScope[1])) - this.scaleX(new Date(p.timeScope[0])))
      .attr('height', this.sliderH)
      .attr('fill', (p: any) => p.color)
    partUpdate.selectAll('.slider-part-text')
      .attr('fill', '#ffffff')
      .text((p: any) => {
        const time = new Date(p.timeScope[1]).getTime() - new Date(p.timeScope[0]).getTime();
        return (time / (24 * 60 * 60 * 10)).toFixed(1) + '%';
      })
      .attr('x', (p: any) => {
        const w = this.scaleX(new Date(p.timeScope[1])) - this.scaleX(new Date(p.timeScope[0]));
        return this.scaleX(new Date(p.timeScope[0])) - this.margin.left + w / 2;
      })
      .attr('y', this.sliderH / 2)
  }

  private drawPartSlider(curNode: any, d: any, width: number) {
    const partUpdate = curNode.selectAll('.slider-part').data(d.data);
    this.partSliderUpdate(partUpdate);

    const partEnter = partUpdate.enter();
    this.partSliderEnter(partEnter);

    const partExit = partUpdate.exit();
    partExit.remove();
  }

  // 创建y轴比例尺
  private drawAxisY() {
    this.scaleY = d3.scaleBand()
      .domain(this.option.series.map((serie: any) => serie.name))
      .range([this.height - this.margin.bottom, this.margin.top]);
  }

  // 创建x轴比例尺
  private drawAxisX() {
    this.scaleX = d3.scaleTime().domain([new Date('2020/02/05'), new Date('2020/02/06')])
      .range([this.margin.left, this.width - this.margin.right]);

    const axisX = d3.axisBottom(this.scaleX);

    const axisXNode = this.svg
      .append('g')
      .attr('transform', `translate(${0},${this.height - this.margin.bottom})`)
      .attr('class', 'axis-x-g')
      .call((g: any) => {
        axisX.tickArguments([d3.timeHour.every(2)])
          .tickFormat(d3.timeFormat('%H:%M'))
          .tickSizeInner(0)(g);
        g.selectAll('.domain').attr('stroke', 'none');
      });
  }

  private async resizeChart(res: string) {
    const whs = res.split(',');
    this.width = Number.parseFloat(whs[0]);
    this.height = Number.parseFloat(whs[1]);
    this.margin = this.getChartMargin(this.option, this.width, this.height);
    this.scaleX.range([this.margin.left, this.width - this.margin.right]);
    const axisX = d3.axisBottom(this.scaleX);
    this.svg.selectAll('.axis-x-g')
      .attr('transform', `translate(${0},${this.height - this.margin.bottom})`)
      .call((g: any) => {
        axisX.tickArguments([d3.timeHour.every(2)])
          .tickFormat(d3.timeFormat('%H:%M'))
          .tickSizeInner(0)(g);
        g.selectAll('.domain').attr('stroke', 'none');
      });
    this.scaleY.range([this.height - this.margin.bottom, this.margin.top]);
    this.drawSlider();
  }

  private listenResize(dom: any) {
    this.erd = ERD();
    this.erd.listenTo(dom, (element: any) => this.listener(element));
  }

  private listener(element: any) {
    const w = element.offsetWidth;
    const h = element.offsetHeight;
    console.log(w, h);

    if (this.isLoaded) {
      this.subject.next(`${w},${h}`);
    }
    this.isLoaded = true;

  }

  public getChartMargin(option: any, width: number, height: number) {
    const gridLeft = option.grid && option.grid.left;
    const left = this.precentToNum(gridLeft, width);

    const gridRight = option.grid && option.grid.right;
    const right = this.precentToNum(gridRight, width);

    const gridBottom = option.grid && option.grid.bottom;
    const bottom = this.precentToNum(gridBottom, height);

    const gridTop = option.grid && option.grid.top;
    const top = this.precentToNum(gridTop, height);

    return { left, right, top, bottom };
  }

  public precentToNum(num: any, total?: number) {
    return typeof num === 'number' ?
      num : typeof num === 'string' ?
        num.indexOf('%') !== -1 ?
          total * Number.parseFloat(num) / 100 : num.indexOf('px') !== -1 ?
            Number.parseFloat(num) || 0 : 0 : 0;
  }

}
