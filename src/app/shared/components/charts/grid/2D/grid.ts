import * as d3 from 'd3';
import { YAixs } from '../../yAxis/2D/yAxis';
import { XAxis } from '../../xAxis/2D/xAxis';
import { Bar } from '../../basic-garph/2D/bar';
import { Line } from '../../basic-garph/2D/line';
import { Shade } from '../../shade/shade';
import { Tooltip } from '../../tooltip/2D/tootip';
import { Pie } from '../../basic-garph/2D/pie';
import { PieTooltip } from '../../tooltip/2D/pieTooltip';
import { Legend } from '../../legend/legend';
export class Grid {

    gridNodes: any;

    gridSizes: any[];

    constructor(option: any, svg: any) {
        this.initGrid(option, svg);
    }

    initGrid(option: any, svg: any) {
        const svgW = Number.parseInt(svg.style('width'), 10);
        const svgH = Number.parseInt(svg.style('height'), 10);
        const defs = svg.append('defs');
        this.createFilter('barBlur', defs);
        this.createTrayFilter('barTrayBlur', defs);
        svg.append('g')
            .attr('class', 'titleG')
            .attr('transform', `translate(${svgW / 2},16)`)
            .append('text')
            .text(option.title && option.title.show ? option.title.text : '')
            .attr('dominant-baseline', 'middle')
            .attr('text-anchor', 'middle')
            .style('font-weight', '600')
            .style('font-size', '14');

        if (option.legend && option.legend.show) {
            const legend = new Legend();
            legend.initLegend(svg, option, defs, svgW, svgH);
        }

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

        const isAllPie = option.series.every(item => item.type === 'pie');
        const that = this;
        this.gridNodes.each(function(gridItem, index) {
            const gridNode = d3.select(this);
            const gridSize = that.getGridsSize(svgW, svgH, gridItem, option.grid);
            const gridConfig = { gridNode, gridSize, gridIndex: index };
            if (isAllPie) {
                that.drawPieGrid(option, defs, gridConfig, index);
            } else {
                that.drawUnPieGrid(option, defs, gridConfig, index);
            }
        });
    }

    drawPieGrid(option, defs, gridConfig, index) {
        option.series.forEach(seriesItem => {
            const pie = new Pie();
            pie.initPie(gridConfig, seriesItem, option, defs);
            const pieTootip = new PieTooltip(option, pie.nodes, gridConfig.gridSize);
        });
    }


    drawUnPieGrid(option, defs, gridConfig, index) {
        const xAxisOptions = this.getGridAxis(option.xAxis, index);
        const yAxisOptions = this.getGridAxis(option.yAxis, index);

        const dataLength = xAxisOptions.length ? xAxisOptions[0].axisItem.data.length : 1;
        const axisIndex = xAxisOptions.length ? xAxisOptions[0].index : 0;

        const gridSeries = option.series.filter(seriesItem => {
            if (!seriesItem.yAxisIndex) { seriesItem.yAxisIndex = 0; }
            return yAxisOptions.some(yAxisOption => yAxisOption.index === seriesItem.yAxisIndex);
        });

        const xAxis = new XAxis();
        xAxis.initXAxis(gridConfig, xAxisOptions);

        const yAixs = new YAixs();
        yAixs.initYAxis(gridConfig, yAxisOptions, option.series);

        const barPositionInfos = [];

        gridSeries.forEach(seriesItem => {
            const yAxisIndex = seriesItem.yAxisIndex || 0;
            const rangeY = yAixs.ranges[yAxisIndex];
            if (seriesItem.type === 'bar') {
                const chartBar = new Bar();
                chartBar.initBar(gridConfig, seriesItem, option, defs, yAixs.yAxisStacks[yAxisIndex], rangeY, barPositionInfos);
            } else if (seriesItem.type === 'line') {
                const chartLine = new Line();
                chartLine.initLines(gridConfig, seriesItem, option, defs, rangeY);
            }
        });

        const shade = new Shade();
        shade.initShade(gridConfig, dataLength);
        const tooltip = new Tooltip(shade.nodes, option, gridConfig.gridSize, dataLength, axisIndex);
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
        if (rangeY.min >= 0) {
            rangeY.max = rangeY.length;
            rangeY.min = 0;
        }
        return rangeY;
    }


    getBarStacks(series) {
        const stacks = [];
        series.forEach(seriesItem => {
            const stackItem = {
                stackName: '',
                series: []
            };
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

    gridLineSeries(xAxisIndex, yAxisIndex, option) {
        const series = option.series.filter(seriesItem => {
            if (yAxisIndex === 0 && xAxisIndex === 0) {
                return (!seriesItem.yAxisIndex || !seriesItem.xAxisIndex)
                    && seriesItem.type === 'line';
            } else {
                return seriesItem.yAxisIndex === yAxisIndex
                    && seriesItem.xAxisIndex === xAxisIndex
                    && seriesItem.type === 'line';
            }
        });
        return series;
    }

    gridSeries(yAxisOptions, series, type) {
        return series.filter(seriesItem => {
            if (seriesItem.yAxisIndex === undefined) {
                seriesItem.yAxisIndex = 0;
            }
            return yAxisOptions.some(option => option.index === seriesItem.yAxisIndex) && seriesItem.type === type;
        });
    }

    getDataValue(dataItem) {
        if (Object.prototype.toString.call(dataItem) === '[object Object]') {
            return +dataItem.value;
        } else {
            return +dataItem;
        }
    }


    getGridAxis(axis, gridIndex) {
        if (!axis) { return []; }
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
