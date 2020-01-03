import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class BarDemoService {

  constructor(
    private http: HttpClient,
  ) { }

  public getText() {
    return this.http.get('assets/text/barDemoCode.text', { responseType: 'text' });
  }
}
