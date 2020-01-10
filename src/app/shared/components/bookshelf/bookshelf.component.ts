import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-bookshelf',
  templateUrl: './bookshelf.component.html',
  styleUrls: ['./bookshelf.component.scss']
})
export class BookshelfComponent implements OnInit {

  @ViewChild('bookshelf') bookshelf: ElementRef;

  @Input()
  public get data(): any[] {
    return this.shelfData;
  }

  public set data(data: any[]) {
    this.shelfData = data;

    if (this.shelfData && this.shelfData.length > 0) {
      this.initBookShelf();
    }
  }

  private shelfData: any[] = [];

  private shelfNodes: any;

  private width = 0;

  private height = 0;

  private svg: any;

  private U = 5;

  private forbidArea: any;

  private originArea: any;

  private parentNode: any;

  constructor() { }

  public ngOnInit() {
  }

  private initBookShelf() {

    const shelfNode = d3.select(this.bookshelf.nativeElement);
    this.width = Number.parseFloat(shelfNode.style('width'));
    this.height = Number.parseFloat(shelfNode.style('height'));

    this.svg = shelfNode.append('svg')
      .attr('class', 'shelf-svg')
      .attr('viewBox', `0 0 ${this.width} ${this.height}`)
      .attr('preserveAspectRatio', 'xMinyMin meet')
      .attr('width', '100%')
      .attr('height', '100%');

    this.shelfNodes = this.svg.selectAll('.shelf-item-g')
      .data(this.shelfData.map((shelf: any, i: number) => {
        shelf.height = 120 * this.U;
        shelf.width = 60 * this.U;
        shelf.tx = (shelf.width + 1) * i;
        shelf.ty = this.height - shelf.height;
        shelf.shelfLevels.reduce((sumY: any, level: any, j: number) => {
          level.width = shelf.width;
          level.height = 15 * this.U;
          level.ty = sumY - level.height;
          level.tx = 0;
          level.source = { isFree: false, tx: level.tx, ty: level.ty };
          level.color = d3.schemeSet3[j];
          return level.ty;
        }, shelf.height);
        return shelf;
      }))
      .enter()
      .append('g')
      .attr('class', 'shelf-item-g')
      .attr('transform', (d: any, i: number) => `translate(${d.tx},${d.ty})`);

    this.shelfNodes.append('rect')
      .attr('class', 'shelf-item-rect')
      .attr('width', (d: any) => d.width)
      .attr('height', (d: any) => d.height)
      .attr('fill', '#ffffff')
      .attr('stroke', 'orange')
      .attr('stroke-width', 0);

    const that = this;
    this.shelfNodes.each(function(d: any, i: number) {
      that.updateShelfLevel(d.shelfLevels, this, false);
    });
    this.forbidArea = this.addNoteArea({ fillColor: 'red', note: '区域已满', fontSize: 36 });
    this.originArea = this.addNoteArea({ fillColor: 'green', note: '起始位置', fontSize: 18 });
  }

  private addNoteArea(theme: any) {
    const noteArea = this.svg.append('g')
      .attr('class', 'note-area-g')
      .style('display', 'none');
    noteArea.append('rect')
      .attr('class', 'note-area-rect')
      .attr('fill', theme.fillColor)
      .attr('stroke', theme.fillColor)
      .attr('fill-opacity', 0.3)
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '5,5');
    noteArea.append('text')
      .attr('class', 'note-area-text')
      .text(theme.note)
      .attr('fill', '#ffffff')
      .attr('opacity', 0.8)
      .style('font-size', theme.fontSize)
      .style('font-weight', '600')
      .attr('dominant-baseline', 'middle')
      .attr('text-anchor', 'middle');
    return noteArea;
  }

  private showNoteArea(area: any, isShow: boolean, node?: any) {
    if (isShow) {
      area.style('display', 'block')
        .attr('transform', `translate(${node.tx},${node.ty})`);

      area.selectAll('.note-area-rect')
        .attr('width', node.width)
        .attr('height', node.height);

      area.selectAll('.note-area-text')
        .attr('x', node.width / 2)
        .attr('y', node.height / 2);
    } else {
      area.style('display', 'none');
    }
  }

  private initContent(enter: any) {
    const shelfLevelGs = enter.append('g')
      .attr('class', 'shelf-level-g')
      .attr('cursor', 'pointer')
      .attr('transform', (p: any, j: number) => `translate(${p.tx},${p.ty})`);

    shelfLevelGs.append('rect')
      .attr('class', 'shelf-level-rect')
      .attr('width', (p: any) => p.width)
      .attr('height', (p: any) => p.height)
      .attr('fill', (p: any, i: number) => p.color)
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1);

    shelfLevelGs.append('text')
      .attr('class', 'shelf-level-text')
      .attr('x', (p: any) => p.width / 2)
      .attr('y', (p: any) => p.height / 2)
      .text((p: any) => p.id)
      .attr('fill', '#333')
      .style('font-size', 12)
      .style('font-weight', '600')
      .attr('dominant-baseline', 'middle')
      .attr('text-anchor', 'middle');

    shelfLevelGs.call(this.dragEvent());
  }

  private updateShelfLevel(nodes: any[], parentNode: any, isUpdate = false) {
    const shelfLevelUpdate = d3.select(parentNode).selectAll('.shelf-level-g').data(nodes);
    shelfLevelUpdate.exit().remove();
    shelfLevelUpdate.attr('transform', (p: any, j: number) => `translate(${p.tx},${p.ty})`);
    this.initContent(shelfLevelUpdate.enter());
  }

  private breakoutToFree(node: any, parentNode: any, d: any) {
    const p = d3.select(parentNode).datum();
    if (p && !d.isFree) {
      d.tx = p.tx;
      d.ty = d.ty + p.ty;
      node.attr('class', 'free-shlef-level').attr('transform', `translate(${d.tx},${d.ty})`);
      this.showNoteArea(this.originArea, true, d);

      const index = p.shelfLevels.findIndex((shelfLevel: any) => shelfLevel.id === node.datum().id);
      if (index !== -1) {
        p.shelfLevels.splice(index, 1);
        this.updateShelfLevel(p.shelfLevels, parentNode);
      }

      this.svg.node().appendChild(node.node());
      d.isFree = true;

    }
  }


  private nextFrame(node: any, nodes: any[], p: any, parentNode: any) {
    window.requestAnimationFrame(() => {
      this.updateShelfLevel(nodes, parentNode);
      this.internalCollision(node, nodes, p, parentNode);
    });
  }

  private internalCollision(tarNode: any, nodes: any[], p: any, parentNode: any) {
    nodes.forEach((node: any) => {
      if (node.id !== tarNode.id) {
        const collision = this.checkCollision(tarNode, node);

        if (collision.isCollision) {
          node.ty = node.ty + collision.py * this.U;
          this.nextFrame(node, nodes, p, parentNode);
        }
      }

      if (node.ty + node.height > p.height) {
        node.ty = p.height - node.height;
        this.nextFrame(node, nodes, p, parentNode);
      }

      if (node.ty < 0) {
        node.ty = 0;
        this.nextFrame(node, nodes, p, parentNode);
      }

    });
  }

  private backToNewParent(node: any, parentNode: any, d: any) {
    const p = d3.select(parentNode).datum();
    if (p && d.isFree) {
      node.attr('class', 'shelf-level-g');
      d.tx = 0;
      d.ty = Math.round((d.ty - p.ty) / this.U) * this.U;
      d.isFree = false;

      const nodeData = node.datum();
      p.shelfLevels.push(nodeData);

      this.internalCollision(nodeData, p.shelfLevels, p, parentNode);
      this.updateShelfLevel(p.shelfLevels, parentNode);
    }
    node.remove();
  }

  private backToOriginParent(node: any, parentNode: any, d: any) {
    const p = d3.select(parentNode).datum();
    if (p && d.isFree) {
      node.attr('class', 'shelf-level-g');
      d.tx = d.source.tx;
      d.ty = d.source.ty;
      d.isFree = false;

      const nodeData = node.datum();
      p.shelfLevels.push(nodeData);
      this.updateShelfLevel(p.shelfLevels, parentNode);

      this.showNoteArea(this.forbidArea, false);
    }
    node.remove();
  }

  private updateSource(node: any, isFree: boolean) {
    node.source = { isFree: false, tx: node.tx, ty: node.ty };
  }

  private dragEvent() {
    const that = this;
    return d3.drag()
      .on('start', function (d: any, i: number) {
        const node = d3.select(this);
        that.parentNode = this.parentNode;
        that.updateSource(d, false);
        that.breakoutToFree(node, this.parentNode, d);
      }).on('drag', function (d: any) {
        const event = d3.event;
        const node = d3.select(this);
        d3.select(this).attr('transform', `translate(${d.tx + event.dx},${d.ty + event.dy})`);
        d.tx += event.dx;
        d.ty += event.dy;
        that.checkCollisionWidthShelfs(node, d, that.shelfNodes, false);
      }).on('end', function (d: any) {
        const node = d3.select(this);
        that.checkCollisionWidthShelfs(node, d, that.shelfNodes, true);
        that.showNoteArea(that.originArea, false);
      });
  }

  private checkCollisionWidthShelfs(node: any, d: any, shelfNodes: any, isDragEnd: boolean) {
    const that = this;
    let hasDeepCross = false;
    let deepShelf: any;
    let deepShelfNode: any;
    shelfNodes.each(function (shelf: any, index: number) {
      const collision = that.checkCollision(d, shelf);
      if (collision.isDeepCross) {
        hasDeepCross = true;
        deepShelf = shelf;
        deepShelfNode = this;
      }
    });

    if (hasDeepCross) {
      const totalH = deepShelf.shelfLevels.reduce((sumH: number, level: any) => level.height + sumH, 0);
      if (totalH + d.height <= deepShelf.height && isDragEnd) {
        this.backToNewParent(node, deepShelfNode, d);
      } else if (totalH + d.height > deepShelf.height && isDragEnd) {
        this.backToOriginParent(node, this.parentNode, d);
      } else if (totalH + d.height > deepShelf.height && !isDragEnd) {
        this.showNoteArea(this.forbidArea, true, deepShelf);
      } else if (totalH + d.height <= deepShelf.height && !isDragEnd) {
        this.showNoteArea(this.forbidArea, false);
      }
    } else if (isDragEnd && !hasDeepCross) {
      that.backToOriginParent(node, that.parentNode, d);
    }
  }

  private getCenter(node: any) {
    const x = node.tx + node.width / 2;
    const y = node.ty + node.height / 2;
    return { x, y };
  }

  private checkCollision(source: any, target: any) {
    const sourceCenter = this.getCenter(source);
    const targetCenter = this.getCenter(target);
    const disX = Math.abs(targetCenter.x - sourceCenter.x);
    const disY = Math.abs(targetCenter.y - sourceCenter.y);
    const px = disX === 0 ? 1 : (targetCenter.x - sourceCenter.x) / disX;
    const py = disY === 0 ? 1 : (targetCenter.y - sourceCenter.y) / disY;
    const criticalLength = { x: (source.width + target.width) / 2, y: (source.height + target.height) / 2 }
    const isXCollision = disX < criticalLength.x;
    const isYCollision = disY < criticalLength.y;
    const isXDeepCollision = disX >= 0 && (disX <= source.width / 2 || disX <= target.width / 2);
    const isYDeepCollision = disY >= 0 && (disY <= source.height / 2 || disY <= target.height / 2);
    return {
      isCollision: isXCollision && isYCollision,
      isDeepCross: isXDeepCollision && isYDeepCollision,
      px,
      py
    };
  }
}
