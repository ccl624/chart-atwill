import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { SliderDemoComponent } from './slider-demo.component';
import { SfSliderModule ,SfProgressModule} from 'src/app/shared';

const routes: Routes = [
    { path: '', component: SliderDemoComponent }
];

@NgModule({
    declarations: [SliderDemoComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        SfSliderModule,
        SfProgressModule
    ],
    exports: [SliderDemoComponent],
})
export class SliderDemoModule { }
