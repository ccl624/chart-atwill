import * as d3 from 'd3';

export class Tooltip {

    targetNode: any;

    dataNum: number;

    gridWidth: number;

    option: any;

    tooltipBoxPosition = 'Right';

    seriesItem: any;

    constructor(targetNode, option, seriesItem, gridSize) {
        const xAxis = option.xAxis3D || option.xAxis;
        const tooltip = option.tooltip;
        this.seriesItem = seriesItem;
        let tipBox = null;
        let isMove = false;
        let dataNum = 0;
        targetNode.on('mouseenter', (d, index) => {
            isMove = true;
            dataNum = this.seriesItem.data.length;
            this.tooltipBoxPosition = index >= dataNum / 2 ? 'Left' : 'Right';
            tipBox = this.createTipBox(option.chartId, this.tooltipBoxPosition);
            const left = this.getLeftValue(d, gridSize);
            const tootipWrap = tipBox.attr('style', `
                display:block;
                top: ${d3.event.offsetY}px;
                left: ${left}px;
                background: ${this.getToolTipColor(d, tooltip)};
                box-shadow: 0px 0px 10px ${this.getToolTipColor(d, tooltip)};
            `);
            this.setTootipWrapTheme(tootipWrap, d, tooltip);
            let tootipContentNode = tootipWrap.selectAll('.tipBoxContent');
            if (tootipContentNode.empty()) {
                tootipContentNode = tootipWrap.append('div').attr('class', 'tipBoxContent');
            }
            tootipContentNode.style('font-size', '12px');

            const axisX = {
                value: xAxis[this.seriesItem.xAxisIndex || 0].data[index],
                name: xAxis[this.seriesItem.xAxisIndex || 0].name
            };
            const axisY = {
                value: Object.prototype.toString.call(d.value) === '[object Object]' ? d.value.value : d.value,
                name: this.seriesItem.name
            };

            if (Object.prototype.toString.call(tooltip.formatter) === '[object Function]') {
                tootipContentNode.html(tooltip.formatter({ axisX, axisY }));
            } else {
                tootipContentNode.text(axisX.value + ': ' + axisY.value);
            }
        });

        targetNode.on('mousemove', (d, index) => {
            if (isMove) {
                const event = d3.event;
                tipBox.style('top', d3.event.offsetY + 'px');
            }
        });

        targetNode.on('mouseleave', (d, index) => {
            isMove = false;
            tipBox.attr('style', 'display:none');
        });
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

    getLeftValue(d, gridSize) {
        let left = 0;
        switch (this.tooltipBoxPosition) {
            case 'Right':
                left = gridSize.left + d.x + d.barWidth + 10;
                break;
            case 'Left':
                left = gridSize.left + d.x - 10;
                break;
            default:
                left = 0;
                break;
        }
        return left;
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
            return this.seriesItem.itemStyle.color ? this.seriesItem.itemStyle.color : '#ffffff';
        }
    }
}
