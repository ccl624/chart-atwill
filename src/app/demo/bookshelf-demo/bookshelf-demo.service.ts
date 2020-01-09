import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable()
export class BookshelfDemoService {

  constructor(
    private http: HttpClient,
  ) { }

  public getShelfData() {
    return this.http.get('assets/json/bookshelf.json');
  }
}
