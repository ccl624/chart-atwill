import { Component, OnInit, Input, AfterViewInit } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'sf-pie',
  templateUrl: './sf-pie.component.html',
  styleUrls: ['./sf-pie.component.scss']
})
export class SfPieComponent implements OnInit, AfterViewInit {

  @Input() public option: any = {
    id: 'sf-pie',
    color: ['#1264fb', '#1b79fa', '#4b96fc', '#5fbefb',
      '#7be3fd', '#34c6d8', '#7460ee', '#a26ad8', '#d96bcc', '#fb9715',
      '#fdc75e', '#c3da6e', '#afea77', '#7adf7a', '#4ad35b', '#87eed0',
      '#a3f5dd', '#6cdbbb', '#96e3fd', '#fe9d9d', '#fa7676', '#fb6262'
    ],
    series: [
      {
        radius: ['60%', '80%'],
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
          { name: 'bbbdddddddd', value: 11 },
          { name: 'aaa1', value: 11 },
          { name: 'aaa2', value: 11 },
          { name: 'aaa3', value: 11 },
          { name: 'aaa4', value: 11 },
          { name: 'aaa5', value: 11 },
          { name: 'aaa6', value: 11 },
          { name: 'aaa7', value: 11 },
          { name: 'aaa8', value: 11 },
          { name: 'aaa9', value: 11 },
          { name: '床前明月光，疑是地上霜', value: 11 },
          { name: 'aaa11', value: 11 },
          { name: 'aaa12', value: 11 },
          { name: 'aaa13', value: 11 },
          { name: 'aaa14', value: 2 },
          { name: 'aaa15', value: 3 },
          { name: 'aaa16', value: 4 },
          { name: 'aaa17', value: 5 },
          { name: 'aaa11', value: 11 },
          { name: 'aaa12', value: 11 },
          { name: 'aaa13', value: 11 },
          { name: 'aaa14', value: 2 },
        ]
      },
      {
        radius: ['0%', '50%'],
        center: ['50%', '50%'],
        padAngle: 0,
        cornerRadius: 2,
        label: {
          show: true,
          position: 'inner'
        },
        data: [
          { name: 'aaa1', value: 11 },
          { name: 'aaa2', value: 11 },
          { name: 'aaa3', value: 11 },
          { name: 'aaa4', value: 11 },
          { name: 'aaa5', value: 11 },
          { name: 'aaa6', value: 11 },
        ],
      },
    ]
  };

  private svgW = 0;

  private svgH = 0;

  private svg: any;

  private selection: any[];

  constructor() { }

  public ngOnInit() {

  }

  public ngAfterViewInit() {
    const wrapDom = d3.select('#' + this.option.id);
    this.svgW = Number.parseFloat(wrapDom.style('width'));
    this.svgH = Number.parseFloat(wrapDom.style('height'));

    this.initSvg(wrapDom);

    this.drawPie(this.option.series);
  }

  private initSvg(dom: any) {
    this.svg = dom.append('svg')
      .attr('class', 'sf-pie-chart')
      .attr('width', this.svgW)
      .attr('height', this.svgH);
  }

  private getPieParams(seriesItem: any) {
    const rMax = Math.min(this.svgW, this.svgH);
    const startR = this.setRatio(seriesItem.radius[0]) * rMax / 2;
    const endR = this.setRatio(seriesItem.radius[1]) * rMax / 2;
    const centerX = this.setRatio(seriesItem.center[0]) * this.svgW;
    const centerY = this.setRatio(seriesItem.center[1]) * this.svgH;
    const centerR = startR + (endR - startR) / 2;
    return { rMax, startR, endR, centerX, centerY, centerR };
  }

  // 创建饼图生成器
  private initArcPath(startR: number, endR: number, padAngle = 0, cornerRadius = 0) {
    return d3.arc()
      .innerRadius(startR) // 内环半径
      .outerRadius(endR)  // 外环半径
      .padAngle(padAngle || 0) // 饼图间隔
      .cornerRadius(cornerRadius || 0); // 饼图圆角
  }

  // 初始化饼图数据
  private initPieData(data: any[], pieParams: any) {

    return d3.pie().sort(null)
      .value((d: any) => d.value)(data)
      .map((d: any, index: number) => {
        d.width = this.getTextWidth(d.data.name, 12);
        d.id = d.data.name + index;
        d.arc = d.startAngle + (d.endAngle - d.startAngle) / 2;
        d.my = -Math.cos(d.arc) * pieParams.centerR;
        d.mx = Math.sin(d.arc) * pieParams.centerR;
        d.cx = d.mx + pieParams.centerX;
        d.cy = d.my + pieParams.centerY;


        let disArc = 0;
        if (d.arc < Math.PI / 2) {
          disArc = Math.PI / 4 - d.arc;
        } else if (d.arc < Math.PI && d.arc > Math.PI / 2) {
          disArc = Math.PI * 3 / 4 - d.arc;
        } else if (d.arc > Math.PI && d.arc < Math.PI * 3 / 2) {
          disArc = d.arc - Math.PI * 5 / 4;
        } else if (d.arc > Math.PI * 3 / 2 && d.arc < Math.PI * 2) {
          disArc = d.arc - Math.PI * 7 / 4;
        }

        d.labelArc = d.arc + disArc;
        d.labelDisR = 20 / Math.cos(disArc);
        return d;
      });
  }

  // 添加鼠标事件
  private addMouseEvent(nodes: any, arcPathEnter: any, arcPath: any, centerX: number, centerY: number, isInnerLabel: boolean) {
    nodes.on('mouseenter', function (d: any, index: number) {
      if (!isInnerLabel) {
        this.parentNode.appendChild(this);
      }
      d3.select(this).select('.pie-path').transition().duration(300).attr('d', arcPathEnter(d));
    }).on('mouseleave', function (d: any, index: number) {
      if (!d.data.selected && index !== nodes.nodes().length - 1) {
        this.parentNode.insertBefore(this, this.parentNode.childNodes[index]);
      } else if (!d.data.selected && index === nodes.nodes().length - 1) {
        this.parentNode.insertBefore(this, this.parentNode.childNodes[index - 1]);
      }

      d3.select(this).select('.pie-path').transition().duration(300).attr('d', arcPath(d));
    }).on('click', function (d: any, index: number) {
      nodes.each((d1: any) => d1.data.selected = false);
      d.data.selected = true;
      const dx = Math.sin(d.arc) * 5;
      const dy = -Math.cos(d.arc) * 5;
      d3.selectAll('.pieG').transition().duration(300).attr('transform', `translate(${centerX},${centerY})`);
      d3.select(this).transition().duration(300).attr('transform', `translate(${centerX + dx},${centerY + dy})`);
      d3.selectAll('.pie-label-g').transition().duration(300).attr('transform', `translate(${centerX},${centerY})`);

      if (!isInnerLabel) {
        this.parentNode.appendChild(this);
      } else {
        const pieLabelGnodes = d3.select(this.parentNode).selectAll('.pie-label-g');
        pieLabelGnodes.transition().duration(300).attr('transform', `translate(${centerX},${centerY})`);
        d3.select(pieLabelGnodes.nodes()[index])
          .transition()
          .duration(300)
          .attr('transform', `translate(${centerX + dx},${centerY + dy})`);
      }
    });
  }

  private drawOuterLable(pieNodes: any, pieParams: any, seriesItem: any, colors: string[]) {
    const borderRadius = (seriesItem.label && seriesItem.label.borderRadius) || 3;
    const borderColor = (seriesItem.label && seriesItem.label.borderColor) || 'none';
    const height = (seriesItem.label && seriesItem.label.height) || 24;
    const width = seriesItem.label && seriesItem.label.width;
    const isShow = seriesItem.label && seriesItem.label.show;
    const borderWidth = (seriesItem.label && seriesItem.label.borderWidth) || 1;
    const background = (seriesItem.label && seriesItem.label.background) || 'none';

    pieNodes.append('path')
      .attr('d', (d: any) => {
        const borderCenterX = Math.sin(d.arc) * pieParams.endR;
        const borderCenterY = -Math.cos(d.arc) * pieParams.endR;
        const disX = Math.sin(d.arc) > 0 ? 1 : -1;
        return `
              M${borderCenterX},${borderCenterY}
              L${borderCenterX + d.labelDisR * Math.sin(d.labelArc)},${borderCenterY - d.labelDisR * Math.cos(d.labelArc)}
              L${borderCenterX + d.labelDisR * Math.sin(d.labelArc) + disX * 20},${borderCenterY - d.labelDisR * Math.cos(d.labelArc)}
               `;
      })
      .attr('stroke', '#999').attr('stroke-width', 0.5)
      .attr('fill', 'none');

    pieNodes.append('rect')
      .attr('class', 'pie-label-rect')
      .attr('rx', borderRadius)
      .attr('ry', borderRadius)
      .attr('width', (d: any) => width || d.width)
      .attr('height', height)
      .attr('stroke', borderColor)
      .attr('stroke-width', borderWidth)
      .attr('fill', background)
      .attr('transform', (d: any) => {
        const rectW = width || d.width;
        const borderCenterX = Math.sin(d.arc) * pieParams.endR;
        const borderCenterY = -Math.cos(d.arc) * pieParams.endR;
        const disX = Math.sin(d.arc) > 0 ? 20 : - rectW - 20;
        return `translate(
          ${borderCenterX + d.labelDisR * Math.sin(d.labelArc) + disX},
          ${borderCenterY - d.labelDisR * Math.cos(d.labelArc) - height / 2 - 1}
          )`;
      });

    pieNodes.append('text')
      .attr('class', 'pie-label')
      .text((d: any) => d.data.name)
      .attr('fill', (d: any, index: number) => !isShow ? 'none' : colors[index])
      .attr('dominant-baseline', 'middle')
      .attr('text-anchor', (d: any) => Math.sin(d.arc) > 0 ? 'start' : 'end')
      .style('font-size', 12)
      .style('pointer-events', 'none')
      .attr('transform', (d: any) => {
        const rectW = width || d.width;
        const borderCenterX = Math.sin(d.arc) * pieParams.endR;
        const borderCenterY = -Math.cos(d.arc) * pieParams.endR;
        const disX = Math.sin(d.arc) > 0 ? 25 : - 25;
        return `translate(
          ${borderCenterX + d.labelDisR * Math.sin(d.labelArc) + disX},
          ${borderCenterY - d.labelDisR * Math.cos(d.labelArc)}
          )`;
      });
  }

  // 画饼图
  private drawPiePath(wrapNode: any, pieData: any[], seriesItem: any, pieParams: any, colors: string[]) {
    const isInnerLabel = seriesItem.label && seriesItem.label.position === 'inner';
    const centerX = pieParams.centerX;
    const centerY = pieParams.centerY;
    const arcPath = this.initArcPath(pieParams.startR, pieParams.endR, seriesItem.padAngle, seriesItem.cornerRadius);
    const arcPathEnter = this.initArcPath(pieParams.startR, pieParams.endR + 8, seriesItem.padAngle, seriesItem.cornerRadius);
    const pieNodes = wrapNode.selectAll('.pieG')
      .data(pieData)
      .enter()
      .append('g')
      .attr('class', 'pieG')
      .attr('id', (d: any) => 'pieG' + d.id)
      .attr('transform', (d: any) => {
        const dx = Math.sin(d.arc) * 5;
        const dy = -Math.cos(d.arc) * 5;
        return `translate(${centerX + (d.data.selected ? dx : 0)},${centerY + (d.data.selected ? dy : 0)})`;
      });

    this.addMouseEvent(pieNodes, arcPathEnter, arcPath, centerX, centerY, isInnerLabel);

    if (!isInnerLabel) {
      this.drawOuterLable(pieNodes, pieParams, seriesItem, colors);
    }

    pieNodes.append('path')
      .attr('class', 'pie-path')
      .attr('fill', 'none')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 0)
      .attr('style', 'cursor:pointer')
      .transition()
      .duration(500)
      .attrTween('d', (d: any) => {
        return (t: number) => {
          return arcPath({
            startAngle: d.startAngle * t,
            endAngle: d.endAngle * t
          });
        };
      }).attr('fill', (d: any, index: number) => colors[index]);
  }

  // 画label
  private drawInnerLabel(wrapNode: any, pieData: any[], pieParams: any, seriesItem: any, colors: string[]) {
    const centerX = pieParams.centerX;
    const centerY = pieParams.centerY;
    const textNodes = wrapNode.selectAll('.pie-label-g')
      .data(pieData)
      .enter()
      .append('g')
      .attr('class', 'pie-label-g')
      .attr('id', (d: any) => 'pieLabel' + d.id)
      .attr('transform', (d: any) => {
        const dx = Math.sin(d.arc) * 5;
        const dy = -Math.cos(d.arc) * 5;
        return `translate(${centerX + (d.data.selected ? dx : 0)},${centerY + (d.data.selected ? dy : 0)})`;
      });

    textNodes.append('text')
      .attr('class', 'pie-label')
      .text((d: any) => d.data.name)
      .attr('fill', (d: any, index: number) => seriesItem.label && seriesItem.label.show === false ? 'none' : '#fff')
      .attr('dominant-baseline', 'middle')
      .attr('text-anchor', 'middle')
      .style('font-size', 12)
      .style('pointer-events', 'none')
      .attr('transform', (d: any) => `translate(${d.mx},${d.my})`);
  }

  private drawPie(data: any[]) {
    const that = this;
    this.svg.append('g')
      .attr('class', 'main-pies-wrap')
      .selectAll('.pieGwrap')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'pieGwrap')
      .each(function (d: any) {
        const nodeG = d3.select(this);
        const colors = that.option.color;
        // const colors = d.data.map((dataItem: any, index: number) => d3.interpolateViridis(index / d.data.length));
        const pieParams = that.getPieParams(d);

        const pieData = that.initPieData(d.data, pieParams);
        that.drawPiePath(nodeG, pieData, d, pieParams, colors);
        if (d.label.position === 'inner') {
          that.drawInnerLabel(nodeG, pieData, pieParams, d, colors);
        }
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
    const span = d3.select('body').append('span')
      .style('display', 'inline-block')
      .style('font-size', fontSize + 'px')
      .text(str);
    const spanWidth = Number.parseFloat(span.style('width')) + 10;
    span.remove();
    return spanWidth;
  }

}
