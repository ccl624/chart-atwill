import * as SHAP from 'd3-shape';
import * as EASE from 'd3-ease';
import * as TS from 'd3-transition';

export class Line {

  private chartNode: any;

  private line: any;

  private area: any;

  private serie: any;

  private data: any[];

  private initTs: any = TS.transition().duration(2000).ease(EASE.easeLinear);

  private resizeTs: any = TS.transition().duration(300).ease(EASE.easeLinear);

  private scaleX: any;

  private scaleY: any;

  private minMax: any;

  private changeIndex = 0;

  constructor(svg: any, serie: any, data: any[], scaleX: any, scaleY: any, minMax: any) {
    this.chartNode = svg.append('g').attr('class', 'chart-g');
    this.updateChart(serie, data, scaleX, scaleY, minMax);
  }

  private updateData(serie: any, data: any[], scaleX: any, scaleY: any, minMax: any) {
    this.serie = serie;
    this.data = data;
    this.scaleX = scaleX;
    this.scaleY = scaleY;
    this.minMax = minMax;
  }

  private updateClipAreaParams() {
    const x0 = this.scaleX(this.data[0].label);
    const x1 = this.scaleX(this.data[this.data.length - 1].label);
    const y0 = this.scaleY(this.minMax.min);
    const y1 = this.scaleY(this.minMax.max);
    return { w: x1 - x0, h: y0 - y1, x0, x1, y0, y1 };
  }

  private defindLine() {
    const line = SHAP.line().x((d: any) => this.scaleX(d.label)).y((d: any) => this.scaleY(d.value));
    if (this.serie.smooth) {
      line.curve(SHAP.curveMonotoneX);
    }
    return line;
  }

  private defindArea() {
    const area = SHAP.area()
      .defined((d: any) => !isNaN(d.value))
      .x((d: any) => this.scaleX(d.label))
      .y0(this.scaleY(this.minMax.min))
      .y1((d: any) => this.scaleY(d.value));

    if (this.serie.smooth) {
      area.curve(SHAP.curveMonotoneX);
    }
    return area;
  }

  private updateClipArea() {
    const cp = this.updateClipAreaParams();
    const clipPathUpdate = this.chartNode.selectAll('.clip-defs').data([this.changeIndex]);
    clipPathUpdate.selectAll('#area-clip rect')
      .transition(this.resizeTs)
      .attr('x', cp.x0)
      .attr('y', cp.y1)
      .attr('height', cp.h)
      .attr('width', cp.w);
    const clipPathEnter = clipPathUpdate.enter();
    const clipPathExit = clipPathUpdate.exit();

    const clipPath = clipPathEnter.append('defs')
      .attr('class', 'clip-defs')
      .append('clipPath')
      .attr('stroke', 'blue')
      .attr('id', 'area-clip');

    clipPath.append('rect')
      .attr('x', cp.x0)
      .attr('y', cp.y1)
      .attr('height', cp.h)
      .transition(this.initTs)
      .attr('width', cp.w);
    clipPathExit.remove();
  }

  private updateArea() {
    if (this.serie.areaStyle) {
      const areaUpdate = this.chartNode.selectAll('.area-g')
        .data([this.changeIndex]);

      areaUpdate.selectAll('.area').datum(this.data)
        .transition(this.resizeTs)
        .attr('d', this.area);

      const areaEnter = areaUpdate.enter();
      const areaExit = areaUpdate.exit();
      areaEnter.append('g')
        .attr('class', 'area-g')
        .append('path')
        .attr('class', 'area')
        .datum(this.data)
        .attr('fill', '#c23531')
        .attr('fill-opacity', '0.6')
        .attr('clip-path', 'url(#area-clip)')
        .attr('d', this.area);

      areaExit.remove();
    }
  }

  private updatePath() {
    const lineUpdate = this.chartNode.selectAll('.line-g')
      .data([this.changeIndex]);
    lineUpdate.selectAll('.line').datum(this.data)
      .transition(this.resizeTs)
      .attr('d', this.line);
    const lineEnter = lineUpdate.enter();
    const lineExit = lineUpdate.exit();
    lineEnter.append('g')
      .attr('class', 'line-g')
      .append('path')
      .attr('class', 'line')
      .datum(this.data)
      .attr('fill', 'none')
      .attr('stroke', '#c23531')
      .attr('stroke-width', 1.5)
      .attr('clip-path', 'url(#area-clip)')
      .attr('d', this.line);

    lineExit.remove();
  }

  private drawSymbol() {
    const symbolUpdate = this.chartNode.selectAll('.symbol-g').data(this.data);
    symbolUpdate.selectAll('circle')
      .transition(this.resizeTs)
      .attr('cx', (d: any) => this.scaleX(d.label))
      .attr('cy', (d: any) => this.scaleY(d.value));
    const sumbolEnter = symbolUpdate.enter();
    sumbolEnter.append('g')
      .attr('class', 'symbol-g')
      .append('circle')
      .attr('class', 'line-symbol')
      .attr('stroke', 'red')
      .attr('stroke-width', 1)
      .attr('fill', '#fff')
      .attr('cx', (d: any) => this.scaleX(d.label))
      .attr('cy', (d: any) => this.scaleY(d.value))
      .attr('r', 0)
      .transition(this.initTs)
      .attr('r', 3);
    symbolUpdate.exit().remove();
  }

  private drawChart() {
    this.chartNode.transition(this.resizeTs).attr('transform', `translate(${this.scaleX.step() / 2},0)`);
    this.updateClipArea();
    this.updateArea();
    this.updatePath();
    this.drawSymbol();
  }

  public resizeChart() {
    this.line = this.defindLine();
    if (this.serie.areaStyle) {
      this.area = this.defindArea();
    }
    this.drawChart();
  }

  public updateChart(serie: any, data: any[], scaleX: any, scaleY: any, minMax: any) {
    this.updateData(serie, data, scaleX, scaleY, minMax);
    this.changeIndex++;
    this.resizeChart();
  }
}
