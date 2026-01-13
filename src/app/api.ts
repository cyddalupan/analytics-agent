import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_BASE_URL = 'https://thegrandmidoriortigas.info/agent/api';
const SECURITY_TOKEN = '8F3L8Mj91AIoqSH6pXhMIfYGd2lCGg4t90QQjKoSV7byOvUCXU8m3J1s4TqxRtlY';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private headers: HttpHeaders;

  constructor(private http: HttpClient) {
    this.headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Security-Token': SECURITY_TOKEN
    });
  }

  // Method to make DB queries
  queryDb(query: string, params: any[] = []): Observable<any> {
    const payload = { query, params };
    return this.http.post(`${API_BASE_URL}/db.php`, payload, { headers: this.headers });
  }

  // Method to make AI calls
  callAi(systemPrompt: string, history: { role: string; content: string; }[], lastMessage: string): Observable<any> {
    const payload = { system_prompt: systemPrompt, history, last_message: lastMessage };
    return this.http.post(`${API_BASE_URL}/ai.php`, payload, { headers: this.headers });
  }
}