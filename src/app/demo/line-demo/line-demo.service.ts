import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable()
export class LineDemoService {

  constructor(
    private http: HttpClient,
  ) { }

  public getText() {
    return this.http.get('assets/text/lineDemoCode.text', { responseType: 'text' });
  }
}
