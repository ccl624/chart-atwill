import { Symbol } from '../symbol/symbol';
import { Tooltip } from '../../tooltip/tootip';
import { Cylinder, SquarePillars } from './barType';

import * as d3 from 'd3';

export class Bar3D {

    gridConfig: any;

    series: any[];

    rangeY: any;

    option: any;

    defs: any;

    stacks: any;

    barInfos = [];

    constructor() {
    }

    initBar(gridConfig, seriesItem, option, defs, stacks, rangeY, barInfos) {
        this.rangeY = rangeY;
        this.stacks = stacks;
        this.gridConfig = gridConfig;
        this.option = option;
        this.defs = defs;
        this.barInfos = barInfos;
        const seriesG = this.gridConfig.gridNode
            .selectAll('bar2Dg')
            .data(this.initNodes(seriesItem))
            .enter();
        const nodes = seriesG.append('g')
            .attr('class', 'bar2Dg')
            .style('cursor', 'pointer')
            .attr('transform', (d, i) => {
                return d.barGap ? `translate(${d.barGap * i + d.barWidth}, ${d.y})` : `translate(${d.x}, ${d.y})`;
            });

        this.draw3Dbar(nodes, seriesItem);
    }

    getDataValue(dataItem) {
        let value = 0;
        if (Object.prototype.toString.call(dataItem) === '[object Object]') {
            value = +dataItem.value;
        } else {
            value = +dataItem;
        }
        return value;
    }

    initNodes(d) {
        if (!d.stack) {
            d.stack = d.name;
        }

        if (!d.barGap) {
            d.barGap = 0;
        }
        const scale = this.gridConfig.gridSize.height / this.rangeY.length;
        const gridW = this.gridConfig.gridSize.width - 30;
        const stackItemIndex = this.stacks.findIndex(stack => stack.stackName === (d.stack || d.name));
        const tarStackSeries = this.stacks[stackItemIndex].series;
        // const seriesIndex = tarStackSeries.findIndex(item => item.name === d.name);
        const dataNum = d.data.length || 1;
        const itemWidth = gridW / dataNum;
        const preBarTakeWith = itemWidth / this.stacks.length - d.barGap * (this.stacks.length === 0 ? 0 : this.stacks.length - 1) / 2;
        let barWidth = d.barWidth || preBarTakeWith * 0.8;
        if (d.barMaxWidth && barWidth > d.barMaxWidth) {
            barWidth = d.barMaxWidth;
        }
        const barGap = d.barGap;
        const sumBarWidth = barWidth * this.stacks.length + (this.stacks.length - 1) * d.barGap;
        const startX = (itemWidth - sumBarWidth) / 2;
        const barInfo = { stackName: d.stack, seriesName: d.name, info: [] };
        // 相同堆叠下最后一层
        const lastStack = this.findLastIndex(this.barInfos, d);
        const data = d.data.map((item, dataIndex) => {
            // 前一个堆叠信息
            const previousBar = lastStack ? lastStack.info[dataIndex] : null;
            const barValue = this.getDataValue(item);
            const y = this.getY(barValue, scale, previousBar);
            const x = this.getX(itemWidth, startX, dataIndex, previousBar, stackItemIndex, barWidth, barGap);
            const barHeight = Math.abs(barValue) * scale;
            const info = { barWidth, barHeight, x, y, value: item };
            barInfo.info.push(info);
            return info;
        });
        this.barInfos.push(barInfo);
        return data;
    }

    findLastIndex(array = [], tarElement) {
        let lastStack = null;
        for (let index = 0; index < array.length; index++) {
            const element = array[array.length - index - 1];
            if (element.stackName === tarElement.stack) {
                lastStack = element;
                break;
            }
        }
        return lastStack;
    }

    getY(barValue, scale, previousBar) {
        let y = 0;
        if (previousBar) {
            if (barValue < 0) {
                y = previousBar.y + previousBar.barHeight;
            } else {
                y = previousBar.y - barValue * scale;
            }
        } else {
            if (barValue < 0) {
                y = scale * (this.rangeY.max);
            } else {
                y = (this.rangeY.max - barValue) * scale;
            }
        }
        return y;
    }

    getX(itemWidth, startX, dataIndex, previousBar, stackItemIndex, barWidth, barGap) {
        if (previousBar) {
            return previousBar.x;
        } else {
            return itemWidth * dataIndex + startX + stackItemIndex * (barWidth + barGap);
        }
    }

    getStackValue(tarStackSeries, seriesIndex, dataIndex) {
        let value = 0;
        for (let index = 0; index <= seriesIndex; index++) {
            value += Math.abs(this.getDataValue(tarStackSeries[index].data[dataIndex]));
        }
        return value;
    }

    draw3Dbar(nodes, seriesItem) {
        let barNode = null;
        if (this.option.theme === 'Cylinder') {
            barNode = new Cylinder(nodes, seriesItem, this.defs).barNode;
            const symbol = new Symbol(nodes, seriesItem);
        } else if (this.option.theme === 'SquarePillars') {
            barNode = new SquarePillars(nodes, seriesItem, this.defs).barNode;
            // const symbol = new Symbol(nodes, seriesItem);
        }
        // const tooltip = new Tooltip(barNode, this.option, seriesItem, this.gridConfig.gridSize);
        // 添加Symb0l
    }
}
