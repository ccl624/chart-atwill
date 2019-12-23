export class SquarePillars {

    barNode: any;

    defs: any;

    constructor(nodes, seriesItem, defs) {
        this.defs = defs;
        this.createLinearGradient(`SquarePillarsTopLinearGradient_${seriesItem.name}`, seriesItem.itemStyle.topColor);
        this.createLinearGradient(`SquarePillarsFrontLinearGradient_${seriesItem.name}`, seriesItem.itemStyle.frontColor);
        this.createLinearGradient(`SquarePillarsRightLinearGradient_${seriesItem.name}`, seriesItem.itemStyle.rightColor);
        this.draw3DbarShadow(nodes);
        this.draw3Dbar(nodes, seriesItem);
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

    draw3DbarShadow(nodes) {

    }

    draw3Dbar(nodes, seriesItem) {
        const z = 10;
        const x = 20;
        const y = 0;
        const SquarePillarsG = nodes.append('g').
            attr('class', 'SquarePillarsG');


        SquarePillarsG.append('path')
            .attr('class', 'rightSauare')
            .attr('d', (d, i) => {
                const width = d.barWidth;
                const height = d.barHeight + y;
                return `
                 M${width},0
                 L${width},${height}
                 L${x + width},${height - z}
                 L${x + width},${-z} L${width},${0}
                 Z
                `;
            }).attr('fill', `url(#SquarePillarsRightLinearGradient_${seriesItem.name})`)
            .attr('stroke', `url(#SquarePillarsRightLinearGradient)_${seriesItem.name})`)
            .attr('stroke-width', 1);



        SquarePillarsG.append('path')
            .attr('class', 'frontSauare')
            .attr('d', (d, i) => {
                const width = d.barWidth;
                const height = d.barHeight + y;
                return `
                 M0,0
                 L0,${height}
                 L${width},${height}
                 L${width},${0}
                 Z
                `;
            }).attr('fill', `url(#SquarePillarsFrontLinearGradient_${seriesItem.name})`)
            .attr('stroke', `url(#SquarePillarsFrontLinearGradient_${seriesItem.name})`)
            .attr('stroke-width', 1);


        SquarePillarsG.append('path')
            .attr('class', 'topSauare')
            .attr('d', (d, i) => {
                const width = d.barWidth;
                if (d.barHeight === 0) { return ''; }
                return `
                 M0,0
                 L${width},0
                 L${x + width},${-z}
                 L${x},${-z}
                 Z
                `;
            })
            .attr('fill', `url(#SquarePillarsTopLinearGradient_${seriesItem.name})`)
            .attr('stroke', `url(#SquarePillarsTopLinearGradient_${seriesItem.name})`)
            .attr('stroke-width', 1);



        SquarePillarsG.append('path')
            .attr('class', 'bottomSauare')
            .attr('d', (d, i) => {
                const width = d.barWidth;
                const height = d.barHeight + y;
                if (d.barHeight === 0) { return ''; }
                return `
                 M0,${height}
                 L${width},${height}
                 L${x + width},${height - z}
                 L${x},${height - z}
                 Z
                `;
            }).attr('fill', seriesItem.itemStyle.bottomColor)
            .attr('stroke', seriesItem.itemStyle.bottomColor)
            .attr('stroke-width', 1);

        this.barNode = SquarePillarsG;
    }
}
