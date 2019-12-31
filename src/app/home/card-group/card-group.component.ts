import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, Input } from '@angular/core';
import { fromEvent } from 'rxjs';

@Component({
  selector: 'card-group',
  templateUrl: './card-group.component.html',
  styleUrls: ['./card-group.component.scss']
})
export class CardGroupComponent implements OnInit, AfterViewInit {

  @ViewChild('cardListElement') public cardListElement: ElementRef;

  @Input() public group: any;

  public cardH = 0;

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
    // console.log(cardLsitP);
    this.group.top = cardLsitP.top;


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
