import { Injectable } from '@angular/core';
import * as d3 from 'd3';
@Injectable()
export class SfChartService {

  constructor() { }

  public getMinAndMax(option: any) {
    const maxValues = [];
    const minValues = [];
    if (!option || !option.series) {
      return { min: 0, max: 0 };
    }
    option.series.forEach((serie: any) => {
      const data = serie.data.map((dataItem: any) => dataItem.value || dataItem);
      const maxValue = d3.max(data);
      const minValue = d3.min(data);
      maxValues.push(maxValue);
      minValues.push(minValue);
    });
    const max = option.yAxis.max || d3.max(maxValues);
    const min = option.yAxis.min || d3.min(minValues);

    return { max, min };
  }

  public precentToNum(num: any, total?: number) {
    return typeof num === 'number' ?
      num : typeof num === 'string' ?
        num.indexOf('%') !== -1 ?
          total * Number.parseFloat(num) / 100 : num.indexOf('px') !== -1 ?
            Number.parseFloat(num) || 0 : 0 : 0;
  }

  public getChartMargin(option: any, width: number, height: number) {
    const gridLeft = option.grid && option.grid.left;
    const left = this.precentToNum(gridLeft, width);

    const gridRight = option.grid && option.grid.right;
    const right = this.precentToNum(gridRight, width);

    const gridBottom = option.grid && option.grid.bottom;
    const bottom = this.precentToNum(gridBottom, height);

    const gridTop = option.grid && option.grid.top;
    const top = this.precentToNum(gridTop, height);

    return { left, right, top, bottom };
  }
}
