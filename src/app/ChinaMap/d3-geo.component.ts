import { Component, OnInit, AfterViewInit, Input } from '@angular/core';
import { D3GeoService } from './d3-geo.service';
import * as d3 from 'd3';
import 'd3-geo-projection';

@Component({
  selector: 'd3-geo',
  templateUrl: './d3-geo.component.html',
  styleUrls: ['./d3-geo.component.scss']
})

export class D3GeoComponent implements OnInit, AfterViewInit {

  private svgH = 0;  //

  private svgW = 0;

  private svg: any;

  private defs: any;

  private barSize: any = { // 柱子粗细, w柱子横截面水平宽度, h柱子横截面水平高度, x截面上下两边水平偏移, 模拟3D
    w: 10,
    h: 5,
    x: 5
  };

  @Input() public barColor: any = {
    normal: { // #aedcff #f0302e
      type: 'linear',
      x1: 0,
      x2: 0,
      y1: 0,
      y2: 1,
      colorStops: [{
        offset: 0, color: '#aedcff', opacity: 0.9 // 0% 处的颜色
      }, {
        offset: 0.25, color: '#aedcff', opacity: 0.86
      }, {
        offset: 0.5, color: '#aedcff', opacity: 0.66
      }, {
        offset: 0.85, color: '#aedcff', opacity: 0.1
      }, {
        offset: 1, color: '#aedcff', opacity: 0
      }],
    },
    active: {
      type: 'linear',
      x1: 0,
      x2: 0,
      y1: 0,
      y2: 1,
      colorStops: [{
        offset: 0, color: '#f0302e', opacity: 0.9 // 0% 处的颜色
      }, {
        offset: 0.25, color: '#f0302e', opacity: 0.86
      }, {
        offset: 0.5, color: '#f0302e', opacity: 0.66
      }, {
        offset: 0.85, color: '#f0302e', opacity: 0.1
      }, {
        offset: 1, color: '#f0302e', opacity: 0
      }],
    }
  };

  @Input() public barColorRight: any = {
    normal: { // #aedcff #f0302e
      type: 'linear',
      x1: 0,
      x2: 0,
      y1: 0,
      y2: 1,
      colorStops: [{
        offset: 0, color: '#aedcff', opacity: 0.7 // 0% 处的颜色
      }, {
        offset: 0.25, color: '#aedcff', opacity: 0.66
      }, {
        offset: 0.5, color: '#aedcff', opacity: 0.46
      }, {
        offset: 0.85, color: '#aedcff', opacity: 0.1
      }, {
        offset: 1, color: '#aedcff', opacity: 0
      }],
    },
    active: {
      type: 'linear',
      x1: 0,
      x2: 0,
      y1: 0,
      y2: 1,
      colorStops: [{
        offset: 0, color: '#f0302e', opacity: 0.7 // 0% 处的颜色
      }, {
        offset: 0.25, color: '#f0302e', opacity: 0.66
      }, {
        offset: 0.5, color: '#f0302e', opacity: 0.46
      }, {
        offset: 0.85, color: '#f0302e', opacity: 0.1
      }, {
        offset: 1, color: '#f0302e', opacity: 0
      }],
    }
  }

  @Input() public markColor: any = {
    normal: {
      type: 'linear',
      x1: 0,
      x2: 1,
      y1: 0,
      y2: 0,
      colorStops: [{
        offset: 0, color: '#cec396', opacity: 0// 0% 处的颜色
      }, {
        offset: 0.3, color: '#cec396', opacity: 0.4// 50% 处的颜色
      }, {
        offset: 0.7, color: '#cec396', opacity: 0.4// 50% 处的颜色
      }, {
        offset: 1, color: '#cec396', opacity: 0 // 100% 处的颜色
      }],
    },
    active: {
      type: 'linear',
      x1: 0,
      x2: 1,
      y1: 0,
      y2: 0,
      colorStops: [{
        offset: 0, color: '#f0302e', opacity: 0// 0% 处的颜色
      }, {
        offset: 0.3, color: '#f0302e', opacity: 0.4// 30% 处的颜色
      }, {
        offset: 0.7, color: '#f0302e', opacity: 0.4// 40% 处的颜色
      }, {
        offset: 1, color: '#f0302e', opacity: 0 // 100% 处的颜色
      }],
    }
  };

  @Input() public scale = 1000;

  private barDegree = 1 / 1000;

  private center = [0, 0];

  private transition: any;

  private showMarker = true;

  private hightestLevelG: any; // svg画布最高层占位元素 用来存放当前被选中的元素 解决重叠问题

  constructor(
    private d3GeoService: D3GeoService
  ) { }

  public ngOnInit() {
    this.transition = d3.transition().duration(1000);
    this.barSize.w = this.scale * this.barDegree * 10;
    this.barSize.h = this.scale * this.barDegree * 5;
    this.barSize.x = this.scale * this.barDegree * 5;
  }

  public ngAfterViewInit() {
    this.initSvg();
    this.createGradient();
    this.createFilter('china_map_filter');
    this.getChinaMapData();
  }

  private initSvg() {
    const d3GeoNode = d3.select('#d3-geo').nodes()[0];
    this.svgW = d3GeoNode.getBoundingClientRect().width;
    this.svgH = d3GeoNode.getBoundingClientRect().height;
    this.svg = d3.select('#d3-geo').append('svg')
      .attr('width', this.svgW)
      .attr('height', this.svgH);

    this.defs = this.svg.append('defs');
  }

  private getChinaMapData() {
    Promise.all([this.getChinaJSON(), this.getChinaMapOutLine()]).then((res: any) => {
      const chinaMapData = res[0].features.map((feature: any, index: number) => Object.assign(feature, { value: Math.random() * 100 }));
      const chinaMapOutlineData = res[1].features;
      this.center = res[0].cp;

      const projection = this.initProjection();
      const gFilterNodes = this.initGNodes(chinaMapOutlineData, 'china-map-filter');
      this.drawChinaFilterMap(gFilterNodes, projection);
      this.drawChinaOutLineMap(gFilterNodes, projection);

      const gNodes = this.initGNodes(chinaMapData, 'china-map');
      this.drawChinaMap(gNodes, projection);
      this.drawMapData(gNodes, projection);

      const that = this;
      this.hightestLevelG = this.svg.append('g')
        .attr('class', 'hightest-Level-g')
        .on('mouseout', function (d: any, index: number) {
          const node1 = d3.select(this).select('.data-shape-g');
          const id = node1.attr('id');
          node1.remove();

          const tarNode = d3.select('#' + id);
          const barNode = tarNode.select('.data-shape-wrap');
          barNode.style('display', '');
          that.activeNodes(barNode, false);
        });
    });
  }

  private getChinaMapOutLine() {
    const promise = new Promise(resolve => {
      this.d3GeoService.getChinaMapOutlineJSON().subscribe((res: any) => {
        resolve(res);
      });
    });
    return promise;
  }

  private getChinaJSON() {
    const promise = new Promise(resolve => {
      this.d3GeoService.getChinaJSON().subscribe((res: any) => {
        resolve(res);
      });
    });
    return promise;
  }

  private initProjection() {
    return d3.geoMercator()
      .center(this.center)
      .scale(this.scale)
      .translate([this.svgW / 2, this.svgH / 2]);
  }

  private initGNodes(data: any[], classStr: string) {
    const gNodes = this.svg.selectAll(classStr).data(data).enter().append('g').attr('class', classStr);
    return gNodes;
  }

  private drawChinaFilterMap(gNodes: any, projection: any, hasFilter = true) {
    gNodes.append('path')
      .attr('transform', hasFilter ? 'translate(0,15)' : 'none')
      .attr('class', 'batman-path')
      .attr('d', d3.geoPath(projection))
      .attr('fill', 'none')
      .attr('stroke', '#9fc8e7')
      .attr('filter', hasFilter ? 'url(#china_map_filter)' : 'none')
      .attr('stroke-width', '1');
  }

  private drawChinaOutLineMap(gNodes: any, projection: any) {
    const path = gNodes.append('path')
      .attr('class', 'outline-path')
      .attr('d', d3.geoPath(projection))
      .attr('fill', 'none')
      .attr('stroke', '#9fc8e7')
      .attr('stroke-width', 2);

    const attr = {
      name: 'stroke-width',
      values: ['0', '2'],
    };
    this.bling(path, attr, '0');
  }

  private bling(node: any, attr: any, value: string) {
    node.transition()
      .duration(600)
      .attr(attr.name, value)
      .on('end', () => {
        const nextValue = value === attr.values[0] ? attr.values[1] : attr.values[0];
        this.bling(node, attr, nextValue);
      });
  }

  private drawChinaMap(gNodes: any, projection: any) {
    const mapG = gNodes.append('g')
      .attr('class', 'mapG');

    mapG.append('path')
      .attr('class', 'batman-path')
      .attr('d', d3.geoPath(projection))
      .attr('fill', 'none')
      .attr('stroke', '#e7d9a41a')
      .attr('stroke-width', '2');
  }

  private activeBar(node: any, isActive = true) {
    node.selectAll('.rightSauare').attr('fill', isActive ? 'url(#china_bar_front_active)' : 'url(#china_bar_front)');
    node.selectAll('.frontSauare').attr('fill', isActive ? 'url(#china_bar_front_active)' : 'url(#china_bar_front)');
    node.selectAll('.topSauare').attr('fill', isActive ? '#f0302eb3' : '#aedcffb3');
  }

  private activeMarker(node: any, isActive = true) {
    node.select('.markG').selectAll('.text-wrap').attr('fill', isActive ? 'url(#china_marker_color_active)' : 'url(#china_marker_color)');
    node.select('.markG').selectAll('.arrow-icon').attr('fill', isActive ? '#f0302e' : '#aedcff');
    node.select('.markG').selectAll('.marker-frame').attr('stroke', isActive ? '#f0302e' : '#aedcff');
  }

  private activeCpIcon(node: any, isActive = true) {
    node.select('.cp-icon').attr('fill', isActive ? '#f0302e' : '#cec396');
  }

  private activeNodes(node: any, active: boolean) {
    const parentNode = d3.select(node.node().parentNode);
    this.activeBar(node, active);
    this.activeMarker(parentNode, active);
    this.activeCpIcon(parentNode, active);
  }

  private addMouseEvent(node: any) {

  }

  private drawMapData(gNodes: any, projection: any) {
    const dataShapeG = gNodes.append('g')
      .attr('class', 'data-shape-g')
      .attr('id', (d: any, index: number) => 'data-shape-g' + index)
      .attr('transform', (d: any) => `translate(${projection(d.properties.cp)})`);

    const wrapG = dataShapeG.append('g')
      .attr('class', 'data-shape-wrap');

    this.drawCpName(wrapG);
    this.drawMapBar(wrapG);
    this.drawMapMarker(wrapG);
  }

  private drawCpName(nodes: any) {
    const cpNmaeG = nodes.append('g')
      .attr('class', 'cp-name data-shape-child');
    cpNmaeG.append('text')
      .text((d: any) => d.properties.name)
      .attr('transform', 'translate(-8,0) scale(0.8)')
      .attr('text-anchor', 'end')
      .attr('dominant-baseline', 'middle')
      .style('fill', '#e7d9a466');

    cpNmaeG.append('circle')
      .attr('class', 'cp-icon')
      .attr('r', 3)
      .attr('x', 0)
      .attr('y', 0)
      .attr('fill', '#e3d49d');
  }

  private drawMapBar(gNodes: any) {
    const z = this.barSize.h;
    const x = this.barSize.x;
    const w = this.barSize.w;
    const that = this;

    const barG = gNodes.append('g')
      .attr('class', 'barG data-shape-child')
      .attr('transform', `translate(${- x - 1.5},0)`)
      .attr('cursor', 'pointer')
      .on('mouseout', function () {
        console.log(1111);

        const node = d3.select(this);
        that.activeNodes(node, false);
      })
      .on('mouseover', function (d: any, index: number) {
        const node = d3.select(this);
        that.activeNodes(node, true);
        const cloneNode = d3.select(this.parentNode.parentNode).clone(true);
        // d3.select(this.parentNode.parentNode).remove();
        // this.svg.append(cloneNode);
        that.hightestLevelG.node().appendChild(cloneNode.node());
        d3.select(this.parentNode).style('display', 'none');
        // d3.select(this.parentNode).remove();
      });


    barG.append('path')
      .attr('class', 'rightSauare')
      .attr('d', (d: any) => {
        const height = 0;
        return `M${w},0 L${w},${-height} L${x + w},${-height - z} L${x + w},${-z} L${w},${0} Z `;
      })
      .transition(this.transition)
      .attr('d', (d: any) => {
        const height = d.value;
        return `M${w},0 L${w},${-height} L${x + w},${-height - z} L${x + w},${-z} L${w},${0} Z `;
      })
      .attr('fill', 'url(#china_bar_right)')
      .attr('stroke-width', 1)
      .attr('stroke', 'rgba(0,0,0,0)');



    barG.append('path')
      .attr('class', 'frontSauare')
      .attr('d', (d: any) => {
        const height = 0;
        return `M0,0 L0,${-height} L${w},${-height} L${w},${0} Z`;
      })
      .transition(this.transition)
      .attr('d', (d: any) => {
        const height = d.value;
        return `M0,0 L0,${-height} L${w},${-height} L${w},${0} Z`;
      })
      .attr('fill', 'url(#china_bar_front)')
      .attr('stroke-width', 1)
      .attr('stroke', 'rgba(0,0,0,0)');


    barG.append('path')
      .attr('class', 'topSauare')
      .attr('d', (d: any) => {
        const height = 0;
        return `M0,${-height} L${w},${-height} L${x + w},${-height - z} L${x},${-height - z} Z`;
      })
      .transition(this.transition)
      .attr('d', (d: any) => {
        const height = d.value;
        return `M0,${-height} L${w},${-height} L${x + w},${-height - z} L${x},${-height - z} Z`;
      })
      .attr('fill', `#aedcffb3`).attr('stroke-width', 1)
      .attr('stroke', 'rgba(0,0,0,0)');
  }

  private drawMapMarker(gNodes: any) {
    if (!this.showMarker) {
      return false;
    }
    const markG = gNodes.append('g')
      .attr('class', 'markG data-shape-child')
      .attr('transform', `translate(${-3},${-40}) scale(0.8, 1)`);

    markG.append('rect')
      .attr('class', 'text-wrap')
      .attr('x', (d: any) => -this.getTextWidth(d.value.toFixed(2)) / 2)
      .attr('width', (d: any) => this.getTextWidth(d.value.toFixed(2)))
      .attr('height', '24')
      .attr('fill', 'url(#china_marker_color)')
      .attr('y', '-13')
      .attr('transform', `translate(5,0)`);

    markG.append('text')
      .attr('class', 'marker-text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('fill', '#cec396')
      .text((d: any) => d.value.toFixed(2))
      .attr('transform', `translate(5,0)`);

    markG.append('path')
      .attr('class', 'arrow-icon')
      .attr('d', (d: any) => {
        const c = 0;
        const dh = 12 + 3;
        return `M${c},${dh} L${c + 4},${dh} L${c},${dh + 8}, L${c - 4},${dh} Z`;
      })
      .attr('fill', '#aedcff')
      .attr('transform', `translate(5,0)`);

    this.drawMarkFrame(markG);

    markG.transition(this.transition)
      .attr('transform', (d: any) => `translate(${-3},${- d.value - 40}) scale(0.8, 1)`);
  }

  private drawMarkFrame(markG: any) {
    const frameGNode = markG.append('g')
      .attr('class', 'frame-g');

    const frameDh = 14;
    const frameW = 6;

    frameGNode.append('path')
      .attr('class', 'marker-frame marker-frame-left-top')
      .attr('d', (d: any) => {
        const c = -this.getTextWidth(d.value.toFixed(2)) / 2;
        const dh = -frameDh;
        return `M${c + frameW},${dh} L${c},${dh}`;
      })
      .attr('stroke', '#aedcff')
      .attr('stroke-width', 2);

    frameGNode.append('path')
      .attr('class', 'marker-frame marker-frame-right-top')
      .attr('d', (d: any) => {
        const c = this.getTextWidth(d.value.toFixed(2)) / 2 + frameW;
        const dh = -frameDh;
        return `M${c},${dh} L${c + frameW},${dh}`;
      })
      .attr('stroke', '#aedcff')
      .attr('stroke-width', 2);

    frameGNode.append('path')
      .attr('class', 'marker-frame marker-frame-left-bottom')
      .attr('d', (d: any) => {
        const c = -this.getTextWidth(d.value.toFixed(2)) / 2;
        const dh = frameDh - 1;
        return `M${c + frameW},${dh} L${c},${dh}`;
      })
      .attr('stroke', '#aedcff')
      .attr('stroke-width', 2);

    frameGNode.append('path')
      .attr('class', 'marker-frame marker-frame-right-bottom')
      .attr('d', (d: any) => {
        const c = this.getTextWidth(d.value.toFixed(2)) / 2 + frameW;
        const dh = frameDh - 1;
        return `M${c},${dh} L${c + frameW},${dh}`;
      })
      .attr('stroke', '#aedcff')
      .attr('stroke-width', 2);
  }

  private createGradient() {
    this.createLinearGradient('china_bar_front', this.barColor.normal);
    this.createLinearGradient('china_bar_right', this.barColorRight.normal);
    this.createLinearGradient('china_marker_color', this.markColor.normal);
    this.createLinearGradient('china_bar_front_active', this.barColor.active);
    this.createLinearGradient('china_bar_right_active', this.barColorRight.active);
    this.createLinearGradient('china_marker_color_active', this.markColor.active);
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
        .style('stop-color', color.colorStops[0].color);
    });
  }

  private createFilter(id: string) {
    const filter = this.defs.append('filter')
      .attr('id', id);

    filter.append('feGaussianBlur')
      .attr('result', 'blurOut')
      .attr('in', 'offOut')
      .attr('stdDeviation', 1); // 阴影模糊度
  }

  private getTextWidth(str: string) {
    const span = d3.select('body').append('span').style('display', 'inline-block').text(str);
    const spanWidth = Number.parseInt(span.style('width'), 10) + 10;
    span.remove();
    return spanWidth;
  }
}
