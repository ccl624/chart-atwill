import { Component, OnInit, Input, Output, AfterViewInit, EventEmitter, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import * as d3 from 'd3';
import * as ERD from 'element-resize-detector';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'sf-progress',
  templateUrl: './sf-progress.component.html',
  styleUrls: ['./sf-progress.component.scss']
})
export class SfProgressComponent implements OnInit, AfterViewInit {

  @ViewChild('sfProgress') public sfProgress: ElementRef;

  @Input() precent = 90;

  @Input() unit = '利用率';

  @Input() color: any = {
    type: 'linear',
    x1: 1,
    x2: 0,
    y1: 0,
    y2: 0,
    colorStops: [
      {
        offset: 0, color: 'green', opacity: 1
      }, {
        offset: 1, color: 'red', opacity: 1
      }
    ]
  };

  private width = 0;

  private height = 0;

  private svg: any;

  private defs: any;

  private transition: any;

  constructor() { }

  ngOnInit() {
    this.transition = d3.transition().duration(1000 * this.precent / 100);
  }

  ngAfterViewInit() {
    const parentDom = this.sfProgress.nativeElement;
    const wrapNode = d3.select(parentDom);
    this.width = Number.parseFloat(wrapNode.style('width'));
    this.height = Number.parseFloat(wrapNode.style('height'));
    this.svg = wrapNode.append('svg').attr('width', '100%').attr('height', '100%');
    this.defs = this.svg.append('defs');

    if (typeof this.color !== 'string') {
      this.createLinearGradient('progressColor', this.color);
    }

    const r = Math.min(this.width, this.height) / 2 - 10;

    this.createProgressArc(r, 10);
  }

  private drawTitle(arcG: any) {
    arcG.append('text')
      .attr('class', 'precentage-text')
      .style('font-size', 12)
      .style('font-weight', '600')
      .attr('y', -8)
      .attr('dominant-baseline', 'middle')
      .attr('text-anchor', 'middle')
      .transition(this.transition)
      .textTween((d: any) => (t: number) => (this.precent * t).toFixed(1) + '%');

    arcG.append('text')
      .attr('class', 'unit')
      .style('font-size', 12)
      .attr('y', 8)
      .text(this.unit)
      .attr('dominant-baseline', 'middle')
      .attr('text-anchor', 'middle');
  }

  private createProgressArc(r: number, arcW: number) {
    const c = 2 * Math.PI * r;
    // console.log(c * this.precent / 100, r);

    const arcG = this.svg.append('g')
      .attr('class', 'arc-progress-g')
      .attr('transform', `translate(${this.width / 2},${this.height / 2})`);

    const backgroundArc = d3.arc()
      .innerRadius(r - arcW)
      .outerRadius(r)
      .startAngle(0)
      .endAngle(2 * Math.PI);

    const progressArc = d3.arc()
      .innerRadius(r - arcW)
      .outerRadius(r)
      .cornerRadius(arcW / 2)
      .startAngle(0)
      .endAngle(2 * Math.PI * this.precent / 100);

    const clipPath = arcG.append('clipPath').attr('stroke', 'blue').attr('id', 'area-clip' + this.precent);

    clipPath.append('path')
      .attr('fill', '#d3d2d4')
      .attr('stroke-width', 1)
      .transition(this.transition)
      .attrTween('d', (d: any) => (t: number) => progressArc.endAngle(2 * Math.PI * this.precent / 100 * t)());
    // .attr('d', progressArc);

    arcG.append('path')
      .attr('fill', '#dfe3f0')
      .attr('d', backgroundArc);

    const length = 40;

    let linear = d3.scaleLinear().domain([0, length]).range([0, 1])
    const compute = d3.interpolate('#29a3f4', '#1e66dd');
    // const color0 = compute(linear(0));
    // const color1 = compute(linear(1));
    // const color2 = compute(linear(2));
    // console.log(color0, color1, color2);


    arcG.selectAll('.precentage-path')
      .data(d3.range(length).map((d: number) => {
        const pre = 2 * Math.PI * this.precent / length / 100;
        return { startAngle: d * pre, endAngle: (d + 1) * pre }
      }))
      .enter()
      .append('path')
      .attr('clip-path', `url(#area-clip${this.precent})`)
      .attr('class', 'precentage-path')
      .attr('fill', (d: any, i: number) => compute(linear(i)))
      .attr('stroke', (d: any, i: number) => compute(linear(i)))
      .attr('stroke-width', 1)
      .attr('shape-rendering', 'crispEdges')
      .transition(this.transition)
      .attrTween('d', (d: any) => (t: number) => this.createArc(r, arcW, t * d.startAngle, t * d.endAngle)())

    this.drawTitle(arcG);
  }

  private createLinearColor(color1: string, color2: string, angle: number) {
    return {
      type: 'linear',
      x1: 0,
      x2: 1,
      y1: 0,
      y2: 1,
      colorStops: [
        {
          offset: 0, color: color1, opacity: 1
        }, {
          offset: 1, color: color2, opacity: 1
        }
      ]
    }
  }

  private createArc(r: number, w: number, startAngle: number, endAngle: number) {
    return d3.arc()
      .innerRadius(r - w)
      .outerRadius(r)
      .cornerRadius(0)
      .startAngle(startAngle)
      .endAngle(endAngle); //2 * Math.PI * this.precent / 100
  }

  private createLinearGradient(id: string, color: any) {
    const linearGradient = this.defs.append('linearGradient')
      .attr('id', id)
      .attr('x1', color.x1)
      .attr('y1', color.y1)
      .attr('x2', color.x2)
      .attr('y2', color.y2);

    color.colorStops.forEach((stop: any) => { // stop-opacity
      linearGradient.append('stop')
        .attr('offset', stop.offset)
        .attr('stop-opacity', stop.opacity)
        .style('stop-color', stop.color);
    });
  }

}
