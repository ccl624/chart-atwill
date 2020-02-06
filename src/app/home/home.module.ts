import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home.component';
import { CardGroupComponent } from './card-group/card-group.component';

const routes: Routes = [
  { path: '', component: HomeComponent }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  declarations: [HomeComponent, CardGroupComponent]
})

export class HomeModule { }

