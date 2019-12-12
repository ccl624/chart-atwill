import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { fromEvent } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit, AfterViewInit {

  @ViewChild('cardListElement') public cardListElement: ElementRef;

  public cardH = 0;

  public cardList: any[] = [
    { name: '仪表盘', link: '/guage-demo', src: 'assets/image/guage.png' },
    { name: '中国地图', link: '/d3-geo', src: 'assets/image/china_map.png' },
  ];

  constructor() { }

  public ngOnInit() {

  }

  public ngAfterViewInit(): void {
    window.requestAnimationFrame(() => {
      this.resetCardSize();
    });
    fromEvent(window, 'resize').subscribe((e: MouseEvent) => {
      this.resetCardSize();
    });
  }

  private resetCardSize() {
    const cardLsitP = this.cardListElement.nativeElement.getBoundingClientRect();
    const cardListW = cardLsitP.width;

    if (cardListW > 1600) {
      this.cardH = cardListW / 6 - 20;
    } else if (cardListW < 1600 && cardListW > 1200) {
      this.cardH = cardListW / 5 - 20;
    } else if (cardListW < 1200 && cardListW > 800) {
      this.cardH = cardListW / 4 - 20;
    } else {
      this.cardH = cardListW / 3 - 20;
    }
  }
}
