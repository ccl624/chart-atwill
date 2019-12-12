import { XAxis3D } from '../../xAxis/3D/xAxis3D';
import { YAixs3D } from '../../yAxis/3D/yAxis3D';
import { Bar3D } from '../../basic-garph/3D/bar3d';
import { Line3D } from '../../basic-garph/3D/line';
import { Shade3D } from '../../shade/shade3D';
import { Tooltip } from '../../tooltip/3D/tootip';
import * as d3 from 'd3';

export class Grid3D {

    gridNodes: any;

    gridSizes: any[];

    constructor(option: any, svg: any) {
        this.initGrid(option, svg);
    }

    initGrid(option: any, svg: any) {
        const svgW = Number.parseInt(svg.style('width'), 10);
        const svgH = Number.parseInt(svg.style('height'), 10);
        const defs = svg.append('defs');
        this.createFilter('bar3DBlur', defs);
        this.createTrayFilter('bar3DTrayBlur', defs);
        const that = this;
        svg.append('g')
            .attr('class', 'titleG')
            .attr('transform', `translate(${svgW / 2},16)`)
            .append('text')
            .text(option.title && option.title.show ? option.title.text : '')
            .attr('dominant-baseline', 'middle')
            .attr('text-anchor', 'middle')
            .style('font-weight', '600')
            .style('font-size', '14');

        this.gridNodes = svg.append('g')
            .attr('class', 'gridWrapG')
            .selectAll('.gridItemWrapG')
            .data(option.grid)
            .enter()
            .append('g')
            .attr('class', 'gridItemWrapG')
            .attr('transform', (d, i) => {
                return `translate(${d.left}, ${d.top + i * svgH / 2})`;
            });

        this.gridNodes.each(function(gridItem, index) {
            const gridNode = d3.select(this);
            const gridSize = that.getGridsSize(svgW, svgH, gridItem, option.grid);
            const gridConfig = { gridNode, gridSize, gridIndex: index };
            const xAxisOptions = that.getGridAxis(option.xAxis3D, index);
            const yAxisOptions = that.getGridAxis(option.yAxis3D, index);

            const dataLength = xAxisOptions[0].axisItem.data.length;
            const axisIndex = xAxisOptions[0].index;

            const gridSeries = option.series.filter(seriesItem => {
                if (!seriesItem.yAxisIndex) { seriesItem.yAxisIndex = 0; }
                return yAxisOptions.some(yAxisOption => yAxisOption.index === seriesItem.yAxisIndex);
            });

            const yAixs3D = new YAixs3D();
            yAixs3D.initYAxis(gridConfig, yAxisOptions, gridSeries);

            const xAxis3D = new XAxis3D();
            xAxis3D.initXAxis(gridConfig, xAxisOptions, yAixs3D.ranges[0]);
            const barPositionInfos = [];
            gridSeries.forEach(seriesItem => {
                const yAxisIndex = seriesItem.yAxisIndex || 0;
                const yAixs3DItem = yAxisOptions.find(item => item.index === yAxisIndex).axisItem;
                const rangeY = { max: yAixs3DItem.max, min: yAixs3DItem.min, length: yAixs3DItem.max - yAixs3DItem.min };
                if (seriesItem.type === 'bar3D') {
                    const chartBar3D = new Bar3D();
                    const yAxisIndexSeries = gridSeries.filter(seriesItem1 => {
                        if (!seriesItem1.yAxisIndex) { seriesItem1.yAxisIndex = 0; }
                        return seriesItem1.yAxisIndex === yAxisIndex;
                    });
                    const stacks = yAixs3D.getBarStacks(yAxisIndexSeries);
                    chartBar3D.initBar(gridConfig, seriesItem, option, defs, stacks, rangeY, barPositionInfos);
                } else if (seriesItem.type === 'line') {
                    const chartLine = new Line3D();
                    chartLine.initLines(gridConfig, seriesItem, option, defs, rangeY);
                }
            });

            const shade3D = new Shade3D();
            shade3D.initShade(gridConfig, dataLength, option.shade);
            const tooltip = new Tooltip(shade3D.nodes, option, gridSize, dataLength, axisIndex, index);
        });
    }

    getBarMaxY(stacks) {
        const rangeY = { min: 0, max: 0, length: 0 };
        const aaa = stacks.map(stack => {
            const sum = new Array();
            stack.series.forEach((item) => {
                item.data.forEach((element, index) => {
                    const value = this.getDataValue(element);
                    if (value > rangeY.max) {
                        rangeY.max = value;
                    }
                    if (value < rangeY.min) {
                        rangeY.min = value;
                    }
                    sum[index] = (sum[index] || 0) + Math.abs(value);
                });
            });
            return sum;
        });
        rangeY.length = Math.max.apply(null, aaa.map(item => Math.max.apply(null, item)));
        if (rangeY.min > 0) {
            rangeY.max = rangeY.length;
            rangeY.min = 0;
        }
        return rangeY;
    }

    getDataValue(dataItem) {
        if (Object.prototype.toString.call(dataItem) === '[object Object]') {
            return +dataItem.value;
        } else {
            return +dataItem;
        }
    }

    getBarStacks(series) {
        const stacks = [];
        series.forEach(seriesItem => {
            const stackItem = { stackName: '', series: [] };
            if (typeof seriesItem.stack === 'string' && seriesItem.stack) {
                stackItem.stackName = seriesItem.stack;
                const tarStack = stacks.find(stack => stack.stackName === stackItem.stackName);
                if (tarStack) {
                    tarStack.series.push(seriesItem);
                } else {
                    stackItem.series.push(seriesItem);
                    stacks.push(stackItem);
                }
            } else {
                stackItem.stackName = seriesItem.name;
                stackItem.series.push(seriesItem);
                stacks.push(stackItem);
            }
        });
        return stacks;
    }

    gridSeries(yAxisOptions, series, type) {
        return series.filter(seriesItem => {
            if (seriesItem.yAxisIndex === undefined) {
                seriesItem.yAxisIndex = 0;
            }
            return yAxisOptions.some(option => option.index === seriesItem.yAxisIndex) && seriesItem.type === type;
        });
    }

    getGridAxis(axis, gridIndex) {
        return axis.map((axisItem, index) => {
            return { axisItem, index };
        }).filter(item => {
            if (gridIndex === 0) {
                return !item.axisItem.gridIndex;
            } else {
                return item.axisItem.gridIndex === gridIndex;
            }
        });
    }


    getAxisIndex(axis, gridConfig) {
        let axisIndex = axis.findIndex(axisItem => axisItem.gridIndex === gridConfig.gridIndex);
        if (axisIndex === -1) {
            axisIndex = 0;
        }
        return axisIndex;
    }

    getGridsSize(svgW, svgH, gridItem, grids) {
        const gridNum = grids.length;
        const gridWidth = svgW - gridItem.left - gridItem.right;
        const gridHeight = svgH / gridNum - gridItem.top - gridItem.bottom;
        const gridSize = { width: gridWidth, height: gridHeight, left: gridItem.left, right: gridItem.right };
        return gridSize;
    }

    createFilter(id, defs) {
        const filter = defs.append('filter')
            .attr('id', id);

        filter.append('feGaussianBlur')
            .attr('result', 'blurOut')
            .attr('in', 'SourceGraphic')
            .attr('stdDeviation', 5);
    }

    createTrayFilter(id, defs) {
        const filter = defs.append('filter')
            .attr('id', id);

        filter.append('feGaussianBlur')
            .attr('result', 'blurOut')
            .attr('in', 'offOut')
            .attr('stdDeviation', 3);
    }
}
