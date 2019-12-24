import { Component, OnInit, Input, Output, AfterViewInit, OnChanges, SimpleChanges, EventEmitter } from '@angular/core';
import * as d3 from 'd3';
import { fromEvent } from 'rxjs';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'sf-pie',
  templateUrl: './sf-pie.component.html',
  styleUrls: ['./sf-pie.component.scss']
})
export class SfPieComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() public option: any;

  @Output() public OnSelect = new EventEmitter<any>();

  @Output() public OnPieInit = new EventEmitter<any>();

  public subjet: Subject<string> = new Subject<string>();

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

  constructor() { }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.hasOwnProperty('option') && this.option && this.option.id) {
      this.id = this.option && this.option.id ? this.option.id + new Date().getTime() : new Date().getTime();
    }
  }

  public ngOnInit() {
    const pieIntance: any = {
      initPie: this.initPie.bind(this)
    };
    this.OnPieInit.emit(pieIntance);
  }

  public ngAfterViewInit() {
    fromEvent(window, 'resize').subscribe((e: MouseEvent) => {
      window.requestAnimationFrame(() => {
        this.initPie(false);
      });
    });
  }

  private resetParams() {
    this.currentLefts = [0];
    this.totalData = [];
    this.legendColors = [];
    this.legendIndex = 0;
  }

  private initPie(isFirstLoad = true) {
    if (this.option && this.option.legend) {
      const windowW: number = window.document.body.clientWidth;
      const legendBottom: number = windowW < 1366 ? 48 : 55;
      this.option.legend.bottom = legendBottom;
    }
    this.resetParams();
    const wrapDom = d3.select('#' + this.id);
    const hasSvg = wrapDom.select('svg');
    if (hasSvg) {
      hasSvg.remove();
    }
    this.svgW = Number.parseFloat(wrapDom.style('width'));
    this.svgH = Number.parseFloat(wrapDom.style('height'));

    this.initSvg(wrapDom);
    this.drawTitle();
    this.legendColors = this.option.color
      || this.option.legend.data.map((dataItem: any, index: number) => d3.interpolateViridis(index / this.option.legend.data.length));
    this.drawPie(this.option.series);
    this.initLegend(this.option.legend);
  }

  private drawTitle() {
    if (this.option && this.option.title && this.option.title.show) {
      const title = this.option.title;
      const centerTextG = this.svg.append('g')
        .attr('id', 'centerTextG' + this.id)
        .attr('class', 'center-text-g')
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
        .attr('text-anchor', 'middle');
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
      .attr('transform', `translate(${27},7)`);
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
      .attr('fill', '#ffffff')
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
      .attr('transform', `translate(${33},21)`);
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

    if (data[data.length - 1].right > this.svgW - 10) {
      this.drawSwitchBtn(legendWrap, data);
    }
  }

  private initSvg(dom: any) {
    this.svg = dom
      .append('svg')
      .attr('class', 'sf-pie-chart')
      .attr('width', this.svgW)
      .attr('height', this.svgH);
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

        d3.select(`#tooltip${that.id}`).style('opacity', '0');
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
        const tootip = d3.select(`#tooltip${this.id}`);
        tootip.style('opacity', '1').text(`${d.data.name}：${d.data.value}`);
        const tooltipW = Number.parseFloat(tootip.style('width'));
        const tooltipH = Number.parseFloat(tootip.style('height'));
        tootip
          .style('top', (event.offsetY + tooltipH + 20 > this.svgH ? this.svgH - tooltipH : event.offsetY + 20) + 'px')
          .style('left', (event.offsetX + tooltipW + 20 > this.svgW ? this.svgW - tooltipW : event.offsetX + 20) + 'px');

        if (
          this.option
          && this.option.tooltip
          && this.option.tooltip.formatter
          && Object.prototype.toString.call(this.option.tooltip.formatter) === '[object Function]'
        ) {
          tootip.html(this.option.tooltip.formatter(d.data));
        }
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
      .style('font-size', 12)
      .style('pointer-events', 'none');
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
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 0)
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

  private getY(d: any, pieParams: any) {
    return d.tarY || - Math.cos(d.arc) * (pieParams.endR + 20);
  }

  private getX(d: any, pieParams: any) {
    return Math.sin(d.arc) * (pieParams.endR + 20);
  }

  private createForceSimulation(nodes: any[], pieParams: any, seriesItem: any) {
    const height = (seriesItem.label && seriesItem.label.height) || 24;
    const width = seriesItem.label && seriesItem.label.width;
    const dy = 14;
    // const forceLink = d3.forceCollide(10);
    const forceY = d3.forceY((d: any, index) => {
      let disY = 0;
      let y = this.getY(d, pieParams);
      let tarY = y;
      let preY = 0;
      if (index !== 0) {
        // console.log(nodes[index - 1].y, d.y);
        preY = this.getY(nodes[index - 1], pieParams);
        disY = y - preY;

        const preArc = nodes[index - 1].arc;
        const curArc = d.arc;
        if (preArc < Math.PI && curArc > Math.PI) {
          preY = - Math.cos(d.arc) * (pieParams.endR + 20);
        }

        if (d.arc < Math.PI) {
          if (disY < 0) {
            y = preY;
            disY = 0;
          }
          if (Math.abs(disY) < 14) {
            tarY = y + 14 - Math.abs(disY);
          }
        } else if (d.arc >= Math.PI) {
          if (disY > 0) {
            y = preY;
            disY = 0;
          }
          if (Math.abs(disY) < 14) {
            tarY = y - 14 + Math.abs(disY);
          }
        }
      }
      // console.log(d.tarY, index);

      d.tarY = tarY;

      return tarY;
    });
    const forceX = d3.forceX((d: any, index) => {
      let disY = 0;
      const y = this.getY(d, pieParams);
      let tarY = y;
      let preY = 0;

      const x = this.getX(d, pieParams);
      let tarX = x;
      let preX = 0;
      if (index !== 0) {
        // console.log(nodes[index - 1].y, d.y);
        preX = this.getX(nodes[index - 1], pieParams);
        preY = this.getY(nodes[index - 1], pieParams);
        disY = y - preY;
        tarY = Math.abs(disY) < 14 ? y + disY : y;

        if (Math.abs(disY) < 14 && d.arc < Math.PI) {
          const dTarX = Math.pow(preX, 2) - 2 * dy * preY + Math.pow(dy, 2);
          if (dTarX >= 0) {
            tarX = Math.sqrt(dTarX);
          }
        } else if (Math.abs(disY) < 14 && d.arc > Math.PI) {
          const dTarX = Math.pow(preX, 2) + 2 * dy * preY + Math.pow(dy, 2);
          if (dTarX >= 0) {
            tarX = -Math.sqrt(dTarX);
          }
        }
      }
      return tarX;
    });

    d3.forceSimulation(nodes)
      // .force('link', forceLink)
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
    const spanWidth = Number.parseFloat(span.style('width')) + 10;
    span.remove();
    return spanWidth;
  }
}
