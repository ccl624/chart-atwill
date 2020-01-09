import { Component, OnInit } from '@angular/core';
import { BookshelfDemoService } from './bookshelf-demo.service';

@Component({
  selector: 'app-bookshelf-demo',
  templateUrl: './bookshelf-demo.component.html',
  styleUrls: ['./bookshelf-demo.component.scss']
})
export class BookshelfDemoComponent implements OnInit {

  public shelfData: any = [];

  constructor(
    private bookshelfDemoService: BookshelfDemoService
  ) { }

  ngOnInit() {

    this.bookshelfDemoService.getShelfData().subscribe(res => {
      this.shelfData = res;
    });
  }

}
