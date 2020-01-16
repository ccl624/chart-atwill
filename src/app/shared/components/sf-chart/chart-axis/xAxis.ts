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
    this.axisNode.call((g: any) => {
      const tg = g.transition().duration(300).attr('transform', `translate(${0},${height - margin.bottom})`);
      axis.axisBottom(this.scale)
        .tickPadding(9)
        .tickSizeInner(-height + margin.top + margin.bottom)
        .tickSizeOuter(6)(tg);
      this.beautifyAxis(g, margin, width, height);
    });
  }

  private beautifyAxis(axisG: any, margin: any, width: number, height: number) {
    axisG.selectAll('.tick .line-tick').remove();

    axisG.selectAll('.tick line')
      .attr('class', 'split-line')
      .attr('stroke', '#ccc')
      .attr('transform', `translate(${this.scale.step() / 2},0)`);

    axisG.selectAll('.tick')
      .append('line')
      .attr('class', 'line-tick')
      .attr('y2', 0)
      .attr('stroke', '#000')
      .attr('y1', 6);

    axisG.selectAll('line,path')
      .attr('stroke-width', 0.5)
      .attr('shape-rendering', 'crispEdges');
  }
}
