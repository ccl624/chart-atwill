import * as d3 from 'd3';

export class Line {
  tw = 0;
  th = 0;
  defs: any;
  constructor() { }

  initLines(gridConfig, seriesItem, option, defs, rangeY) {
    this.defs = defs;
    this.tw = gridConfig.gridSize.width;
    this.th = gridConfig.gridSize.height;
    this.drawLine(gridConfig, seriesItem, rangeY);
  }

  drawLine(gridConfig, seriesItem, rangeY) {
    const linePath1 = d3.line().x(d => d[0]).y(d => d[1]).curve(d3.curveMonotoneX);
    const linePath2 = d3.line().x(d => d[0]).y(d => d[1] + 10).curve(d3.curveMonotoneX);
    const areaPath = d3.area().x(d => d[0])
      .y1(d => this.th * (rangeY.max) / (rangeY.max - rangeY.min))
      .y0(d => d[1]).curve(d3.curveMonotoneX);
    const seriesG = gridConfig.gridNode.append('g')
      .attr('class', 'lineG');
    const areaColor = this.createLinear(seriesItem);
    const data = this.initNodes(seriesItem, rangeY);
    const lineG = seriesG.append('path')
      .attr('d', linePath1(data))
      .attr('stroke', seriesItem.itemStyle.color)
      .attr('stroke-width', 2)
      .attr('fill', 'none');

    seriesG.append('path')
      .attr('d', linePath2(data))
      .attr('stroke', seriesItem.lineStyle.shadowColor)
      .attr('stroke-width', seriesItem.lineStyle.shadowBlur)
      .attr('fill', 'none');

    seriesG.append('path')
      .attr('d', areaPath(data))
      .attr('stroke', seriesItem.itemStyle.color)
      .attr('stroke-width', 0)
      .attr('fill', areaColor);


    this.drawPoint(seriesG, data, seriesItem);
  }

  drawPoint(node, data, seriesItem) {
    node.selectAll('.pointG')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'pointG')
      .attr('id', (d, i) => `pointG${i}`)
      .append('circle')
      .attr('class', 'pointCircle')
      .attr('cx', d => d[0])
      .attr('cy', d => d[1])
      .attr('r', 3)
      .attr('stroke', seriesItem.itemStyle.color)
      .attr('stroke-width', data.length > 1 ? 0 : 1)
      .attr('fill', data.length > 1 ? 'none' : '#ffffff');
  }

  showPoint(index) {
    d3.selectAll(`#pointG${index}`).selectAll('.pointCircle').attr('stroke-width', 1).attr('fill', '#ffffff');
  }

  initNodes(d, rangeY) {
    return d.data.map((dataItem, dataIndex) => {
      const dataNum = d.data.length || 1;
      const itemWidth = this.tw / dataNum;
      const x = itemWidth * dataIndex + itemWidth / 2;
      const barValue = this.getDataValue(dataItem) - rangeY.min;
      const k = barValue / rangeY.length;
      const y = (1 - k) * this.th;
      return [x, y];
    });
  }

  getDataValue(dataItem) {
    if (Object.prototype.toString.call(dataItem) === '[object Object]') {
      return +dataItem.value;
    } else {
      return +dataItem;
    }
  }

  createLinear(seriesItem) {
    if (seriesItem.areaStyle) {
      if (typeof seriesItem.areaStyle.color === 'object' && seriesItem.areaStyle.color.type === 'linear') {
        this.createLinearGradient(`linearGradient${seriesItem.name}`, seriesItem.areaStyle.color);
      }
    }
    return this.getAreaColor(seriesItem);
  }

  getAreaColor(seriesItem) {
    if (seriesItem.areaStyle) {
      if (typeof seriesItem.areaStyle.color === 'object' && seriesItem.areaStyle.color.type === 'linear') {
        return `url(#linearGradient${seriesItem.name})`;
      } else {
        return seriesItem.areaStyle.color;
      }
    }
    return 'none';
  }

  createLinearGradient(id, color) {
    const linearGradient = this.defs.append('linearGradient')
      .attr('id', id)
      .attr('x1', color.x1)
      .attr('y1', color.y1)
      .attr('x2', color.x2)
      .attr('y2', color.y2);

    linearGradient.append('stop')
      .attr('offset', color.colorStops[0].offset)
      .style('stop-color', color.colorStops[0].color);

    linearGradient.append('stop')
      .attr('offset', color.colorStops[1].offset)
      .style('stop-color', color.colorStops[1].color);
  }
}
