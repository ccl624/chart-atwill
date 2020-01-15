import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable()
export class LineService {

  constructor(
    private http: HttpClient,
  ) { }

  public getText(url: string) {
    return this.http.get(url, { responseType: 'text' });
  }
}
