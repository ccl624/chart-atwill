import * as d3 from 'd3';

export class Pie {

  nodes: any;

  constructor() { }

  initPie(gridConfig, seriesItem: any, option: any, defs: any) {
    const w = gridConfig.gridSize.width;
    const h = gridConfig.gridSize.height;
    const rMax = Math.min(w, h);
    const startR = this.setRatio(seriesItem.radius[0]) * rMax / 2;
    const endR = this.setRatio(seriesItem.radius[1]) * rMax / 2;
    const centerX = this.setRatio(seriesItem.center[0]) * w;
    const centerY = this.setRatio(seriesItem.center[1]) * h;
    const centerR = startR + (endR - startR) / 2;
    const pieData = d3.pie().sort(null)
      .value((d: any) => d.value)(seriesItem.data)
      .map((d: any, index) => {
        if (Object.prototype.toString.call(d.data.itemStyle.color) === '[object Object]') {
          this.createRadialGradient(defs, option.chartId + seriesItem.name + d.data.name + index, d,
            this.setRatio(seriesItem.radius[1]) * rMax / 2);
        }
        const arc = d.startAngle + (d.endAngle - d.startAngle) / 2;
        d.my = -Math.cos(arc) * centerR;
        d.mx = Math.sin(arc) * centerR;
        d.cx = d.mx + centerX;
        d.cy = d.my + centerY;
        return d;
      });

    const arcPath = d3.arc()
      .innerRadius(startR)
      .outerRadius(endR);

    const pieGwrap = gridConfig.gridNode.append('g').attr('class', 'pieGwrap');

    const pieNodes = pieGwrap.selectAll('.pieG')
      .data(pieData)
      .enter()
      .append('g')
      .attr('class', '.pieG')
      .attr('transform', `translate(${centerX},${centerY})`);

    const gItemWrap = pieNodes
      .append('g')
      .attr('class', 'gItemWrap');

    gItemWrap.append('path')
      .attr('class', 'pie')
      .attr('d', (d, index) => {
        return arcPath(d);
      });

    gItemWrap.attr('fill', (d, index) => `url(#${option.chartId + seriesItem.name + d.data.name + index})`)
      .attr('stroke', (d, index) => `url(#${option.chartId + seriesItem.name + d.data.name + index})`)
      .attr('style', 'cursor:pointer');

    const textNodes = pieGwrap.selectAll('.textG')
      .data(pieData)
      .enter()
      .append('g')
      .attr('class', '.pieG')
      .attr('transform', `translate(${centerX},${centerY})`);

    textNodes.append('text')
      .text(d => d.data.name)
      .attr('fill', seriesItem.label.show === false ? 'none' : '#ffffff')
      .attr('dominant-baseline', 'middle')
      .attr('text-anchor', 'middle')
      .style('font-size', 12)
      .style('pointer-events', 'none')
      .attr('transform', d => {
        // const arc = d.startAngle + (d.endAngle - d.startAngle) / 2;
        // const y = -Math.cos(arc) * centerR;
        // const x = Math.sin(arc) * centerR;
        return `translate(${d.mx},${d.my})`;
      });


    const t = d3.transition().duration(150).ease(d3.easeLinear);
    this.nodes = gItemWrap;
  }

  setRatio(ratio: any) {
    if (typeof ratio === 'number') {
      return ratio / 100;
    } else if (typeof ratio === 'string') {
      const tarValue = Number.parseFloat(ratio);
      return Number.isNaN(tarValue) ? 0 : tarValue / 100;
    } else {
      return 0;
    }
  }

  createRadialGradient(defs, id, d, r) {
    const color = d.data.itemStyle.color;
    const radialGradient = defs.append('radialGradient')
      .attr('id', id)
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('radius', r)
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', r);

    color.colorStops.forEach(colorStop => {
      radialGradient.append('stop')
        .attr('offset', colorStop.offset)
        .style('stop-color', colorStop.color)
        .attr('stop-opacity', 1);
    });
  }
}
