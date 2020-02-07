import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-slider-demo',
  templateUrl: './slider-demo.component.html',
  styleUrls: ['./slider-demo.component.scss']
})
export class SliderDemoComponent implements OnInit {

  public progressArcs = [];

  private num = 0;

  constructor() { }

  ngOnInit() {
    // for (let index = 0; index < 20; index++) {
    //   this.progressArcs.push(Math.random()*100);
    // }

    this.lazyLoading();
  }

  private lazyLoading(){
    window.requestAnimationFrame(()=>{
      this.progressArcs.push(Math.random()*100);
      this.num++;
      if(this.num < 15){
        this.lazyLoading();
      }
    })
  }

}
