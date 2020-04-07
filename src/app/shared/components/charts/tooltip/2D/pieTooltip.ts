import * as d3 from 'd3';

export class PieTooltip {

  targetNode: any;

  dataLength: number;

  gridWidth: number;

  option: any;

  tooltipBoxPosition = 'Right';

  constructor(option, nodes, gridSize) {
    const tooltip = option.tooltip;
    let tipBox = null;
    let isMove = false;
    const that = this;
    const t = d3.transition().duration(150).ease(d3.easeLinear);
    nodes.on('mouseenter', function (d, index) {
      const node = d3.select(this);
      node.interrupt().transition(t).attr('transform', `scale(1.05)`);
      isMove = true;
      const arc = d.startAngle + (d.endAngle - d.startAngle) / 2;
      that.tooltipBoxPosition = arc > Math.PI ? 'Left' : 'Right';
      tipBox = that.createTipBox(option.chartId, that.tooltipBoxPosition);
      // that.setTootipWrapTheme(tipBox, d, tooltip);
      let tootipContentNode = tipBox.selectAll('.tipBoxContent');
      if (tootipContentNode.empty()) {
        tootipContentNode = tipBox.append('div').attr('class', 'tipBoxContent');
      }
      // tootipContentNode.style('font-size', '12px');
      tootipContentNode.attr('style', 'font-size:12px;white-space:nowrap');
      const params = {
        name: d.data.name,
        value: d.data.value
      };

      if (Object.prototype.toString.call(tooltip.formatter) === '[object Function]') {
        tootipContentNode.html(tooltip.formatter(params));
      } else {
        tootipContentNode.text(`${params.name}: ${params.value}`);
      }

      const position = that.getPosition(option.chartId, tipBox);
      tipBox.attr('style', `
                display:block;
                top: ${position.top}px;
                left: ${position.left}px;
            `);

      /*
          background: ${that.getToolTipColor(d, tooltip)};
          box-shadow: 0px 0px 10px ${that.getToolTipColor(d, tooltip)};
      */
    });

    nodes.on('mousemove', (d, index) => {
      if (isMove) {
        const position = that.getPosition(option.chartId, tipBox);
        tipBox.style('top', position.top + 'px');
        tipBox.style('left', position.left + 'px');
      }
    });

    nodes.on('mouseleave', function (d, index) {
      const node = d3.select(this);
      node.interrupt().transition(t).attr('transform', `scale(1)`);
      node.selectAll('.tootipG').remove();
      isMove = false;
      tipBox.attr('style', 'display:none');
    });
  }

  getDataValue(dataItem) {
    if (Object.prototype.toString.call(dataItem) === '[object Object]') {
      return +dataItem.value;
    } else {
      return +dataItem;
    }
  }

  setTootipWrapTheme(TootipWrapNode, d, tooltip) {
    TootipWrapNode.selectAll('.blur')
      .attr('style', `border-color:${this.getBorderColor(d, tooltip).colorbg};`);
    TootipWrapNode.selectAll('.triangle-border')
      .attr('style', `border-color:${this.getBorderColor(d, tooltip).colorBorder};`);
    TootipWrapNode.selectAll('.triangle-border .triangle-inner')
      .attr('style', `border-color:${this.getBorderColor(d, tooltip).colorbg};`);
  }

  getBorderColor(d, tooltip) {
    let colorbg = '';
    let colorBorder = '';
    switch (this.tooltipBoxPosition) {
      case 'Right':
        colorbg = `transparent ${this.getToolTipColor(d, tooltip)} transparent transparent`;
        colorBorder = `transparent #ffffff transparent transparent`;
        break;
      case 'Left':
        colorbg = `transparent transparent transparent ${this.getToolTipColor(d, tooltip)}`;
        colorBorder = `transparent transparent transparent #ffffff`;
        break;
      default:
        break;
    }
    return { colorbg, colorBorder };
  }

  getPosition(chartId: any, tipBox: any) {
    const tipBoxParent = d3.select(`#sfChart${chartId}`);
    const tipboxNode: any = tipBoxParent.node();
    const parentPosition = tipboxNode.getBoundingClientRect();
    const currentNodeHeight = tipBox.node().getBoundingClientRect().height;
    const clientX = d3.event.clientX;
    const clientY = d3.event.clientY;
    const px = parentPosition.left;
    const py = parentPosition.top;
    const left = this.tooltipBoxPosition === 'Right' ? clientX - px + 20 : clientX - px - 20;
    let top = clientY - py;
    const pBottom = parentPosition.height;
    if (top + currentNodeHeight / 2 > pBottom) {
      top = pBottom - currentNodeHeight / 2;
    } else if (top - currentNodeHeight / 2 < 0) {
      top = currentNodeHeight / 2;
    }
    return { left, top };
  }

  createTipBox(chartId, position: string) {
    const tipBox = d3.select(`#sfChart${chartId} .tipBox${position}`);
    if (!tipBox.empty()) {
      return tipBox;
    } else {
      return d3.select('#sfChart')
        .append('div')
        .attr('id', `tipBox${position}`)
        .attr('style', 'display:none;position:absolute;top:0;left:0');
    }
  }

  getToolTipColor(d, tooltip) {
    if (Object.prototype.toString.call(d.value) === '[object Object]') {
      if (d.value.tooltipStyle && d.value.tooltipStyle.color) {
        return d.value.tooltipStyle.color;
      }
    }

    if (tooltip.backgroundColor) {
      return tooltip.backgroundColor;
    } else {
      return '#ffffff';
    }
  }
}
