
export class Legend {
    constructor() { }

    initLegend(svg, option, defs, svgW, svgH) {
        const legend = option.legend;
        const totalData = option.series.reduce((sum, seriesItem) => {
            return [...sum, ...seriesItem.data];
        }, []);

        const legendNodes = svg.append('g')
            .attr('class', 'legnedGwrap')
            .attr('transform', 'translate(10,10)')
            .selectAll('.legendG')
            .data(legend.data)
            .enter()
            .append('g')
            .attr('class', '.legendG');

        legendNodes.append('rect')
            .attr('class', 'legendRect')
            .attr('x', 0)
            .attr('y', (d, i) => i * 30)
            .attr('rx', 5)
            .attr('ry', 5)
            .attr('width', 24)
            .attr('height', 14)
            .attr('fill', (d, i) => {
                const color = totalData.find(item => item.name === d).itemStyle.color;
                this.createLinearGradient(d + i, color, defs);
                return `url(#${d + i})`;
            });

        legendNodes.append('text')
            .attr('class', 'legendText')
            .text(d => d)
            .attr('fill', '#333f4c')
            .attr('x', 24 + 5)
            .attr('y', (d, i) => i * 30 + 8)
            .attr('dominant-baseline', 'middle')
            .attr('text-anchor', 'start')
            .style('font-size', '12px');
    }


    createLinearGradient(id, color, defs) {
        const linearGradient = defs.append('linearGradient')
            .attr('id', id)
            .attr('x1', 0)
            .attr('y1', 0)
            .attr('x2', 0)
            .attr('y2', 1);

        color.colorStops.forEach(colorStop => {
            linearGradient.append('stop')
                .attr('offset', colorStop.offset)
                .style('stop-color', colorStop.color)
                .attr('stop-opacity', 1);
        });
    }
}
