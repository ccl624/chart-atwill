export class Rectangle {

    barNode: any;

    defs: any;

    seriesItem: any;

    constructor(parent, seriesItem, defs) {
        this.defs = defs;
        this.seriesItem = seriesItem;
        this.createLinear(parent);
        this.drawBar(parent, seriesItem);
    }

    drawBar(parent, seriesItem) {
        this.barNode = parent.append('g').attr('class', 'RectangleG');
        this.barNode.append('path')
            .attr('class', 'RectangleBar')
            .attr('d', d => {
                const w = d.barWidth;
                const h = d.barHeight;
                if (h < w && h > w / 2) {
                    if (d.arcPosition === 'Bottom') {
                        return `M0,0 L0,${h - w / 2} a${w / 2},${w / 2} 0 0,0 ${w},0 L${w},0 Z`;
                    } else if (d.arcPosition === 'Top') {
                        return `M0,${w / 2} L0,${h} L${w},${h} L${w},${w / 2} a${w / 2},${w / 2} 0 0,0 -${w},0 Z`;
                    } else if (d.arcPosition === 'Both') {
                        return `M0,${h / 2}
                        a${w / 2},${h / 2} 0 0,0 ${w},0
                        a${w / 2},${h / 2} 0 0,0 -${w},0 Z`;
                    } else {
                        return `M0,0 L0,${h} L${w},${h} L${w},0 Z`;
                    }
                } else if (h <= w / 2) {
                    if (d.arcPosition === 'Bottom') {
                        return `M0,0 a${w / 2},${h} 0 0,0 ${w},0 Z`;
                    } else if (d.arcPosition === 'Top') {
                        return `M0,${h} L${w},${h} a${w / 2},${h} 0 0,0 -${w},0 Z`;
                    } else if (d.arcPosition === 'Both') {
                        return `M0,${h / 2}
                        a${w / 2},${h / 2} 0 0,0 ${w},0
                        a${w / 2},${h / 2} 0 0,0 -${w},0 Z`;
                    } else {
                        return `M0,0 L0,${h} L${w},${h} L${w},0 Z`;
                    }
                } else {
                    if (d.arcPosition === 'Bottom') {
                        return `M0,0 L0,${h - w / 2} a${w / 2},${w / 2} 0 0,0 ${w},0 L${w},0 Z`;
                    } else if (d.arcPosition === 'Top') {
                        return `M0,${w / 2} L0,${h} L${w},${h} L${w},${w / 2} a${w / 2},${w / 2} 0 0,0 -${w},0 Z`;
                    } else if (d.arcPosition === 'Both') {
                        return `M0,${w / 2}
                        L0,${h - w / 2}
                        a${w / 2},${w / 2} 0 0,0 ${w},0
                        L${w},${w / 2}
                        a${w / 2},${w / 2} 0 0,0 -${w},0 Z`;
                    } else {
                        return `M0,0 L0,${h} L${w},${h} L${w},0 Z`;
                    }
                }
            }).attr('fill', d => {
                if (d.barHeight) {
                    return d.barColor;
                } else {
                    return 'rgba(255,255,255,0)';
                }
            });

        // rectangleG.append('rect')
        //     .attr('class', 'RectangleRect')
        //     .attr('x', 0)
        //     .attr('y', 0)
        //     .attr('width', d => d.barWidth)
        //     .attr('height', d => d.barHeight)
        //     .attr('fill', seriesItem.itemStyle.color);
    }


    createLinear(nodes) {

        if (Object.prototype.toString.call(this.seriesItem.itemStyle) === '[object Object]') {
            if (typeof this.seriesItem.itemStyle.color === 'object' && this.seriesItem.itemStyle.color.type === 'linear') {
                this.createLinearGradient(`seriesItemColorlinearGradient${this.seriesItem.name}`, this.seriesItem.itemStyle.color);
            }
        }

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
}
