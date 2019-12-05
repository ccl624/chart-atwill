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

  private svgH = 0;

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
        offset: 0, color: '#aedcff', opacity: 0.8 // 0% 处的颜色
      }, {
        offset: 0.04, color: '#aedcff', opacity: 0.76
      }, {
        offset: 0.52, color: '#aedcff', opacity: 0.36
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
        offset: 0, color: '#f0302e', opacity: 0.8 // 0% 处的颜色
      }, {
        offset: 0.04, color: '#f0302e', opacity: 0.76
      }, {
        offset: 0.52, color: '#f0302e', opacity: 0.36
      }, {
        offset: 0.85, color: '#f0302e', opacity: 0.1
      }, {
        offset: 1, color: '#f0302e', opacity: 0
      }],
    }
  };

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
        offset: 0.5, color: '#cec396', opacity: 0.4// 50% 处的颜色
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
        offset: 0.5, color: '#f0302e', opacity: 0.4// 50% 处的颜色
      }, {
        offset: 1, color: '#f0302e', opacity: 0 // 100% 处的颜色
      }],
    }
  };

  constructor(
    private d3GeoService: D3GeoService
  ) { }

  public ngOnInit() { }

  public ngAfterViewInit() {
    this.initSvg();
    this.createGradient();
    this.createFilter('china_map_filter');
    this.getChinaJSON();
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

  private getChinaJSON() {
    this.d3GeoService.getChinaJSON().subscribe((res: any) => {
      const projection = this.initProjection(res);
      const gFilterNodes = this.initGNodes(res, 'china-map-filter');
      this.drawChinaFilterMap(gFilterNodes, projection);

      const gNodes = this.initGNodes(res, 'china-map');
      this.drawChinaMap(gNodes, projection);

      const barGNodes = this.initGNodes(res, 'china-map-bar'); // 新建nodes防止重叠
      this.drawMapBar(barGNodes, projection);

      const markGNodes = this.initGNodes(res, 'china-map-marker'); // 新建nodes防止重叠
      this.drawMapMarker(markGNodes, projection);
    });
  }

  private initProjection(data: any) {
    const centers = data.features.reduce((sums: number[], feature: any) => {
      return [sums[0] + feature.properties.cp[0], sums[1] + feature.properties.cp[1]];
    }, [0, 0]);

    const featureLength = data.features.length;
    const center0 = centers[0] / featureLength;
    const center1 = centers[1] / featureLength;

    return d3.geoMercator()
      .center([center0, center1])
      .scale(this.svgH * 0.9)
      .translate([this.svgW / 2, this.svgH / 2]);
  }

  private initGNodes(data: any, id: string) {
    const gNodes = this.svg.selectAll(id)
      .data(data.features)
      .enter()
      .append('g')
      .attr('class', id);

    return gNodes;
  }

  private drawChinaFilterMap(gNodes: any, projection: any) {
    gNodes.append('path')
      .attr('transform', 'translate(0,30)')
      .attr('class', 'batman-path')
      .attr('d', d3.geoPath(projection))
      .attr('fill', '#17203b')
      .attr('stroke', '#9fc8e7')
      .attr('stroke-width', '1')
      .attr('filter', 'url(#china_map_filter)');
  }

  private drawChinaMap(gNodes: any, projection: any) {
    gNodes.append('path')
      .attr('class', 'batman-path')
      .attr('d', d3.geoPath(projection))
      .attr('fill', '#1e375d')
      .attr('stroke', '#9fc8e7')
      .attr('stroke-width', '2');

    gNodes.append('text')
      .text((d: any) => d.properties.name)
      .attr('transform', (d: any) => `translate(${projection(d.properties.cp)}) scale(0.8)`)
      .attr('text-anchor', 'end')
      .attr('dominant-baseline', 'middle')
      .style('fill', '#46525e');

    gNodes.append('circle')
      .attr('transform', (d: any) => {
        const axis = projection(d.properties.cp);
        const dx = 4;
        return `translate(${axis[0] + dx},${axis[1]})`;
      })
      .attr('r', 3)
      .attr('x', 0)
      .attr('y', 0)
      .attr('fill', '#e3d49d');
  }

  private activeBar(node: any, isActive = true) {
    node.selectAll('.rightSauare').attr('fill', isActive ? 'url(#china_bar_front_active)' : 'url(#china_bar_front)');
    node.selectAll('.frontSauare').attr('fill', isActive ? 'url(#china_bar_front_active)' : 'url(#china_bar_front)');
    node.selectAll('.topSauare').attr('fill', isActive ? '#f0302e' : '#aedcff');
  }

  private activeMarker(node: any, isActive = true) {
    node.selectAll('.text-wrap').attr('fill', isActive ? 'url(#china_marker_color_active)' : 'url(#china_marker_color)');
    node.selectAll('.marker-text').attr('fill', isActive ? '#f0302e' : '#cec396');
  }

  private drawMapBar(gNodes: any, projection: any) {
    const z = this.barSize.h;
    const x = this.barSize.x;
    const y = 50; // 柱子高度
    const w = this.barSize.w;
    const barG = gNodes.append('g')
      .attr('class', 'barG')
      .attr('transform', (d: any) => {
        const axis = projection(d.properties.cp);
        const dx = 3;
        return `translate(${axis[0] - x + dx},${axis[1] - y}) scale(0.8,1)`;
      }).attr('cursor', 'pointer')
      .on('click', (d: any, index: number) => {
        const allBarNodes = d3.selectAll('.barG');
        this.activeBar(allBarNodes, false);

        const allMarkNode = d3.selectAll('.markG');
        this.activeMarker(allMarkNode, false);

        const curNode = d3.select(allBarNodes.nodes()[index]);
        this.activeBar(curNode, true);

        const curMarkNode = d3.select(allMarkNode.nodes()[index]);
        this.activeMarker(curMarkNode, true);
      });


    barG.append('path')
      .attr('class', 'rightSauare')
      .attr('d', (d: any) => {
        const width = w;
        const height = y;
        return `M${width},0 L${width},${height} L${x + width},${height - z} L${x + width},${-z} L${width},${0} Z `;
      })
      .attr('fill', 'url(#china_bar_front)')
      .attr('stroke-width', 1);



    barG.append('path')
      .attr('class', 'frontSauare')
      .attr('d', (d: any) => {
        const width = w;
        const height = y;
        return `M0,0 L0,${height} L${width},${height} L${width},${0} Z`;
      }).attr('fill', 'url(#china_bar_front)')
      .attr('stroke-width', 1);


    barG.append('path')
      .attr('class', 'topSauare')
      .attr('d', (d: any) => {
        const width = w;
        return `M0,0 L${width},0 L${x + width},${-z} L${x},${-z} Z`;
      }).attr('fill', `#aedcff`).attr('stroke-width', 0);
  }

  private drawMapMarker(gNodes: any, projection: any) {
    const z = this.barSize.h;
    const x = this.barSize.x;
    const y = 50; // 柱子高度
    const w = this.barSize.w;
    const markG = gNodes.append('g')
      .attr('class', 'markG')
      .attr('transform', (d: any) => {
        const axis = projection(d.properties.cp);
        const dx = 3;
        return `translate(${axis[0] + dx},${axis[1] - y - 10}) scale(0.8,1)`;
      });

    markG.append('rect')
      .attr('class', 'text-wrap')
      .attr('x', -this.getTextWidth('190,876,543') / 2)
      .attr('y', '-9')
      .attr('width', this.getTextWidth('190,876,543'))
      .attr('height', '16')
      .attr('fill', 'url(#china_marker_color)');

    markG.append('text')
      .attr('class', 'marker-text')
      .text((d: any) => '190,876,543')
      .attr('transform', 'scale(0.8)')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('fill', '#cec396');
  }

  private createGradient() {
    this.createLinearGradient('china_bar_front', this.barColor.normal);
    this.createLinearGradient('china_marker_color', this.markColor.normal);
    this.createLinearGradient('china_bar_front_active', this.barColor.active);
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
      .attr('stdDeviation', 1.5); // 阴影模糊度
  }

  private getTextWidth(str: string) {
    const span = d3.select('body').append('span').style('display', 'inline-block').text(str);
    const spanWidth = Number.parseInt(span.style('width'), 10) + 5;
    span.remove();
    return spanWidth;
  }
}
