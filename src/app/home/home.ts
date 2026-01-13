import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../api';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit {
  dbResponse: any;
  aiResponse: any;
  loadingDb: boolean = false;
  loadingAi: boolean = false;
  dbError: string | null = null;
  aiError: string | null = null;

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.fetchDbData();
    this.fetchAiData();
  }

  fetchDbData(): void {
    this.loadingDb = true;
    this.dbError = null;
    const query = 'SELECT applicantNumber, sub_employer, applicant_first, applicant_middle, applicant_last FROM applicant LIMIT 5';
    this.apiService.queryDb(query).subscribe({
      next: (data) => {
        this.dbResponse = data;
        this.loadingDb = false;
      },
      error: (err) => {
        console.error('DB API Error:', err);
        this.dbError = 'Failed to fetch DB data. Check console for details.';
        this.loadingDb = false;
      }
    });
  }

  fetchAiData(): void {
    this.loadingAi = true;
    this.aiError = null;
    const systemPrompt = 'You are a helpful assistant.';
    const history = [{ role: 'user', content: 'What is the capital of France?' }];
    const lastMessage = 'What is the capital of Japan?';

    this.apiService.callAi(systemPrompt, history, lastMessage).subscribe({
      next: (data) => {
        this.aiResponse = data;
        this.loadingAi = false;
      },
      error: (err) => {
        console.error('AI API Error:', err);
        this.aiError = 'Failed to fetch AI data. Check console for details.';
        this.loadingAi = false;
      }
    });
  }
}