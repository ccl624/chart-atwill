import * as d3 from 'd3';
export class XAxis3D {

    tw = 0;

    th = 0;

    rangeY: any;

    constructor() { }

    initXAxis(gridConfig, xAxisOptions, rangeY) {
        this.tw = gridConfig.gridSize.width;
        this.th = gridConfig.gridSize.height;
        this.rangeY = rangeY;

        xAxisOptions.forEach(xAxisOption => {
            const data = this.getNodesData(xAxisOption.axisItem);
            this.drawAxis(gridConfig, xAxisOption.axisItem, data);
        });
    }

    getShowItem(data, index) {
        if (data[index] && data[index].show) {
            return data[index];
        } else if (data[index] && !data[index].show) {
            return this.getShowItem(data, index - 1);
        } else {
            return data[0];
        }
    }

    getNodesData(axisItem) {
        const tickNum = axisItem.data.length;
        const scale = (this.tw - 30) / tickNum;
        const data = axisItem.data.map((label, index) => {
            const x = scale * index;
            const left = x;
            const right = x + this.getTextWidth(label);
            return { label, x, right, left };
        });

        data.forEach((dataItem, index) => {
            if (index === 0) {
                dataItem.show = true;
            } else {
                const previousShowedItem = this.getShowItem(data, index - 1);
                dataItem.show = dataItem.left > previousShowedItem.right + 10;
            }
        });

        return data;
    }

    drawSplitLine(nodeGroups, axisItem) {
        nodeGroups.append('path')
            .attr('d', ` M0,0 L30,-14 L30,${-this.th - 14}`)
            .attr('stroke-width', !axisItem.splitLine || axisItem.splitLine.show ? 1 : 0)
            .attr('stroke', axisItem.splitLine
                && axisItem.splitLine.color
                ? axisItem.splitLine.color
                : '#000000')
            .attr('fill', 'none')
            .attr('shape-rendering', 'optimizeSpeed');
    }

    drawLabel(nodeGroups, axisItem) {
        const tickNum = axisItem.data.length;
        const scale = (this.tw - 30) / tickNum;
        const textNodes = nodeGroups.append('text')
            .text((d) => d.label)
            .attr('x', scale / 2)
            .attr('y', 15)
            .attr('dominant-baseline', 'middle')
            .attr('text-anchor', 'middle')
            .attr('fill', (d) => {
                if (d.show) {
                    return axisItem.axisLabel
                        && axisItem.axisLabel.color
                        ? axisItem.axisLabel.color
                        : '#000000';
                } else {
                    return 'none';
                }

            })
            .style('font-size', '12px');

        if (Object.prototype.toString.call(axisItem.onLabelClick) === '[object Function]') {
            textNodes.attr('fill', '#40d6c0')
                .style('cursor', 'pointer')
                .style('text-decoration', 'underline');
            textNodes.on('click', axisItem.onLabelClick);
        }
    }

    drawAxisLine(XAxis3DWrap, axisItem) {
        XAxis3DWrap.append('g')
            .attr('class', 'XAxis3DAxisLineG')
            .attr('transform', (d) => {
                return `translate(0, ${this.rangeY.min / this.rangeY.length * this.th})`;
            })
            .append('path')
            .attr('class', 'XAxis3DAxisLine')
            .attr('d', ` M0,${this.th} L${this.tw},${this.th}`)
            .attr('stroke-width', !axisItem.axisLine
                || axisItem.axisLine.show
                ? 1
                : 0)
            .attr('stroke', axisItem.axisLine
                && axisItem.axisLine.color
                ? axisItem.axisLine.color
                : '#000000')
            .attr('shape-rendering', 'optimizeSpeed');
    }

    drawAxis(gridConfig, axisItem, data) {
        const XAxis3DWrap = gridConfig.gridNode.append('g')
            .attr('class', 'XAxis3DWrap');

        const nodes = XAxis3DWrap.selectAll('lineG')
            .data(data)
            .enter();

        const nodeGroups = nodes.append('g')
            .attr('class', 'lineG')
            .attr('transform', (d, i) => {
                return `translate(${d.x}, ${this.th})`;
            });

        this.drawAxisLine(XAxis3DWrap, axisItem);
        this.drawSplitLine(nodeGroups, axisItem);
        this.drawLabel(nodeGroups, axisItem);
    }

    getLabelTotalLength(xAxis) {
        return xAxis.map(item => {
            const length = item.data.reduce((sum, dataItem) => {
                return sum += this.getTextWidth(dataItem);
            }, 0);
            return length;
        });
    }

    getTextWidth(text) {
        if (!text) {
            return 0;
        }
        const span = d3.select('body').append('span').style('display', 'inline-block')
            .text(text);
        const spanWidth = Number.parseInt(span.style('width'), 10) + 10;
        span.remove();
        return spanWidth;
    }
}
