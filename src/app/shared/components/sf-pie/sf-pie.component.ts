import { Component, OnInit, Input, Output, AfterViewInit, EventEmitter, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import * as d3 from 'd3';
import { SfPieOption } from './sf-pie.interface';
import { fromEvent, interval } from 'rxjs';
import { map, debounceTime, throttle } from 'rxjs/operators';
@Component({
  selector: 'sf-pie',
  templateUrl: './sf-pie.component.html',
  styleUrls: ['./sf-pie.component.scss']
})
export class SfPieComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('sfPieWrap') public sfPieWrap: ElementRef;

  @ViewChild('sfPieTootip') public sfPieTootip: ElementRef;

  @Input() public option: SfPieOption;

  @Output() public OnSelect = new EventEmitter<any>();

  @Output() public OnPieInit = new EventEmitter<any>();

  private id = '';

  private svgW = 0;

  private svgH = 0;

  private svg: any;

  private selectedRise = 8;

  private hoverRise = 10;

  private outerLabelG: any;

  private currentIndex = 1;

  private currentLefts: number[] = [0];

  private legendColors: string[] = [];

  private legendIndex = 0;

  private totalData: any[] = [];

  private isEdge = false;

  private resizeEvent: any;

  constructor() { }

  public ngOnDestroy() {
    this.resizeEvent.unsubscribe();
  }

  public ngOnInit() {
    const userAgent = navigator.userAgent; // 取得浏览器的userAgent字符串
    this.isEdge = userAgent.indexOf('Edge') > -1;

    const pieIntance: any = {
      initPie: this.initPie.bind(this)
    };
    this.OnPieInit.emit(pieIntance);
  }

  public ngAfterViewInit() {
    // 动态设置高度
    this.resizeEvent = fromEvent(window, 'resize')
      .pipe(debounceTime(100))
      .pipe(throttle((ev: any) => interval(100)))
      .subscribe(() => {
        this.initPie();
      });
  }

  private resetParams() {
    this.currentLefts = [0];
    this.totalData = [];
    this.legendColors = [];
    this.legendIndex = 0;
  }

  private initPie(isFirstLoad = true) {
    if (!this.option) { return; }
    this.id = this.option && this.option.id ? this.option.id + new Date().getTime() : new Date().getTime() + '';
    if (this.option && this.option.legend) {
      const windowW: number = window.document.body.clientWidth;
      const legendBottom: number = windowW < 1366 ? 48 : 55;
      this.option.legend.bottom = legendBottom;
    }
    this.resetParams();
    const wrapDom = this.sfPieWrap.nativeElement;
    const wrapNode = d3.select(wrapDom);
    const hasSvg = wrapNode.select('svg');
    if (hasSvg) {
      hasSvg.remove();
    }
    this.svgW = Number.parseFloat(wrapNode.style('width'));
    this.svgH = Number.parseFloat(wrapNode.style('height'));

    this.initSvg(wrapNode);
    this.legendColors = this.option.color
      || this.option.legend.data.map((dataItem: any, index: number) => d3.interpolateViridis(index / this.option.legend.data.length));
    this.drawPie(this.option.series);
    this.initLegend(this.option.legend);
    this.drawTitle();
  }

  private drawTitle() {
    if (this.option && this.option.title && this.option.title.show) {
      const title = this.option.title;
      const centerTextG = this.svg.append('g')
        .attr('id', 'centerTextG' + this.id)
        .attr('class', 'center-text-g')
        .style('pointer-events', 'none')
        .attr('transform', () => {
          if (title.position) {
            const centerX = this.setRatio(title.position[0]) * this.svgW;
            const centerY = this.setRatio(title.position[1]) * this.svgH;
            return `translate(${centerX},${centerY})`;
          }
          return `translate(${10},${10})`;
        });

      centerTextG.append('text')
        .attr('id', 'centerText' + this.id)
        .text(title.value)
        .style('font-size', '32px')
        .style('font-weight', '600')
        .attr('dominant-baseline', 'middle')
        .attr('text-anchor', 'middle')
        .attr('transform', `translate(0,${this.isEdge ? 16 : 0})`);
    }

  }

  private legendItem(legendWrap: any, data: any[]) {
    const legendItemWrap = legendWrap
      .append('g')
      .attr('class', 'legend-item-wrap')
      .attr('id', 'legendItemWrap' + this.id)
      .attr('transform', `translate(5, 14)`);

    const legendGnodes = legendItemWrap
      .selectAll('.legend-item-g')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'legend-item-g')
      .style('cursor', 'pointer')
      .attr('transform', (d: any, i: number) => {
        return `translate(${d.left},0)`;
      })
      .on('mouseenter', (d: any, index: number) => {
        const pieNode = d3.select('#pieG' + this.id + index);
        const pieData = this.totalData[index];
        if (!pieData.isInner) {
          const pieDom: any = pieNode.node();
          pieDom.parentNode.appendChild(pieNode.node());
        }
        const arcPathEnter = pieData.arcPathEnter;
        pieNode
          .select('.pie-path')
          .transition()
          .duration(300)
          .attr('d', arcPathEnter(pieData));
      })
      .on('mouseleave', (d: any, index: number) => {
        const pieSelection = d3.select('#pieG' + this.id + index);
        const pieNode: any = pieSelection.node();
        const pieData = this.totalData[index];
        if (!pieData.data.selected && !d.isLast) {
          pieNode.parentNode.insertBefore(pieNode, pieNode.parentNode.childNodes[pieData.index]);
        } else if (!pieData.data.selected && d.isLast) {
          pieNode.parentNode.insertBefore(pieNode, pieNode.parentNode.childNodes[pieData.index - 1]);
        }
        const arcPath = this.totalData[index].arcPath;
        pieSelection
          .select('.pie-path')
          .transition()
          .duration(300)
          .attr('d', arcPath(this.totalData[index]));
      });

    legendGnodes
      .append('rect')
      .attr('rx', 3)
      .attr('ry', 3)
      .attr('width', 24)
      .attr('height', 12)
      .attr('fill', (d: any, i: number) => this.legendColors[i]);

    legendGnodes
      .append('text')
      .text((d: any) => d.value)
      .attr('fill', (d: any, i: number) => this.legendColors[i])
      .attr('dominant-baseline', 'middle')
      .attr('text-anchor', 'start')
      .style('font-size', '12px')
      .attr('transform', `translate(${27},${this.isEdge ? 11 : 7})`); // 7 11
  }

  private activeBth(legendSwitchBtn: any, pageTotal: number) {
    legendSwitchBtn
      .select('.left-btn')
      .attr('fill', this.currentIndex === 1 ? '#ccc' : '#000000')
      .attr('cursor', this.currentIndex === 1 ? 'auto' : 'pointer');

    legendSwitchBtn
      .select('.right-btn')
      .attr('fill', this.currentIndex === pageTotal ? '#ccc' : '#000000')
      .attr('cursor', this.currentIndex === pageTotal ? 'auto' : 'pointer');

    legendSwitchBtn.select('.current-page-text').text(`${this.currentIndex}/${pageTotal}`);
  }

  private moveLegend() {
    d3.select('#legendItemWrap' + this.id)
      .transition()
      .duration(300)
      .attr('transform', `translate(${-this.currentLefts[this.currentIndex - 1] + 5}, 14)`);
  }

  private getBackgroundColor(node: any) {
    const color = d3.select(node).style('background-color');
    if (color === 'rgba(0, 0, 0, 0)') {
      return this.getBackgroundColor(node.parentNode);
    } else {
      return color;
    }
  }

  private drawSwitchBtn(legendWrap: any, data: any[]) {
    const that = this;
    const prePageWidth = this.svgW - 66;
    let pageTotal = 1;
    let startLeft = 0;
    data.forEach(item => {
      if (item.right - startLeft > prePageWidth) {
        pageTotal++;
        startLeft = item.left;
        that.currentLefts.push(startLeft);
      }
    });

    const legendSwitchBtn = legendWrap
      .append('g')
      .attr('class', 'legend-switch-btn')
      .attr('transform', `translate(${this.svgW - 66},0)`);

    legendSwitchBtn
      .append('rect')
      .attr('class', 'btn-cover')
      .attr('fill', this.getBackgroundColor(this.svg.node().parentNode))
      .attr('width', 66)
      .attr('height', 40);

    legendSwitchBtn
      .append('path')
      .attr('class', 'left-btn')
      .attr('d', `M10,0 L0,7 L10,14 Z`)
      .attr('fill', this.currentIndex === 1 ? '#ccc' : '#000000')
      .attr('transform', `translate(${5},13)`)
      .attr('cursor', this.currentIndex === 1 ? 'auto' : 'pointer')
      .on('click', () => {
        if (this.currentIndex !== 1) {
          this.currentIndex--;
          this.moveLegend();
        }
        this.activeBth(legendSwitchBtn, pageTotal);
      });

    legendSwitchBtn
      .append('path')
      .attr('class', 'right-btn')
      .attr('d', `M0,0 L10,7 L0,14 Z`)
      .attr('fill', this.currentIndex === pageTotal ? '#ccc' : '#000000')
      .attr('transform', `translate(${51},13)`)
      .attr('cursor', this.currentIndex === pageTotal ? 'auto' : 'pointer')
      .on('click', () => {
        if (this.currentIndex !== pageTotal) {
          this.currentIndex++;
          this.moveLegend();
        }
        this.activeBth(legendSwitchBtn, pageTotal);
      });

    legendSwitchBtn
      .append('text')
      .attr('class', 'current-page-text')
      .text(`${this.currentIndex}/${pageTotal}`)
      .style('font-size', '12px')
      .attr('dominant-baseline', 'middle')
      .attr('text-anchor', 'middle')
      .attr('transform', `translate(${33},${this.isEdge ? 24 : 21})`);
  }

  private initLegend(legend: any) {
    const data = legend.data.map((item: string) => ({ value: item, left: 0, right: 0 }));
    data.reduce((positionX: number, item: any) => {
      item.left = positionX;
      item.right = positionX + this.getTextWidth(item.value, 12) + 24;
      return item.right;
    }, 0);

    const legendWrap = this.svg.append('g')
      .attr('class', 'legend-wrap-g')
      .attr('transform', `translate(${0},${this.svgH - legend.bottom})`);

    this.legendItem(legendWrap, data);

    if (data[data.length - 1] && data[data.length - 1].right > this.svgW - 10) {
      this.drawSwitchBtn(legendWrap, data);
    }
  }

  private initSvg(dom: any) {
    this.svg = dom
      .append('svg')
      .attr('class', 'sf-pie-chart')
      .attr('viewBox', `0 0 ${this.svgW} ${this.svgH}`)
      .attr('width', '100%')
      .attr('height', '100%');
  }

  private getPieParams(seriesItem: any) {
    const rMax = Math.min(this.svgW, this.svgH);
    const startR = (this.setRatio(seriesItem.radius[0]) * rMax) / 2;
    const endR = (this.setRatio(seriesItem.radius[1]) * rMax) / 2;
    const centerX = this.setRatio(seriesItem.center[0]) * this.svgW;
    const centerY = this.setRatio(seriesItem.center[1]) * this.svgH;
    const centerR = startR + (endR - startR) / 2;
    return { rMax, startR, endR, centerX, centerY, centerR };
  }

  // 创建饼图生成器
  private initArcPath(pieParams: any, seriesItem: any, rise = 0) {
    return d3
      .arc()
      .innerRadius(pieParams.startR) // 内环半径
      .outerRadius(pieParams.endR + rise) // 外环半径
      .padAngle(seriesItem.padAngle || 0) // 饼图间隔
      .cornerRadius(seriesItem.cornerRadius || 0); // 饼图圆角
  }

  // 初始化饼图数据
  private initPieData(seriesItem: any, pieParams: any) {
    return d3
      .pie()
      .sort(null)
      .value((d: any) => d.value)(seriesItem.data)
      .map((d: any, index: number) => {
        d.pieIndex = this.legendIndex;
        d.index = index;
        d.total = seriesItem.data.length;
        d.color = this.legendColors[this.legendIndex];
        d.width = this.getTextWidth(d.data.name, 12);
        d.id = this.id + this.legendIndex;
        d.arc = d.startAngle + (d.endAngle - d.startAngle) / 2;
        d.my = -Math.cos(d.arc) * pieParams.centerR;
        d.mx = Math.sin(d.arc) * pieParams.centerR;
        d.cx = d.mx + pieParams.centerX;
        d.cy = d.my + pieParams.centerY;
        d.arcPath = this.initArcPath(pieParams, seriesItem);
        d.arcPathEnter = this.initArcPath(pieParams, seriesItem, this.hoverRise);
        d.isLast = index === d.total - 1;
        d.isInner = seriesItem.label.position === 'inner';
        this.legendIndex++;
        this.totalData.push(d);
        return d;
      });
  }

  private updateTitle(value: string) {
    if (this.option.title && this.option.title.show) {
      this.option.title.value = value;
      d3.select(`#centerText${this.id}`).text(this.option.title.value);
    }
  }

  // 添加鼠标事件
  private addMouseEvent(nodes: any, centerX: number, centerY: number, isInnerLabel: boolean) {
    const that = this;
    nodes
      .on('mouseenter', function (d: any, index: number) {
        if (!isInnerLabel) {
          this.parentNode.appendChild(this);
        }
        d3.select(this)
          .select('.pie-path')
          .transition()
          .duration(300)
          .attr('d', d.arcPathEnter(d));

        that.updateTitle(`${d.data.percent}%`);
      })
      .on('mouseleave', function (d: any, index: number) {
        if (!d.data.selected && index !== nodes.nodes().length - 1) {
          this.parentNode.insertBefore(this, this.parentNode.childNodes[index]);
        } else if (!d.data.selected && index === nodes.nodes().length - 1) {
          this.parentNode.insertBefore(this, this.parentNode.childNodes[index - 1]);
        }

        d3.select(this)
          .select('.pie-path')
          .transition()
          .duration(300)
          .attr('d', d.arcPath(d));

        d3.select(that.sfPieTootip.nativeElement).style('opacity', '0');
        that.updateTitle('');
      })
      .on('click', function (d: any, index: number) {
        nodes.each((d1: any) => (d1.data.selected = false));
        d.data.selected = true;
        const dx = Math.sin(d.arc) * that.selectedRise;
        const dy = -Math.cos(d.arc) * that.selectedRise;
        d3.selectAll('.pieG' + that.id)
          .transition()
          .duration(300)
          .attr('transform', `translate(${centerX},${centerY})`);
        d3.select(this)
          .transition()
          .duration(300)
          .attr('transform', `translate(${centerX + dx},${centerY + dy})`);
        d3.selectAll('.pie-label-g' + that.id)
          .transition()
          .duration(300)
          .attr('transform', `translate(${centerX},${centerY})`);

        if (!isInnerLabel) {
          this.parentNode.appendChild(this);
        } else {
          const pieLabelGnodes = d3.select(this.parentNode).selectAll('.pie-label-g' + that.id);
          pieLabelGnodes
            .transition()
            .duration(300)
            .attr('transform', `translate(${centerX},${centerY})`);
          d3.select(pieLabelGnodes.nodes()[index])
            .transition()
            .duration(300)
            .attr('transform', `translate(${centerX + dx},${centerY + dy})`);
        }

        that.OnSelect.emit(d.data);
      })
      .on('mousemove', (d: any) => {
        const event = d3.event;
        const tootip = d3.select(this.sfPieTootip.nativeElement);

        tootip.text(`${d.data.name}：${d.data.value}`);
        if (
          this.option
          && this.option.tooltip
          && this.option.tooltip.formatter
          && Object.prototype.toString.call(this.option.tooltip.formatter) === '[object Function]'
        ) {
          tootip.html(this.option.tooltip.formatter(d.data));
        }
        tootip.style('font-size', '12px')
          .style('white-space', 'nowrap')
          .style('opacity', '1'); // font-size:12px;white-space:nowrap;opacity:1
        let x = event.clientX;
        let y = event.clientY;
        const totalW = window.innerWidth;
        const totalH = window.innerHeight;
        const tootipW = Number.parseFloat(tootip.style('width'));
        const tootipH = Number.parseFloat(tootip.style('height'));

        if (x + tootipW + 20 > totalW) {
          x = totalW - tootipW - 20;
        }

        if (y + tootipH + 20 > totalH) {
          y = totalH - tootipH - 20;
        }

        tootip.style('top', `${y + 20}px`).style('left', `${x + 20}px`); // top:${y + 20}px;left:${x + 20}px;
      });
  }

  private drawOuterLable(pieNodes: any, pieParams: any, seriesItem: any) {
    const borderRadius = (seriesItem.label && seriesItem.label.borderRadius) || 3;
    const borderColor = (seriesItem.label && seriesItem.label.borderColor) || 'none';
    const height = (seriesItem.label && seriesItem.label.height) || 24;
    const width = seriesItem.label && seriesItem.label.width;
    const isShow = seriesItem.label && seriesItem.label.show;
    const borderWidth = (seriesItem.label && seriesItem.label.borderWidth) || 1;
    const background = (seriesItem.label && seriesItem.label.background) || 'none';

    this.outerLabelG = pieNodes.append('g').attr('class', 'outer-label-g');
    this.outerLabelG
      .append('path')
      .attr('class', 'label-point-line')
      .attr('stroke', (d: any, index: number) => (!isShow ? 'none' : d.color))
      .attr('stroke-width', 1)
      .attr('fill', 'none');

    this.outerLabelG
      .append('rect')
      .attr('class', 'outer-label-rect')
      .attr('rx', borderRadius)
      .attr('ry', borderRadius)
      .attr('width', (d: any) => width || d.width)
      .attr('height', height)
      .attr('stroke', borderColor)
      .attr('stroke-width', borderWidth)
      .attr('fill', background);

    this.outerLabelG
      .append('text')
      .attr('class', 'outer-label-text')
      .text((d: any) => d.data.name)
      .attr('fill', (d: any, index: number) => (!isShow ? 'none' : d.color))
      .attr('dominant-baseline', 'middle')
      .attr('text-anchor', (d: any) => (Math.sin(d.arc) > 0 ? 'start' : 'end'))
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .attr('y', this.isEdge ? 4 : 0);  // 0 4
  }

  // 画饼图
  private drawPiePath(wrapNode: any, pieData: any[], seriesItem: any, pieParams: any) {
    const isInnerLabel = seriesItem.label && seriesItem.label.position === 'inner';
    const centerX = pieParams.centerX;
    const centerY = pieParams.centerY;

    const pieNodes = wrapNode
      .selectAll('.pieG' + this.id)
      .data(pieData)
      .enter()
      .append('g')
      .attr('class', 'pieG' + this.id)
      .attr('id', (d: any) => 'pieG' + d.id)
      .attr('transform', (d: any) => {
        const dx = Math.sin(d.arc) * this.selectedRise;
        const dy = -Math.cos(d.arc) * this.selectedRise;
        return `translate(${centerX + (d.data.selected ? dx : 0)},${centerY + (d.data.selected ? dy : 0)})`;
      });

    this.addMouseEvent(pieNodes, centerX, centerY, isInnerLabel);

    if (!isInnerLabel) {
      this.drawOuterLable(pieNodes, pieParams, seriesItem);
    }

    pieNodes
      .append('path')
      .attr('class', 'pie-path')
      .attr('fill', 'none')
      .attr('stroke', seriesItem.borderColor || '#ffffff')
      .attr('stroke-width', seriesItem.borderWidth || 0)
      .attr('style', 'cursor:pointer')
      .transition()
      .duration(500)
      .attrTween('d', (d: any) => (t: number) => d.arcPath({ startAngle: d.startAngle * t, endAngle: d.endAngle * t }))
      .attr('fill', (d: any) => d.color);
  }

  // 画label
  private drawInnerLabel(wrapNode: any, pieData: any[], pieParams: any, seriesItem: any) {
    const centerX = pieParams.centerX;
    const centerY = pieParams.centerY;
    const textNodes = wrapNode
      .selectAll('.pie-label-g' + this.id)
      .data(pieData)
      .enter()
      .append('g')
      .attr('class', 'pie-label-g' + this.id)
      .attr('id', (d: any) => 'pieLabel' + d.id)
      .attr('transform', (d: any) => {
        const dx = Math.sin(d.arc) * this.selectedRise;
        const dy = -Math.cos(d.arc) * this.selectedRise;
        return `translate(${centerX + (d.data.selected ? dx : 0)},${centerY + (d.data.selected ? dy : 0)})`;
      });

    textNodes
      .append('text')
      .attr('class', 'pie-label')
      .text((d: any) => d.data.name)
      .attr('fill', (d: any, index: number) => (seriesItem.label && seriesItem.label.show === false ? 'none' : '#fff'))
      .attr('dominant-baseline', 'middle')
      .attr('text-anchor', 'middle')
      .style('font-size', 12)
      .style('pointer-events', 'none')
      .attr('transform', (d: any) => `translate(${d.mx},${d.my})`);
  }

  private drawPie(data: any[]) {
    const that = this;
    const dataIndex = 0;
    this.svg
      .append('g')
      .attr('class', 'main-pies-wrap')
      .selectAll('.pieGwrap')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'pieGwrap')
      .each(function (d: any) {
        const nodeG = d3.select(this);
        const pieParams = that.getPieParams(d);
        const pieData = that.initPieData(d, pieParams);
        that.drawPiePath(nodeG, pieData, d, pieParams);
        if (d.label.position === 'inner') {
          that.drawInnerLabel(nodeG, pieData, pieParams, d);
        } else {
          that.createForceSimulation(pieData, pieParams, d);
        }
      });
  }

  private getTarY(curNode: any, index: number, nodes: any[], r: number, isBottomHalf: boolean) {
    const dy = 14;
    const preY = index === 0 ? 0 : nodes[index - 1].tarY;
    let y = - Math.cos(curNode.arc) * r;
    let disY = y - preY;
    if (disY < 0 && isBottomHalf) {
      y = preY;
      disY = 0;
    }

    if (disY > 0 && !isBottomHalf) {
      y = preY;
      disY = 0;
    }

    curNode.tarY = Math.abs(disY) < dy ? y - (isBottomHalf ? 1 : -1) * (Math.abs(disY) - dy) : y;
  }

  private getTarX(node: any, index: number, nodes: any[], pieR: number) {
    const dy = 14;
    let disY = 0;
    const y = node.tarY;
    let preY = 0;

    const x = Math.sin(node.arc) * pieR;
    let tarX = x;
    let preX = 0;
    if (index !== 0) {
      const preNode = nodes[index - 1];
      preX = Math.sin(preNode.arc) * pieR;
      preY = preNode.tarY;
      disY = y - preY;

      if (Math.abs(disY) < dy && node.arc < Math.PI) {
        const dTarX = Math.pow(preX, 2) - 2 * dy * preY + Math.pow(dy, 2);
        if (dTarX >= 0) {
          tarX = Math.sqrt(dTarX);
        }
      } else if (Math.abs(disY) < dy && node.arc > Math.PI) {
        const dTarX = Math.pow(preX, 2) + 2 * dy * preY + Math.pow(dy, 2);
        if (dTarX >= 0) {
          tarX = -Math.sqrt(dTarX);
        }
      }
    }
    return tarX;
  }

  private createForceSimulation(nodes: any[], pieParams: any, seriesItem: any) {
    const height = (seriesItem.label && seriesItem.label.height) || 24;
    const width = seriesItem.label && seriesItem.label.width;
    const pieR = pieParams.endR + 20;
    const pi = Math.PI;
    const lessHalfPi: any[] = []; // 0-pi/2
    const lessPi: any[] = [];  // pi/2 - pi
    const lessOneHalfPi: any[] = []; // pi - 3/2 * pi
    const lessDoublePi: any[] = []; // 3/2 * pi - 2*pi

    nodes.forEach(node => {
      if (node.arc > 0 && node.arc <= pi / 2) {
        lessHalfPi.push(node);
      } else if (node.arc > pi / 2 && node.arc <= pi) {
        lessPi.push(node);
      } else if (node.arc > pi && node.arc <= 3 / 2 * pi) {
        lessOneHalfPi.push(node);
      } else if (node.arc > 3 / 2 * pi && node.arc <= 2 * pi) {
        lessDoublePi.push(node);
      }
    });

    lessHalfPi.reverse();
    lessOneHalfPi.reverse();
    lessHalfPi.forEach((node, index) => this.getTarY(node, index, lessHalfPi, pieR, false));
    lessPi.forEach((node, index) => this.getTarY(node, index, lessPi, pieR, true));
    lessOneHalfPi.forEach((node, index) => this.getTarY(node, index, lessOneHalfPi, pieR, true));
    lessDoublePi.forEach((node, index) => this.getTarY(node, index, lessDoublePi, pieR, false));

    const forceY = d3.forceY((d: any) => d.tarY);
    const forceX = d3.forceX((d: any, index) => this.getTarX(d, index, nodes, pieR));

    d3.forceSimulation(nodes)
      .force('x', forceX)
      .force('y', forceY)
      .on('tick', () => {
        this.outerLabelG.selectAll('.label-point-line').attr('d', (d: any) => {
          const borderCenterX = Math.sin(d.arc) * pieParams.endR;
          const borderCenterY = -Math.cos(d.arc) * pieParams.endR;
          const disX = Math.sin(d.arc) > 0 ? 1 : -1;
          return `M${borderCenterX},${borderCenterY} L${d.x},${d.y} L${d.x + disX * 20},${d.y}`;
        });

        this.outerLabelG.selectAll('.outer-label-rect').attr('transform', (d: any) => {
          const rectW = width || d.width;
          const disX = Math.sin(d.arc) > 0 ? 20 : -rectW - 20;
          return `translate(${d.x + disX},${d.y - height / 2 - 1})`;
        });

        this.outerLabelG.selectAll('.outer-label-text').attr('transform', (d: any) => {
          const disX = Math.sin(d.arc) > 0 ? 25 : -25;
          return `translate(${d.x + disX},${d.y})`;
        });
      });
  }

  private setRatio(ratio: any) {
    if (typeof ratio === 'number') {
      return ratio / 100;
    } else if (typeof ratio === 'string') {
      const tarValue = Number.parseFloat(ratio);
      return Number.isNaN(tarValue) ? 0 : tarValue / 100;
    } else {
      return 0;
    }
  }

  private getTextWidth(str: string, fontSize = 14) {
    const span = d3
      .select('body')
      .append('span')
      .style('display', 'inline-block')
      .style('font-size', fontSize + 'px')
      .text(str);
    const spanWidth = Number.parseFloat(span.style('width')) + 10; // 10
    span.remove();
    return spanWidth;
  }
}
