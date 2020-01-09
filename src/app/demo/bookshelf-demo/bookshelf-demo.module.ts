import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { BookshelfDemoComponent } from './bookshelf-demo.component';
import { BookshelfModule } from 'src/app/shared';
import { BookshelfDemoService } from './bookshelf-demo.service';

const routes: Routes = [
  { path: '', component: BookshelfDemoComponent }
];

@NgModule({
  imports: [
    CommonModule,
    BookshelfModule,
    RouterModule.forChild(routes)
  ],
  declarations: [BookshelfDemoComponent],
  providers: [BookshelfDemoService]
})

export class BookshelfDemoModule { }


