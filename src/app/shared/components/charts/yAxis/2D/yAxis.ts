import * as d3 from 'd3';

export class YAixs {

    max = 0;

    min = 0;

    gridConfig: any;

    tw = 0;

    th = 0;

    series: any;

    ranges = [];

    yAxisStacks = [];

    constructor() { }

    initYAxis(gridConfig, yAxisOptions, series) {
        this.tw = gridConfig.gridSize.width;
        this.th = gridConfig.gridSize.height;
        this.series = series;
        yAxisOptions.forEach((yAxisOption, index) => {
            this.drawAxis(gridConfig, yAxisOption.axisItem, index);
        });
    }

    getYAxisRange(yAxisIndex) {
        const yAxisIndexSeries = this.series.filter(seriesItem => {
            if (!seriesItem.yAxisIndex) { seriesItem.yAxisIndex = 0; }
            return seriesItem.yAxisIndex === yAxisIndex;
        });
        const stacks = this.getBarStacks(yAxisIndexSeries);
        this.yAxisStacks.push(stacks);
        const rangeY = this.getRangeY(stacks);
        return rangeY;
    }

    getRangeY(stacks) {
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

    getDataValue(dataItem) {
        if (Object.prototype.toString.call(dataItem) === '[object Object]') {
            return +dataItem.value;
        } else {
            return +dataItem;
        }
    }

    getValues(series) {
        const values = [];
        series.forEach(serie => {
            const data = serie.data.map(dataItem => {
                if (Object.prototype.toString.call(dataItem) === '[object Object]') {
                    return +dataItem.value;
                } else {
                    return +dataItem;
                }
            });
            values.push(Math.max.apply(null, data));
        });
        return values;
    }

    getLabels(axisItem, rangeY) {
        if (axisItem.max === undefined || axisItem.max === null) {
            axisItem.max = rangeY.max;
        } else {
            rangeY.max = axisItem.max;
        }
        if (axisItem.min === undefined || axisItem.max === null) {
            axisItem.min = rangeY.min;
        } else {
            rangeY.min = axisItem.min;
        }

        let ticks = [];
        if(axisItem.interval){
            const ticksNum = (axisItem.max - axisItem.min)/axisItem.interval;
            for (let index = 0; index <= ticksNum; index++) {
                ticks.push(axisItem.min + index * axisItem.interval);
            }
        }else{
            ticks = d3.scaleLinear().domain([axisItem.min, axisItem.max]).nice().ticks(10);
        }
        return ticks;
    }

    getLabelsValues(axisItem, axisItemIndex) {
        const labelValues = [];
        const rangeY = this.getYAxisRange(axisItemIndex);
        this.ranges.push(rangeY);
        const ticks = this.getLabels(axisItem, rangeY);
        rangeY.max = ticks[ticks.length - 1];
        rangeY.min = ticks[0];
        rangeY.length = rangeY.max - rangeY.min;
        // const itemLength = rangeY.length / ticks.length;
        ticks.forEach((tick, index) => {
            const value = tick;
            const k = (tick - rangeY.min) / rangeY.length;
            const y = this.th * (1 - k);
            const x = axisItemIndex === 0 ? 0 : this.tw;
            labelValues.push({ x, y, value });
        });
        return labelValues;
    }

    drawAxisBottom(nodes, axisItem, axisItemIndex) {
        nodes.append('g')
            .attr('class', 'YAxis BottomG')
            .attr('transform', `translate(0, ${this.th + 10})`)
            .append('path')
            .attr('class', 'YAxis Bottom')
            .attr('d', `M20,0 L${this.tw - 30},0 L${this.tw},-14 L50,-14 Z`)
            .attr('stroke-width', 1)
            .attr('stroke', axisItem.axisBottom
                && axisItem.axisBottom.borderColor
                ? axisItem.axisBottom.borderColor
                : '#000000')
            .attr('fill', axisItem.axisBottom
                && axisItem.axisBottom.color
                ? axisItem.axisBottom.color
                : '#eee')
            .attr('shape-rendering', 'optimizeSpeed');

    }

    drawAxisLine(nodes, axisItem, axisItemIndex) {
        nodes.append('g')
            .attr('class', 'YAxis LeftG')
            .attr('transform', axisItemIndex === 0 ? `translate(0, ${-10})` : `translate(${this.tw}, ${-10})`)
            .append('path')
            .attr('class', 'YAxis Left')
            .attr('d', ` M0,0 L0,${this.th + 10}`)
            .attr('stroke-width', 1)
            .attr('stroke', axisItem.axisLine
                && axisItem.axisLine.color
                ? axisItem.axisLine.color
                : '#000000')
            .attr('shape-rendering', 'optimizeSpeed');
    }

    drawSplitLine(nodeGroups, axisItem, axisItemIndex) {
        nodeGroups.append('path')
            .attr('d', axisItemIndex === 0 ? `M0,0 L${this.tw},0` : `M${0},0 L${-this.tw},0`)
            .attr('stroke-width', axisItem.splitLine.show ? 1 : 0)
            .attr('stroke', axisItem.splitLine
                && axisItem.splitLine.color
                ? axisItem.splitLine.color
                : '#000000')
            .attr('fill', 'none')
            .attr('shape-rendering', 'optimizeSpeed');
    }

    drawLabel(nodeGroups, axisItem, axisItemIndex) {
        nodeGroups.append('text')
            .text((d) => {
                if(Object.prototype.toString.call(axisItem.axisLabel.formatter) === '[object Function]'){
                    return axisItem.axisLabel.formatter(d.value);
                }else{
                    return d.value;
                }
            })
            .attr('x', axisItemIndex === 0 ? -15 : 15)
            .attr('y', 0)
            .attr('dominant-baseline', 'middle')
            .attr('text-anchor', axisItemIndex === 0 ? 'end' : 'start')
            .style('fill', axisItem.axisLabel
                && axisItem.axisLabel.color
                ? axisItem.axisLabel.color
                : '#000000')
            .style('font-size', '12px');
    }

    drawAxisTick(nodeGroups, axisItem, axisItemIndex) {
        nodeGroups.append('path')
            .attr('d', axisItemIndex === 0 ? 'M0,0 L-10,0' : `M0,0 L10,0`)
            .attr('stroke-width', 1)
            .attr('stroke', axisItem.axisTick
                && axisItem.axisTick.color
                ? axisItem.axisTick.color
                : '#000000')
            .attr('fill', 'none')
            .attr('shape-rendering', 'optimizeSpeed');
    }

    drawAxisName(nodes, axisItem, axisItemIndex) {
        nodes.append('text')
            .text(axisItem.name)
            .attr('x', axisItemIndex === 0 ? 10 : this.tw - 10)
            .attr('y', -20)
            .attr('style', 'font-weight:600')
            .attr('fill', axisItem.axisName
                && axisItem.axisName.color
                ? axisItem.axisName.color
                : '#000000')
            .style('font-size', '12px')
            .attr('text-anchor', 'middle');
    }

    drawAxis(gridConfig, axisItem, axisItemIndex) {
        const YAxisNodes = gridConfig.gridNode.append('g')
            .attr('class', 'YAxis GWrap');

        const nodes = YAxisNodes.selectAll('.lineG')
            .data(this.getLabelsValues(axisItem, axisItemIndex))
            .enter();

        const nodeGroups = nodes.append('g')
            .attr('class', 'lineG')
            .attr('transform', (d, i) => `translate(${d.x}, ${d.y})`);

        this.drawAxisTick(nodeGroups, axisItem, axisItemIndex);

        this.drawAxisLine(YAxisNodes, axisItem, axisItemIndex);

        this.drawAxisName(YAxisNodes, axisItem, axisItemIndex);

        this.drawSplitLine(nodeGroups, axisItem, axisItemIndex);

        this.drawLabel(nodeGroups, axisItem, axisItemIndex);
    }
}
