import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
  dbResponse: any = null;
  aiResponse: any = null;
  loadingDb: boolean = false;
  loadingAi: boolean = false;
  dbError: string | null = null;
  aiError: string | null = null;

  constructor(private apiService: ApiService, private cdr: ChangeDetectorRef) { } // Inject ChangeDetectorRef

  ngOnInit(): void {
    this.fetchDbData();
    this.fetchAiData();
  }

  fetchDbData(): void {
    this.loadingDb = true;
    this.dbError = null;
    this.dbResponse = null;
    console.log('Fetching DB data...');
    const query = 'SELECT applicantNumber, sub_employer, applicant_first, applicant_middle, applicant_last FROM applicant LIMIT 5';
    this.apiService.queryDb(query).subscribe({
      next: (data) => {
        this.dbResponse = data;
        this.loadingDb = false;
        console.log('DB data fetched:', this.dbResponse);
        console.log('loadingDb:', this.loadingDb);
        this.cdr.detectChanges(); // Manually trigger change detection
      },
      error: (err) => {
        console.error('DB API Error:', err);
        this.dbError = 'Failed to fetch DB data. Check console for details.';
        this.loadingDb = false;
        this.dbResponse = null;
        console.log('DB fetch error. loadingDb:', this.loadingDb);
        this.cdr.detectChanges(); // Manually trigger change detection on error
      }
    });
  }

  fetchAiData(): void {
    this.loadingAi = true;
    this.aiError = null;
    this.aiResponse = null;
    console.log('Fetching AI data...');
    const systemPrompt = 'You are a helpful assistant.';
    const history = [{ role: 'user', content: 'What is the capital of France?' }];
    const lastMessage = 'What is the capital of Japan?';

    this.apiService.callAi(systemPrompt, history, lastMessage).subscribe({
      next: (data) => {
        this.aiResponse = data;
        this.loadingAi = false;
        console.log('AI data fetched:', this.aiResponse);
        console.log('loadingAi:', this.loadingAi);
        this.cdr.detectChanges(); // Manually trigger change detection
      },
      error: (err) => {
        console.error('AI API Error:', err);
        this.aiError = 'Failed to fetch AI data. Check console for details.';
        this.loadingAi = false;
        this.aiResponse = null;
        console.log('AI fetch error. loadingAi:', this.loadingAi);
        this.cdr.detectChanges(); // Manually trigger change detection on error
      }
    });
  }
}