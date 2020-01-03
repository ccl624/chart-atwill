import { Component, Input, OnInit, AfterViewInit, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { Grid3D } from './grid/3D/grid';
import { Grid } from './grid/2D/grid';
import { Title } from './title/title';
import { fromEvent } from 'rxjs';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import * as d3 from 'd3';

@Component({
    selector: 'sf-chart',
    templateUrl: './chart.component.html',
    styleUrls: ['./chart.component.scss']
})

export class ChartComponent implements OnInit, OnChanges {

    @Input() option: any;

    @Input() chartId = new Date().getTime();

    @Input() style = {width: '100%', height: '100%'};

    @Output() public OnInitChart = new EventEmitter<any>();

    public cliclStream: Subject<string> = new Subject<string>();

    constructor(

    ) { }

    ngOnChanges(changes: SimpleChanges) {
        for (const change in changes) {
            if (change === 'option' && this.option) {
                this.chartId = this.option.chartId || this.chartId;
                const t = requestAnimationFrame(() => {
                    this.initChart();
                    this.OnInitChart.emit(this.initChart.bind(this));
                    cancelAnimationFrame(t);
                });
            }
        }
    }

    ngOnInit() {
        fromEvent(window, 'resize').subscribe((e: MouseEvent) => {
            this.cliclStream.next();
        });


        this.cliclStream.pipe(debounceTime(500)).subscribe(async () => {
            this.initChart();
        });
    }

    // ngAfterViewInit(): void {
    //     this.initChart();
    // }

    initChart() {
        if (this.option && this.option.chartId) {
            const chartDivd = d3.selectAll(`#sfChart${this.chartId}`);
            let svg = chartDivd.selectAll('svg');
            if (!svg.empty()) {
                svg.remove();
            }

            svg = chartDivd.append('svg')
                .attr('id', `sfChartSvg${this.chartId}`)
                .attr('width', '100%')
                .attr('height', '100%');
            if (!svg.empty()) {
                if (this.option.xAxis3D) {
                    const grid = new Grid3D(this.option, svg);
                } else {
                    const grid = new Grid(this.option, svg);
                }
            }

        }
    }
}
