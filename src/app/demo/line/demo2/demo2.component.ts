import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { LineService } from '../line.service';

@Component({
  selector: 'app-demo2',
  templateUrl: './demo2.component.html',
  styleUrls: ['./demo2.component.scss']
})
export class Demo2Component implements OnInit {

  public option: any = {};

  public myCode = '';

  public chartInit: () => {};

  private codes: any[] = [
    { id: '01', url: 'assets/text/lineDemoBasic.text' },
    { id: '02', url: 'assets/text/lineDemoSmooth.text' },
    { id: '03', url: 'assets/text/lineDemoArea.text' }
  ];

  constructor(
    private lineService: LineService,
    private route: ActivatedRoute
  ) { }

  public ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    const tarCode = this.codes.find(code => code.id === id);
    this.lineService.getText(tarCode.url).subscribe((res: any) => {
      this.myCode = res;
      this.showChartResult(this.myCode);
    });
  }

  public showChartResult(event: any) {
    const codeConfig: any = {};
    new Function(event).bind(codeConfig)();
    this.option = codeConfig.option;
  }
}
