import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-axis-demo',
  templateUrl: './axis-demo.component.html',
  styleUrls: ['./axis-demo.component.scss']
})
export class AxisDemoComponent implements OnInit, AfterViewInit {

  @ViewChild('axisWrap', { static: true }) axisWrap: ElementRef;

  constructor() { }

  public ngOnInit() {
  }

  public ngAfterViewInit() {

    // .attr('viewBox', `0 0 ${500} ${500}`)
    // .attr('preserveAspectRatio', 'xMinyMin meet');
    const height = 500;
    const width = 800;
    const margin = ({ top: 20, right: 20, bottom: 30, left: 100 });

    const x = d3.scaleLinear()
      .domain([1, 21])
      .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
      .domain([0, 137])
      .range([height - margin.bottom, margin.top]);

    const svg = d3.select(this.axisWrap.nativeElement)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%');

    const axisX = svg.append('g')
      .attr('class', 'axis-x-g')
      .attr('transform', `translate(${0},${height - margin.bottom})`)
      .call(d3.axisBottom(x).tickFormat((d: number) => {
        console.log(d);
        return 'aaa' + d;
      }));

    const axisY = svg.append('g')
      .attr('class', 'axis-y-g')
      .attr('transform', `translate(${margin.left},${0})`)
      .call(d3.axisLeft(y));

  }

}
