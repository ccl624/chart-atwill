import * as shap from 'd3-shape';

export class Line {

  public chartNode: any;

  private line: any;

  constructor(svg: any, scaleX: any, scaleY: any, serie: any, data: any[]) {
    this.line = this.defindLine(serie, scaleX, scaleY);
    this.chartNode = svg.append('g').attr('class', 'line-g').attr('transform', `translate(${scaleX.step() / 2},0)`);
    this.drawPath(data);
    this.drawSymbol(data, scaleX, scaleY);
  }

  private defindLine(serie: any, scaleX: any, scaleY: any) {
    const line = shap.line().x((d: any) => scaleX(d.label)).y((d: any) => scaleY(d.value));
    if (serie.smooth) {
      line.curve(shap.curveMonotoneX);
    }
    return line;
  }

  private drawPath(data: any[]) {
    const pathNode = this.chartNode.append('path')
      .datum(data)
      .attr('class', 'line')
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 1.5)
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .attr('d', this.line);

    const length = pathNode.node().getTotalLength();

    pathNode.attr('stroke-dasharray', `${length} ${length}`)
      .attr('stroke-dashoffset', length)
      .transition()
      .duration(2000)
      .attr('stroke-dashoffset', 0);
  }

  private drawSymbol(data: any[], scaleX: any, scaleY: any) {
    const symbolUpdate = this.chartNode.selectAll('.line-symbol').data(data);
    const sumbolEnter = symbolUpdate.enter();
    symbolUpdate.exit().remove();
    sumbolEnter.append('circle')
      .attr('class', 'line-symbol')
      .attr('stroke', 'red')
      .attr('stroke-width', 1)
      .attr('fill', '#fff')
      .attr('cx', (d: any) => scaleX(d.label))
      .attr('cy', (d: any) => scaleY(d.value))
      .attr('r', 0)
      .transition()
      .duration(2000)
      .attr('r', 3);
  }

  public updateData(scaleX: any, scaleY: any, serie: any, data: any) {
    this.drawSymbol(data, scaleX, scaleY);
    this.chartNode.selectAll('.line').datum(data);
    this.resizeChart(scaleX, scaleY);
  }

  public resizeChart(scaleX: any, scaleY: any) {
    this.line.x((d: any) => scaleX(d.label)).y((d: any) => scaleY(d.value));

    this.chartNode
      .transition()
      .duration(300)
      .attr('transform', `translate(${scaleX.step() / 2},0)`);

    const length = Infinity;
    this.chartNode.selectAll('.line')
      .attr('stroke-dasharray', `${length} ${length}`)
      .transition()
      .duration(300)
      .attr('d', this.line);

    this.chartNode.selectAll('.line-symbol')
      .transition()
      .duration(300)
      .attr('cx', (d: any) => scaleX(d.label))
      .attr('cy', (d: any) => scaleY(d.value))
      .attr('r', 3);
  }
}
