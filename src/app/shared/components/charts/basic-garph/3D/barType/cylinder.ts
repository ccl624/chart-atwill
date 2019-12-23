export class Cylinder {

    barNode: any;

    defs: any;

    seriesItem: any;

    constructor(nodes, seriesItem, defs) {
        this.defs = defs;
        this.seriesItem = seriesItem;
        this.createLinear(nodes);
        this.draw3DbarShadow(nodes);
        this.draw3Dbar(nodes);
    }

    draw3Dbar(nodes) {
        const cylinderG = nodes.append('g')
            .attr('class', 'CylinderG');
        cylinderG.append('ellipse')
            .attr('class', 'barBottomTray')
            .attr('cx', d => d.barWidth / 2)
            .attr('cy', d => d.barHeight - 10)
            .attr('rx', d => d.barWidth / 2 + 4)
            .attr('ry', 7)
            .attr('fill', '#666')
            .attr('filter', 'url(#bar3DTrayBlur)');

        cylinderG.append('ellipse')
            .attr('class', 'barBottomTray')
            .attr('cx', d => d.barWidth / 2)
            .attr('cy', d => d.barHeight - 10)
            .attr('rx', d => d.barWidth / 2 + 4)
            .attr('ry', 7)
            .attr('fill', '#7d8c9c');

        cylinderG.append('ellipse')
            .attr('class', 'barBottom')
            .attr('cx', d => d.barWidth / 2)
            .attr('cy', d => d.barHeight - 10)
            .attr('rx', d => d.barWidth / 2)
            .attr('ry', 6)
            .attr('fill', (d) => this.getBarBottomColor(d))
            .attr('opacity', 0.8);

        cylinderG.append('rect')
            .attr('class', 'bar2DRect')
            .attr('width', d => d.barWidth)
            .attr('height', d => d.barHeight - 10 < 0 ? 0 : d.barHeight - 10)
            .attr('fill', d => d.barColor)
            .attr('stroke-width', 0)
            .attr('opacity', 0.8);

        cylinderG.append('ellipse')
            .attr('class', 'barTop')
            .attr('cx', d => d.barWidth / 2)
            .attr('cy', 0)
            .attr('rx', d => d.barWidth / 2)
            .attr('ry', d => d.barWidth / 10)
            .attr('fill', d => d.barHeight ? d.barColor : 'none');

        this.barNode = cylinderG;

        if (Object.prototype.toString.call(this.seriesItem.onItemClick) === '[object Function]') {
            cylinderG.style('cursor', 'pointer');
            cylinderG.on('click', this.seriesItem.onItemClick);
        }
    }

    createLinear(nodes) {
        nodes.each((d, i) => {
            if (Object.prototype.toString.call(d.value) === '[object Object]') {
                if (typeof d.value.itemStyle.color === 'object' && d.value.itemStyle.color.type === 'linear') {
                    this.createLinearGradient(`linearGradient${d.value.value}${i}`, d.value.itemStyle.color);
                }
            }
            d.barColor = this.getBarColor(d.value, i);
        });
    }

    createLinearGradient(id, color) {
        const linearGradient = this.defs.append('linearGradient')
            .attr('id', id)
            .attr('x1', color.x1)
            .attr('y1', color.y1)
            .attr('x2', color.x2)
            .attr('y2', color.y2);

        linearGradient.append('stop')
            .attr('offset', color.colorStops[0].offset)
            .style('stop-color', color.colorStops[0].color);

        linearGradient.append('stop')
            .attr('offset', color.colorStops[1].offset)
            .style('stop-color', color.colorStops[1].color);
    }

    getBarColor(value, i) {
        if (Object.prototype.toString.call(value) === '[object Object]') {
            if (value.itemStyle && value.itemStyle.color) {
                if (typeof value.itemStyle.color === 'object' && value.itemStyle.color.type === 'linear') {
                    return `url(#linearGradient${value.value}${i})`;
                } else {
                    return value.itemStyle.color;
                }
            }
        } else if (
            this.seriesItem.itemStyle
            && this.seriesItem.itemStyle.color
            && Object.prototype.toString.call(this.seriesItem.itemStyle.color) === '[object Object]'
        ) {
            return `url(#seriesItemColorlinearGradient${this.seriesItem.name})`;
        }
        return this.seriesItem.itemStyle.color;
    }

    getBarBottomColor(d) {
        if (Object.prototype.toString.call(d.value) === '[object Object]') {
            if (d.value.itemStyle && d.value.itemStyle.color) {
                if (typeof d.value.itemStyle.color === 'object' && d.value.itemStyle.color.type === 'linear') {
                    return d.value.itemStyle.color.colorStops[1].color;
                } else {
                    return d.value.itemStyle.color;
                }
            }
        }
        return this.seriesItem.itemStyle.color;
    }

    // 实现圆柱阴影
    draw3DbarShadow(nodes) {
        nodes.append('g')
            .attr('class', 'cylinderShadowG')
            .append('path')
            .attr('d', (d) => {
                const height = d.barHeight - 10;
                const barWidth = d.barWidth;
                return `
                        M0,0 L0,${height}
                        a${barWidth / 2},${barWidth / 10} 180 0,0 ${barWidth},0
                        L${barWidth},0
                        a${barWidth / 2},${barWidth / 10} 0 0,0 -${barWidth},0
                        Z
                    `;
            })
            .attr('fill', 'none')
            .attr('stroke', d => d.barColor)
            .attr('stroke-width', 3)
            .attr('filter', 'url(#bar3DBlur)');
    }
}

