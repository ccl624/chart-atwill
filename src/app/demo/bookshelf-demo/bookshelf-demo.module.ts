import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { BookshelfDemoComponent } from './bookshelf-demo.component';
import { BookshelfModule } from 'src/app/shared';

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
})

export class BookshelfDemoModule { }


