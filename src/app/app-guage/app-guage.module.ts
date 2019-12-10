import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AppGuageComponent } from './app-guage.component';
import { FormsModule } from '@angular/forms';

const routes: Routes = [
  { path: '', component: AppGuageComponent }
];

@NgModule({
  declarations: [AppGuageComponent],
  imports: [CommonModule, FormsModule, RouterModule.forChild(routes)],
  exports: [AppGuageComponent]
})
export class AppGuageModule { }
