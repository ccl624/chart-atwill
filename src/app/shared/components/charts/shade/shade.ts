export class Shade {

    nodes: any;

    constructor() { }

    initShade(gridConfig: any, dataNum: number) {
        const shadeGNode = gridConfig.gridNode.append('g')
            .attr('class', 'shadeGwrap')
            .selectAll('shadeG')
            .data(this.nodeData(dataNum, gridConfig.gridSize))
            .enter();

        this.nodes = shadeGNode.append('g')
            .attr('class', 'shadeG')
            .append('rect')
            .attr('x', d => d.x)
            .attr('y', d => d.y)
            .attr('width', d => d.w)
            .attr('height', d => d.h)
            .style('cursor', 'pointer')
            .attr('fill', 'rgba(0,0,0,0)');
    }

    nodeData(dataNum, gridSize) {
        if (dataNum === 0) { dataNum = 1; }
        const data = [];
        const tw = gridSize.width;
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
