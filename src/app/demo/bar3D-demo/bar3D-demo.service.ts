import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class Bar3DDemoService {

  constructor(
    private http: HttpClient,
  ) { }

  public getText() {
    return this.http.get('assets/text/bar3DDemoCode.text', { responseType: 'text' });
  }
}
