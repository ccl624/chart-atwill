import { Component, OnInit, AfterViewInit, Input, Output, EventEmitter, TemplateRef } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-guage',
  templateUrl: './app-guage.component.html',
  styleUrls: ['./app-guage.component.scss'],
})

export class AppGuageComponent implements OnInit, AfterViewInit {
  private svg: any;
  private svgH = 0;
  private svgW = 0;
  private center: any = { x: 0, y: 0 };
  public value = 24;
  @Input()
  get sfValue(): number {
    return this.value;
  }
  set sfValue(value: number) {
    this.value = value;
  }
  private valueText: any;
  private defaultColor: any = {
    type: 'linear',
    x1: 0,
    y1: 0,
    x2: 1,
    y2: 0,
    colorStops: [
      { offset: 0, color: '#3c72d2' },
      { offset: 1, color: '#e46c75' }
    ]
  };
  @Input() public option: any = {
    id: 'guage',
    max: 100,
    min: 0,
    currentVal: 66,
    guageAngle: Math.PI * 3 / 2,
    interval: 10,
    showSides: false,
    unit: 'm/s',
    showInput: true,
    fixed: 0,
    ply: 30
  };
  private pointer: any;
  private pointerR = 0;
  public errText = '';
  constructor() { }

  public ngOnInit() {
    this.option.currentVal = this.value;
  }

  public inputBlurEvent(event: any) {
    // console.log(event);
    if (this.value > this.option.max || this.value < this.option.min) {
      this.errText = '超出最大范围';
      this.value = this.option.currentVal;
    } else {
      this.option.currentVal = this.value;
    }
    this.updateGuage();
  }

  public optionBtn(p: number) {
    this.value += p / Math.pow(10, this.option.fixed || 0);
    this.value = +this.value.toFixed(this.option.fixed);
    if (this.value > this.option.max || this.value < this.option.min) {
      this.value = this.option.currentVal;
      this.errText = p === 1 ? '已经达到最大值' : '已经达到最小值';
    } else {
      this.option.currentVal = this.value;
    }

    this.updateGuage();
  }

  private updateGuage() {
    this.updateValue();
    const arc = this.translateValueToArc(this.value);
    this.movePointer(arc, this.pointerR, this.pointer);
  }

  public ngAfterViewInit() {
    this.initSvg();
    const defs = this.svg.append('defs');
    const color = this.option.color || this.defaultColor;
    this.createLinearGradient(defs, 'guageDialLinear', color);
    const r = Math.min(this.svgH, this.svgW) / 2 * 0.8;
    const ply = this.option.ply;
    this.pointerR = r - ply / 2;
    this.drawDial(r, ply);
    // 画刻度
    this.drawScale(r, ply);
    this.valueText = this.drawValue();
    const tarArc = this.translateValueToArc(this.option.currentVal || this.option.min);
    this.pointer = this.drawPointer(tarArc, this.pointerR);
    this.pointerDrag(this.pointer, this.pointerR);
  }

  private drawValue() {
    const valueText = this.svg.append('g')
      .attr('class', 'gValue')
      .attr('transform', `translate(${this.svgW / 2},${this.svgH / 2})`)
      .append('text')
      .text(this.value + (this.option.unit || ''))
      .attr('dominant-baseline', 'middle')
      .attr('text-anchor', 'middle')
      .style('font-size', 30)
      .style('stroke', '#333f4c')
      .style('stroke-width', 2);

    return valueText;
  }

  private updateValue() {
    this.valueText.text(this.value + (this.option.unit || ''));
  }

  private translateValueToArc(value: number) {
    return -this.option.guageAngle / 2 + this.option.guageAngle * (value - this.option.min) / (this.option.max - this.option.min);
  }

  private translateArcToValue(arc: number) {
    return this.option.min + ((arc + this.option.guageAngle / 2) / this.option.guageAngle) * (this.option.max - this.option.min);
  }

  private pointerDrag(pointer: any, pointerR: number) {
    const drag = d3.drag();

    drag.on('drag', () => {
      const event = d3.event.sourceEvent;
      const disP = {
        x: event.pageX - this.center.x,
        y: event.pageY - this.center.y
      };
      let arc = this.getTarAngle(disP.x, disP.y);
      if (arc > this.option.guageAngle / 2) {
        arc = this.option.guageAngle / 2;
      }
      if (arc < -this.option.guageAngle / 2) {
        arc = -this.option.guageAngle / 2;
      }
      this.value = +this.translateArcToValue(arc).toFixed(this.option.fixed);
      this.movePointer(arc, pointerR, pointer);
      this.updateValue();
    });

    pointer.call(drag);
  }

  private getTarAngle(x: number, y: number) {
    const pi = Math.PI;

    if (x > 0 && y > 0) {
      return pi / 2 + Math.asin(y / Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)));
    }

    if (x < 0 && y > 0) {
      return -pi / 2 - Math.asin(y / Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)));
    }

    return Math.asin(x / Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)));
  }

  private movePointer(arc: number, r: number, pointer: any) {
    const dx = Math.sin(arc) * r;
    const dy = -Math.cos(arc) * r;
    pointer.attr('transform', `translate(${this.svgW / 2 + dx},${this.svgH / 2 + dy}) rotate(${arc / Math.PI * 180})`);
  }

  private drawPointer(arc: number, r: number) {
    const dx = Math.sin(arc) * r;
    const dy = -Math.cos(arc) * r;
    const ply = this.option.ply;
    const gPointer = this.svg.append('g')
      .attr('class', 'g-pointer')
      .style('cursor', 'pointer')
      .attr('transform', `translate(${this.svgW / 2 + dx},${this.svgH / 2 + dy}) rotate(${arc / Math.PI * 180})`);


    gPointer.append('path')
      .attr('d', `M0,0 L6,0 L3,8 Z`)
      .attr('fill', '#2272e0')
      .attr('transform', `translate(-3,${ply / 2})`);

    gPointer.append('path')
      .attr('d', `M0,-5 L6,-5 L6,5 L0,5 Z`)
      .attr('fill', 'rgba(255,255,255,0)')
      .attr('transform', `translate(-3,0)`);

    gPointer.append('path')
      .attr('d', `M0,0 L6,0 L3,-8 Z`)
      .attr('fill', '#2272e0')
      .attr('transform', `translate(-3,${-ply / 2})`);

    return gPointer;
  }

  private drawScale(r: number, ply: number) {
    const data: any[] = [];
    const dataLength = (this.option.max - this.option.min) / this.option.interval + 1;
    for (let index = 0; index < dataLength; index++) {
      data.push(this.option.min + index * this.option.interval);
    }
    const totalArc = this.option.guageAngle;
    const preArc = totalArc / (data.length - 1);

    const scaleData = data.map((item, i) => {
      const startAngle = i * preArc + (-totalArc / 2);
      const disAngle = Math.PI / 72;
      const middleAngle = startAngle + disAngle / 2;
      const textR = r - 5 + 15;
      return {
        value: item,
        startAngle,
        endAngle: startAngle + Math.PI / 72,
        middleAngle,
        textX: Math.sin(middleAngle) * textR,
        textY: -Math.cos(middleAngle) * textR
      };
    });

    const guageScaleNode = this.svg.selectAll('guage-scale-g')
      .data(scaleData)
      .enter()
      .append('g')
      .attr('class', 'guage-scale-g')
      .attr('transform', `translate(${this.svgW / 2},${this.svgH / 2})`);

    guageScaleNode.append('path')
      .attr('d', (d: any, i: number) => {
        const arc = d3.arc()
          .innerRadius(r - ply)
          .outerRadius(r)
          .startAngle(d.startAngle)
          .endAngle(d.endAngle);
        return arc(null);
      })
      .attr('fill', (d: any, i: number) => {
        return i === 0 || i === dataLength - 1 ? 'none' : '#fff';
      });

    guageScaleNode.append('text')
      .text((d: any, i: number) => {
        if (this.option.showUnit) {
          return (this.option.showSides ? d.value : i === 0 || i === dataLength - 1 ? '' : d.value) + this.option.unit;
        }
        return this.option.showSides ? d.value : i === 0 || i === dataLength - 1 ? '' : d.value;
      })
      .attr('x', (d: any) => d.textX)
      .attr('y', (d: any) => d.textY)
      .attr('dominant-baseline', 'middle')
      .attr('text-anchor', (d: any, i: number) => {
        if (i + 1 === (data.length + 1) / 2) {
          return 'middle';
        }
        return d.textX > 0 ? 'start' : 'end';
      })
      .style('font-size', 14)
      .style('stroke', '#666');
  }

  private drawDial(r: number, ply: number) {
    const arc = d3.arc()
      .innerRadius(r - ply)
      .outerRadius(r)
      .startAngle(-this.option.guageAngle / 2)
      .endAngle(this.option.guageAngle / 2)
      .cornerRadius(ply / 2);


    this.svg.append('g')
      .attr('class', 'guage-dial')
      .attr('transform', `translate(${this.svgW / 2},${this.svgH / 2})`)
      .append('path')
      .attr('d', (d: any) => {
        return arc(d);
      })
      .attr('fill', `url(#guageDialLinear)`);
  }

  private initSvg() {
    const guageDom = d3.select(`#${this.option.id}`);
    this.svgH = Number.parseFloat(guageDom.style('height'));
    this.svgW = Number.parseFloat(guageDom.style('width'));
    setTimeout(() => {
      const dom: any = guageDom.node();
      const domConfig = dom.getBoundingClientRect();
      this.center.x = domConfig.left + this.svgW / 2;
      this.center.y = domConfig.top + this.svgH / 2;
    }, 200);

    this.svg = guageDom.append('svg')
      .attr('class', 'app-guage-svg')
      .attr('width', this.svgW)
      .attr('height', this.svgH);
  }

  private createLinearGradient(defs: any, id: string, color: any) {
    const linearGradient = defs.append('linearGradient')
      .attr('id', id)
      .attr('x1', color.x1)
      .attr('y1', color.y1)
      .attr('x2', color.x2)
      .attr('y2', color.y2);

    color.colorStops.forEach((colorStop: any) => {
      linearGradient.append('stop')
        .attr('offset', colorStop.offset)
        .style('stop-color', colorStop.color);
    });
  }
}
