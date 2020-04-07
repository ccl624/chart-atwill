import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { fromEvent } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit {

  @ViewChild('chartsContent', { static: true }) public chartsContent: ElementRef;

  public cardH = 0;

  public selectedGroupTop: number;

  public selectedIndex = -1;

  public cardGroups: any[] = [
    {
      groupName: '折线图',
      groupType: 'Line',
      icon: 'icon-line',
      cardList: [
        { name: '基本折线图', link: '/line/demo2/01', src: 'assets/image/line-basic.png' },
        { name: '光滑折线图', link: '/line/demo2/02', src: 'assets/image/line-smooth.png' },
        { name: '基本区域图', link: '/line/demo2/03', src: 'assets/image/line-area.png' },
        { name: '光滑折线图', link: '/line/demo1', src: 'assets/image/line-demo.png' },
      ]
    },
    {
      groupName: '柱状图',
      groupType: 'Bar',
      icon: 'icon-bar',
      cardList: [
        { name: '柱状图', link: '/bar-demo', src: 'assets/image/bar-demo.png' },
        { name: '柱状图3D', link: '/bar3D-demo', src: 'assets/image/bar3D-demo.png' },
      ]
    },
    {
      groupName: '饼图',
      groupType: 'Pie',
      icon: 'icon-pie',
      cardList: [
        { name: '饼图', link: '/pie-demo', src: 'assets/image/pie-demo.png' },
      ]
    },
    {
      groupName: '仪表盘',
      groupType: 'Gauge',
      icon: 'icon-gauge',
      cardList: [
        { name: '仪表盘', link: '/guage-demo', src: 'assets/image/guage.png' },
      ]
    },
    {
      groupName: '地图',
      groupType: 'Map',
      icon: 'icon-map',
      cardList: [
        { name: '中国地图', link: '/china-map', src: 'assets/image/china_map.png' },
      ]
    },
    {
      groupName: '拖拽',
      groupType: 'Drag',
      icon: 'icon-map',
      cardList: [
        { name: '拖拽', link: '/bookshelf-demo', src: 'assets/image/drag-demo.png' },
      ]
    },
  ];

  constructor() { }

  public ngOnInit() {

  }

  public selectMenu(group: any, index: number) {
    this.selectedIndex = index;
    this.selectedGroupTop = group.top - 50;

    const parentNode = this.chartsContent.nativeElement;
    parentNode.scrollTop = this.selectedGroupTop;
    // parentNode.scrollTo({
    //   top: this.selectedGroupTop,
    //   behavior: 'smooth'
    // });
  }
}
