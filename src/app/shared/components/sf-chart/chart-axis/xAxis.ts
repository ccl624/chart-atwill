import * as scale from 'd3-scale';
import * as axis from 'd3-axis';

export class XAxis {

  public axisNode: any;

  public scale: any;

  constructor(svg: any) {
    this.scale = scale.scaleBand();
    this.axisNode = svg.append('g').attr('class', 'axis-x-g');
  }

  public updateData(xAxisOption: any, margin: any, width: number, height: number) {
    const data = xAxisOption ? xAxisOption.data || [] : [];
    this.scale.domain(data);
    this.resizeAxis(margin, width, height);
  }

  public resizeAxis(margin: any, width: number, height: number) {
    this.scale.range([margin.left, width - margin.right]);
    this.axisNode
      .attr('transform', `translate(${0},${height - margin.bottom})`)
      .call(axis.axisBottom(this.scale).tickSizeInner(6).tickSizeOuter(6))
      .call((g: any) => this.updateAxis(g, margin, width, height));
  }

  private updateAxis(axisG: any, margin: any, width: number, height: number) {
    this.beautifyAxis(axisG, margin, width, height);

    axisG.selectAll('.tick line').attr('transform', `translate(${this.scale.step() / 2},0)`);
    axisG.selectAll('.tick .split-line').attr('y1', -height + margin.top + margin.bottom);
  }

  private beautifyAxis(axisG: any, margin: any, width: number, height: number) {
    axisG.selectAll('.tick .split-line').remove();

    axisG.selectAll('.tick line')
      .attr('transform', `translate(${this.scale.step() / 2},0)`)
      .attr('class', 'axis-tick');

    axisG.selectAll('.tick')
      .append('line')
      .attr('class', 'split-line')
      .attr('y1', -height + margin.top + margin.bottom)
      .attr('y2', 0)
      .attr('stroke', '#ccc');

    axisG.selectAll('line,path')
      .attr('stroke-width', 0.5)
      .attr('shape-rendering', 'crispEdges');
  }
}
