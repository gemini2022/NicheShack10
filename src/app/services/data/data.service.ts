import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  constructor(private http: HttpClient) { }

  getItems(url: string): Observable<any> {
    return this.http.get<any>(url);
  }


  post(url: string, body: any): Observable<any> {
    return this.http.post<any>(url, body);
  }


  put(url: string, body: any) {
    return this.http.put<any>(url, body);
  }

  delete(url: string, params: any) {
    return this.http.delete<any>(url, { params: params });
  }
}