import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()

export class D3GeoService {
  constructor(
    private http: HttpClient,
  ) { }

  getChinaJSON(request: any = { params: {} }) {
    request.showLoading = false;
    return this.http.get('assets/json/china.json', request);
  }
}
