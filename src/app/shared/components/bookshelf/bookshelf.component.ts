import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-bookshelf',
  templateUrl: './bookshelf.component.html',
  styleUrls: ['./bookshelf.component.scss']
})
export class BookshelfComponent implements OnInit, AfterViewInit {

  @ViewChild('bookshelf') bookshelf: ElementRef;

  private width = 0;

  private height = 0;

  private svg: any;

  constructor() { }

  public ngOnInit() {
  }

  public ngAfterViewInit() {
    const shelfNode = d3.select(this.bookshelf.nativeElement);
    this.width = Number.parseFloat(shelfNode.style('width'));
    this.height = Number.parseFloat(shelfNode.style('height'));

    const minL = d3.min([this.width, this.height]);

    console.log(minL);

    this.svg = shelfNode.append('svg')
      .attr('class', 'shelf-svg')
      .attr('width', '100%')
      .attr('height', '100%');


    const shelfNodes = this.svg.selectAll('.shelf-item-g')
      .data([1, 2, 3].map((d: any, i) => ({
        value: d,
        width: 200,
        height: 400,
        translateX: i * 205,
        translateY: 0,
        level: 8,
        shelfLevels: [1, 2, 3, 4, 5, 6]
      })))
      .enter()
      .append('g')
      .attr('class', 'shelf-item-g')
      .attr('transform', (d: any, i: number) => {
        return `translate(${d.translateX},${d.translateY})`;
      })
      .call(this.dragEvent());

    shelfNodes.append('rect')
      .attr('class', 'shelf-item-rect')
      .attr('width', 200)
      .attr('height', 400)
      .attr('fill', 'pink')
      .attr('stroke', 'orange')
      .attr('stroke-width', 5);

    const that = this;
    shelfNodes.each(function (d: any, i: number) {
      const shelfLevelNodes = d3.select(this).selectAll('.shelf-level-g')
        .data(d.shelfLevels.map((p: any, j: number) => ({
          value: p,
          width: 200,
          height: 50,
          translateX: 0,
          translateY: (d.level - 1 - j) * 50
        })))
        .enter()
        .append('g')
        .attr('class', 'shelf-level-g')
        .attr('cursor', 'pointer')
        .call(that.dragEvent())
        .attr('transform', (p: any, j: number) => {
          return `translate(${p.translateX},${p.translateY})`;
        });

      shelfLevelNodes.append('rect')
        .attr('class', 'shelf-level-rect')
        .attr('width', 200)
        .attr('height', 50)
        .attr('fill', 'green')
        .attr('stroke', 'orange')
        .attr('stroke-width', 5);

      shelfLevelNodes.append('text')
        .attr('class', 'shelf-level-text')
        .attr('x', 100)
        .attr('y', 25)
        .text((p: any) => p.value)
        .style('font-size', 18)
        .style('font-weight', '600')
        .attr('dominant-baseline', 'middle')
        .attr('text-anchor', 'middle');
    });
  }

  private dragEvent() {
    return d3.drag()
      .on('start', function (d: any) {
        this.parentNode.appendChild(this);
        this.parentNode.parentNode.appendChild(this.parentNode);
      }).on('drag', function (d: any) {
        const event = d3.event;
        d3.select(this).attr('transform', `translate(${d.translateX + event.dx},${d.translateY + event.dy})`);
        d.translateX += event.dx;
        d.translateY += event.dy;
      }).on('end', function (d: any) {
        console.log('dragEnd', d);
      });
  }

  private checkCollision(node1: any, node2: any) {

  }
}
