import * as d3 from 'd3';
export class Symbol {

    nodes: any;
    seriesItem: any;
    constructor(nodes, seriesItem) {
        this.nodes = nodes;
        this.seriesItem = seriesItem;
        this.initSymbol();
    }

    initSymbol() {
        const r = 5;
        const height = 24;

        const symbolG = this.nodes.append('g')
            .attr('class', 'SymbolG')
            .attr('transform', (d) => {
                const symbolWidth = this.getSymbolWidth(d);
                return `translate(${(-symbolWidth + d.barWidth) / 2},-${height + 10})`;
            });

        symbolG.append('path')
            .attr('class', 'SymbolGPath')
            .attr('d', (d) => {
                const symbolWidth = this.getSymbolWidth(d);
                if (!this.seriesItem.symbol || !this.seriesItem.symbol.show) {
                    return '';
                }
                return `
                    M0,${r}
                    L0,${height - r}
                    a${r},${r} 0 0,0 ${r},${r}
                    L${symbolWidth / 2 - 4},${height}
                    L${symbolWidth / 2},${height + 4}
                    L${symbolWidth / 2 + 4},${height}
                    L${symbolWidth - r},${height}
                    a${r},${r} 0 0,0 ${r},-${r}
                    L${symbolWidth},${r}
                    a${r},${r} 0 0,0 -${r},-${r}
                    L${r},0
                    a${r},${r} 0 0,0 -${r},${r}
                    L0,0
                `;
            })
            .attr('fill', (d, i) => {
                if (Object.prototype.toString.call(d.value) === '[object Object]') {
                    if (d.value.itemStyle && d.value.itemStyle.color) {
                        if (typeof d.value.itemStyle.color === 'object' && d.value.itemStyle.color.type === 'linear') {
                            return d.value.itemStyle.color.colorStops[0].color;
                        } else {
                            return d.value.itemStyle.color;
                        }
                    }
                }
                return this.seriesItem.itemStyle.color;
            });
        // .attr('stroke', 'red')
        // .attr('stroke-width', 1);

        symbolG.append('text')
            .text((d) => {
                if (!this.seriesItem.symbol || !this.seriesItem.symbol.show) {
                    return '';
                }
                return Object.prototype.toString.call(d.value) === '[object Object]' ? d.value.value : d.value;
            })
            .attr('x', (d) => this.getSymbolWidth(d) / 2)
            .attr('y', height / 2 + 2)
            .attr('dominant-baseline', 'middle')
            .attr('text-anchor', 'middle')
            .style('fill', '#333f4c')
            .style('font-size', '12px');
    }

    getSymbolWidth(d) {
        const span = d3.select('body').append('span').style('display', 'inline-block')
            .text(Object.prototype.toString.call(d.value) === '[object Object]' ? d.value.value : d.value);
        const spanWidth = Number.parseInt(span.style('width'), 10) + 10;
        span.remove();
        return spanWidth;
    }
}
