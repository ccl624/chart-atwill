import * as d3 from 'd3';

export class Tooltip {

    targetNode: any;

    dataLength: number;

    gridWidth: number;

    option: any;

    tooltipBoxPosition = 'Right';

    constructor(targetNode, option, gridSize, dataLength, axisIndex, gridIndex) {
        const xAxis = option.xAxis3D || option.xAxis;
        const tooltip = option.tooltip;
        let tipBox = null;
        let isMove = false;
        const that = this;
        const hoverNode = targetNode.selectAll('.frontSauare');
        targetNode.on('mouseenter', function(d, index) {
            that.showNode(d3.select(this));
            isMove = true;
            that.tooltipBoxPosition = index >= dataLength / 2 ? 'Left' : 'Right';
            tipBox = that.createTipBox(option.chartId, that.tooltipBoxPosition);
            // that.setTootipWrapTheme(tipBox, d, tooltip, index, gridIndex);
            let tootipContentNode = tipBox.selectAll('.tipBoxContent');
            if (tootipContentNode.empty()) {
                tootipContentNode = tipBox.append('div').attr('class', 'tipBoxContent');
            }
            // tootipContentNode.style('font-size', '12px');
            tootipContentNode.attr('style', 'font-size:12px;white-space:nowrap');
            const params = option.series.map(seriesItem => {
                return {
                    axisIndex,
                    axisValue: option.xAxis3D[axisIndex].data[index],
                    axisName: option.xAxis3D[axisIndex].name || '',
                    seriesName: seriesItem.name,
                    value: that.getDataValue(seriesItem.data[index])
                };
            });

            const paramsTostr = params.reduce((sumStr, param) => {
                return sumStr + `${param.seriesName}: ${param.value}\n`;
            }, '');

            if (Object.prototype.toString.call(tooltip.formatter) === '[object Function]') {
                tootipContentNode.html(tooltip.formatter(params));
            } else {
                tootipContentNode.text(`${option.xAxis[axisIndex].data[index]}: ${paramsTostr}`);
            }

            const position = that.getPosition(option.chartId, tipBox);
            tipBox.attr('style', `
                display:block;
                top: ${position.top}px;
                left: ${position.left}px;
            `);

            // background: ${that.getToolTipColor(d, tooltip, index, gridIndex)};
            // box-shadow: 0px 0px 10px ${that.getToolTipColor(d, tooltip, index, gridIndex)};
        });

        targetNode.on('mousemove', (d, index) => {
            if (isMove) {
                const event = d3.event;
                const position = that.getPosition(option.chartId, tipBox);
                tipBox.style('top', position.top + 'px');
                tipBox.style('left', position.left + 'px');
                //     tipBox.attr('style', `
                //     display:block;
                //     top: ${position.top}px;
                //     left: ${position.left}px;
                //     background: ${that.getToolTipColor(d, tooltip, index, gridIndex)};
                //     box-shadow: 0px 0px 10px ${that.getToolTipColor(d, tooltip, index, gridIndex)};
                // `);
            }
        });

        targetNode.on('mouseleave', function(d, index) {
            d3.select(this).selectAll('path').attr('fill', 'rgba(0,0,0,0)');
            isMove = false;
            tipBox.attr('style', 'display:none');
        });

        if (option.shade && Object.prototype.toString.call(option.shade.onItemClick) === '[object Function]') {
            targetNode.on('click', (d, index) => {
                const params = option.series.map(seriesItem => {
                    return {
                        axisIndex,
                        axisValue: option.xAxis3D[axisIndex].data[index],
                        axisName: option.xAxis3D[axisIndex].name || '',
                        seriesName: seriesItem.name,
                        value: that.getDataValue(seriesItem.data[index])
                    };
                });
                option.shade.onItemClick(params);
            });
        }
    }

    getDataValue(dataItem) {
        if (Object.prototype.toString.call(dataItem) === '[object Object]') {
            return +dataItem.value;
        } else {
            return +dataItem;
        }
    }

    setTootipWrapTheme(TootipWrapNode, d, tooltip, index, gridIndex) {
        TootipWrapNode.selectAll('.blur')
            .attr('style', `border-color:${this.getBorderColor(d, tooltip, index, gridIndex).colorbg};`);
        TootipWrapNode.selectAll('.triangle-border')
            .attr('style', `border-color:${this.getBorderColor(d, tooltip, index, gridIndex).colorBorder};`);
        TootipWrapNode.selectAll('.triangle-border .triangle-inner')
            .attr('style', `border-color:${this.getBorderColor(d, tooltip, index, gridIndex).colorbg};`);
    }

    getBorderColor(d, tooltip, index, gridIndex) {
        let colorbg = '';
        let colorBorder = '';
        switch (this.tooltipBoxPosition) {
            case 'Right':
                colorbg = `transparent ${this.getToolTipColor(d, tooltip, index, gridIndex)} transparent transparent`;
                colorBorder = `transparent #ffffff transparent transparent`;
                break;
            case 'Left':
                colorbg = `transparent transparent transparent ${this.getToolTipColor(d, tooltip, index, gridIndex)}`;
                colorBorder = `transparent transparent transparent #ffffff`;
                break;
            default:
                break;
        }
        return { colorbg, colorBorder };
    }

    getPosition(chartId, tipBox) {
        const tipBoxParent = d3.select(`#sfChart${chartId}`);
        const parentPosition = tipBoxParent.node().getBoundingClientRect();
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

    getToolTipColor(d, tooltip, index, gridIndex) {
        if (Object.prototype.toString.call(d.value) === '[object Object]') {
            if (d.value.tooltipStyle && d.value.tooltipStyle.color) {
                return d.value.tooltipStyle.color;
            }
        }

        if (tooltip.backgroundColor) {
            if (Object.prototype.toString.call(tooltip.backgroundColor) === '[object Array]') {
                if (Object.prototype.toString.call(tooltip.backgroundColor[gridIndex]) === '[object Array]') {
                    return tooltip.backgroundColor[gridIndex][0];
                } else {
                    return tooltip.backgroundColor[index];
                }
            } else {
                return tooltip.backgroundColor;
            }
        } else {
            return '#ffffff';
        }
    }

    showNode(node) {
        node.select('.rightSauare').attr('fill', 'rgba(0,0,0,0.15)');
        node.select('.frontSauare').attr('fill', 'rgba(0,0,0,0.05)');
        node.select('.topSauare').attr('fill', 'rgba(0,0,0,0.1)');
        node.select('.bottomSauare').attr('fill', 'rgba(0,0,0,0.05)');
        // node.select('.leftSauare').attr('fill', 'rgba(0,0,0,0.05)');
    }
}
