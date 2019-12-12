import { Symbol } from '../symbol/symbol';
import { Tooltip } from '../../tooltip/tootip';
import { Rectangle } from './barType/rectangle';
import * as d3 from 'd3';

export class Bar {

    gridConfig: any;

    series: any[];

    rangeY: any;

    option: any;

    defs: any;

    stacks = [];

    barInfos = [];

    constructor() { }

    initBar(gridConfig, seriesItem, option, defs, stacks, rangeY, barInfos) {
        this.stacks = stacks;
        this.rangeY = rangeY;
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
                return d.barGap ? `translate(${d.barGap * i}, ${d.y})` : `translate(${d.x}, ${d.y})`;
            });

        this.drawbar(nodes, seriesItem);
    }

    getDataValue(dataItem) {
        if (Object.prototype.toString.call(dataItem) === '[object Object]') {
            return +dataItem.value;
        } else {
            return +dataItem;
        }
    }

    initNodes(d) {
        if (!d.stack) {
            d.stack = d.name;
        }

        // 单位数据长度
        const scale = this.gridConfig.gridSize.height / this.rangeY.length;

        // 网格长度
        const gridW = this.gridConfig.gridSize.width;

        // 堆叠索引
        const stackItemIndex = this.stacks.findIndex(stack => stack.stackName === (d.stack || d.name));

        // 所在的目标堆叠系列
        const tarStackSeries = this.stacks[stackItemIndex].series;

        // 所在堆叠系列的索引
        const seriesGtZero = tarStackSeries.filter(item => item.data.some(dataItem => this.getDataValue(dataItem) > 0));
        const seriesLtZero = tarStackSeries.filter(item => item.data.some(dataItem => this.getDataValue(dataItem) < 0));
        const gtIndex = seriesGtZero.findIndex(item => item.name === d.name);
        const ltIndex = seriesLtZero.findIndex(item => item.name === d.name);
        // 数据长度
        const dataNum = d.data.length || 1;
        const itemWidth = gridW / dataNum;

        const precentReg = new RegExp(/^-?\d+%$/);

        let barGap = d.barGap;
        if (!barGap) {
            barGap = 0;
        } else if (precentReg.test(barGap)) {
            barGap = itemWidth * Number.parseFloat(barGap) / 100;
        }

        const preBarTakeWith = itemWidth / this.stacks.length - barGap * (this.stacks.length === 0 ? 0 : this.stacks.length - 1) / 2;
        let barWidth = d.barWidth || preBarTakeWith * 0.8;
        if (d.barMaxWidth && barWidth > d.barMaxWidth) {
            barWidth = d.barMaxWidth;
        }
        const sumBarWidth = barWidth * this.stacks.length + (this.stacks.length - 1) * barGap;
        const startX = (itemWidth - sumBarWidth) / 2;

        const barInfo = { stackName: d.stack, seriesName: d.name, info: [] };
        // 相同堆叠下最后一层
        const lastStack = this.findLastIndex(this.barInfos, d);
        const data = d.data.map((item, dataIndex) => {
            // 前一个堆叠信息
            const previousBar = lastStack ? lastStack.info[dataIndex] : null;
            const barValue = this.getDataValue(item);

            let arcPosition = 'none';
            if (gtIndex !== -1) {
                arcPosition = this.getArcPosition(gtIndex, seriesGtZero.length, seriesLtZero.length, true);
            } else if (ltIndex !== -1) {
                arcPosition = this.getArcPosition(ltIndex, seriesLtZero.length, seriesGtZero.length, false);
            }

            const y = this.getY(barValue, scale, previousBar);
            const x = this.getX(itemWidth, startX, dataIndex, previousBar, stackItemIndex, barWidth, barGap);
            const barHeight = Math.abs(barValue) * scale;
            const info = { barWidth, barHeight, x, y, value: item, arcPosition };
            barInfo.info.push(info);
            return info;
        });
        this.barInfos.push(barInfo);
        return data;
    }

    getArcPosition(index, length, length1, isUp) {
        if (isUp) {
            if (index === length - 1) {
                return 'Top';
            }
        } else {
            if (index === length - 1) {
                return 'Bottom';
            }
        }
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

    drawbar(nodes, seriesItem) {
        let barNode = null;
        barNode = new Rectangle(nodes, seriesItem, this.defs).barNode;
        // const symbol = new Symbol(nodes, seriesItem);
        // const tooltip = new Tooltip(barNode, this.option, seriesItem, this.gridConfig.gridSize);
        // 添加Symb0l
    }
}
