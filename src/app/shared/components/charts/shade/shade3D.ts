export class Shade3D {

    nodes: any;

    constructor() { }

    initShade(gridConfig: any, dataNum: number, shade) {
        const shadeGNode = gridConfig.gridNode.append('g')
            .attr('class', 'shadeGwrap')
            .selectAll('shadeG')
            .data(this.nodeData(dataNum, gridConfig.gridSize))
            .enter();

        this.nodes = shadeGNode.append('g')
            .attr('class', 'shadeG')
            .attr('transform', d => `translate(${d.x},0)`)
            .attr('style', 'cursor:pointer');



        const z = 10;
        const x = 20;
        const y = 0;

        this.nodes.append('path')
            .attr('class', 'rightSauare shadeItem')
            .attr('d', (d, i) => {
                const width = d.w;
                const height = d.h + y;
                return `
                 M${width},0
                 L${width},${height}
                 L${x + width},${height - z}
                 L${x + width},${-z} L${width},${0}
                 Z
                `;
            }).attr('fill', `rgba(0,0,0,0)`);

        // this.nodes.append('path')
        //     .attr('class', 'leftSauare shadeItem')
        //     .attr('d', (d, i) => {
        //         const width = d.w;
        //         const height = d.h + y;
        //         return `
        //          M0,0
        //          L0,${height}
        //          L${x},${height - z}
        //          L${x},${-z} L0,0
        //          Z
        //         `;
        //     }).attr('fill', `rgba(0,0,0,0)`);

        this.nodes.append('path')
            .attr('class', 'frontSauare shadeItem')
            .attr('d', (d, i) => {
                const width = d.w;
                const height = d.h + y;
                return `
                 M0,0
                 L0,${height}
                 L${width},${height}
                 L${width},${0}
                 Z
                `;
            }).attr('fill', `rgba(0,0,0,0)`);


        this.nodes.append('path')
            .attr('class', 'topSauare shadeItem')
            .attr('d', (d, i) => {
                const width = d.w;
                return `
                 M0,0
                 L${width},0
                 L${x + width},${-z}
                 L${x},${-z}
                 Z
                `;
            }).attr('fill', `rgba(0,0,0,0)`);



        this.nodes.append('path')
            .attr('class', 'bottomSauare shadeItem')
            .attr('d', (d, i) => {
                const width = d.w;
                const height = d.h + y;
                return `
                 M0,${height}
                 L${width},${height}
                 L${x + width},${height - z}
                 L${x},${height - z}
                 Z
                `;
            }).attr('fill', `rgba(0,0,0,0)`);
    }

    nodeData(dataNum, gridSize) {
        if (dataNum === 0) { dataNum = 1; }
        const data = [];
        const tw = gridSize.width - 30;
        const th = gridSize.height;
        for (let index = 0; index < dataNum; index++) {
            const w = tw / dataNum;
            const h = th;
            const x = w * index;
            const y = 0;
            const element = { x, y, w, h };
            data.push(element);
        }
        return data;
    }
}
