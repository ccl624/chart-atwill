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
    { name: '中国地图', imgHref: '', src: '' },
    { name: '中国地图', imgHref: '', src: '' },
    { name: '中国地图', imgHref: '', src: '' },
    { name: '中国地图', imgHref: '', src: '' },
    { name: '中国地图', imgHref: '', src: '' },
    { name: '中国地图', imgHref: '', src: '' },
    { name: '中国地图', imgHref: '', src: '' },
    { name: '中国地图', imgHref: '', src: '' },
    { name: '中国地图', imgHref: '', src: '' },
    { name: '中国地图', imgHref: '', src: '' }
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
    console.log(this.cardListElement.nativeElement);

    const cardLsitP = this.cardListElement.nativeElement.getBoundingClientRect();
    const cardListW = cardLsitP.width;
    const minWidth = 200;
    const maxWidth = 300;
    this.cardH = cardListW / 5 * 0.618;
  }
}
