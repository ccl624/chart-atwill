import * as scale from 'd3-scale';
import * as axis from 'd3-axis';

export class YAxis {

  public axisNode: any;

  public scale: any;

  constructor(svg: any) {
    this.scale = scale.scaleLinear();
    this.axisNode = svg.append('g').attr('class', 'axis-y-g');
  }

  public updateData(yAxisOption: any, margin: any, width: number, height: number, minMax: any) {
    this.scale.domain([minMax.min || 0, minMax.max || 0]);
    this.resizeAxis(margin, width, height);
  }

  public resizeAxis(margin: any, width: number, height: number) {
    this.scale.range([height - margin.bottom, margin.top]);
    this.axisNode.attr('transform', `translate(${margin.left},${0})`)
      .call(axis.axisLeft(this.scale).tickSizeOuter(6))
      .call((g: any) => this.beautifyAxis(g, margin, width, height));
  }

  private beautifyAxis(axisG: any, margin: any, width: number, height: number) {
    axisG.selectAll('.tick .split-line').remove();
    axisG.selectAll('.tick line')
      .attr('class', 'axis-tick')
      .attr('x1', 0.5);

    axisG.selectAll('.tick')
      .append('line')
      .attr('class', 'split-line')
      .attr('x1', 1)
      .attr('x2', width - margin.right - margin.left)
      .attr('stroke', '#ccc')
      .attr('shape-rendering', 'crispEdges');

    axisG.selectAll('line,path')
      .attr('stroke-width', 0.5)
      .attr('shape-rendering', 'crispEdges');
  }
}
