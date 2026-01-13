import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../api';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
  
    chatHistory: { role: string; content: string; }[] = [];
    userMessage: string = '';
    dbQueryResult: any[] | null = null;
    showResultsTable: boolean = false;
        resultsTableHeaders: string[] = [];    
    private schemaInfo: string = `
  Table: applicant
  applicant_id		int(10)
  applicant_first		varchar(100)
  applicant_middle	varchar(100)
  applicant_last		varchar(100)
  applicant_remarks	text
  applicant_source	int(11)
  applicant_employer 	int(10)
  applicant_status 	int(10)
  applicant_preferred_country int(5)
  
  Table: employer
  employer_id Primary	int(11)	 = applicant_employer
  employer_name	varchar(100)
  
  Table: recruitment_agent 
  agent_id int(10) = applicant_source
  agent_first	varchar(100)
  agent_last	varchar(100)
  
  Table: statuses
  id int(10)	= applicant_status
  status	varchar(255)
  statusColors	varchar(255)
  
  Table: country
  country_id int(10) = applicant_preferred_country
  country_name	varchar(100)
  
  Table: applicant_experiences
  `;
  
    constructor(private apiService: ApiService, private cdr: ChangeDetectorRef) { } // Inject ChangeDetectorRef
  
    ngOnInit(): void {
      // Initial fetch calls are removed, AI interaction will be user-driven
      // this.fetchDbData();
      // this.fetchAiData();
      this.chatHistory.push({
        role: 'assistant',
        content: 'Hello! I can help you query the database. Tell me what information you are looking for about applicants, employers, recruitment agents, statuses, or countries. I will generate a SQL query once I have enough details.'
      });
    }
  
    // sendChatMessage handles user input and AI responses
    sendChatMessage(): void {
      if (!this.userMessage.trim()) {
        return;
      }
  
      const message = this.userMessage;
      this.chatHistory.push({ role: 'user', content: message });
      this.userMessage = '';
      this.loadingAi = true;
      this.aiError = null;
      this.cdr.detectChanges(); // Update UI to show user message and loading
  
      // Construct the system prompt with schema information and AI instructions
                      const systemPrompt = `You are an assistant that generates SQL SELECT queries. Your goal is to provide a query based on the user's request and the provided schema.
                      
                      Database Schema:
                      ${this.schemaInfo}
                  
                      - When searching for names, use the LIKE operator for case-insensitive matching (e.g., "applicant_last LIKE '%Santos%'").
                      - If you have enough information, provide the query. You can return a JSON object like {"type": "query", "query": "SELECT ..."} or a raw SQL string.
                      - If you need more details, ask the user clarifying questions.
                      `;
                  
                      // Prepare history for AI call, excluding the initial greeting
                      const historyForAi = this.chatHistory.slice(1, -1);
                  
                      this.apiService.callAi(systemPrompt, historyForAi, message).subscribe({
                        next: (data) => {
                          this.loadingAi = false;
                          const aiContent = data.response.trim();
                          let queryHandled = false;
                  
                          // 1. Try to parse as JSON
                          try {
                            const parsedResponse = JSON.parse(aiContent);
                            if (parsedResponse.type === 'query' && parsedResponse.query) {
                              console.log('Query found via JSON parse:', parsedResponse.query);
                              this.executeDbQuery(parsedResponse.query, parsedResponse.params || []);
                              queryHandled = true;
                            }
                          } catch (e) {
                            // Not a valid JSON response, proceed to regex check
                          }
                  
                          // 2. If not handled by JSON, try regex
                          if (!queryHandled) {
                            const queryRegex = /(SELECT\s+[\s\S]*?;)/i;
                            const match = aiContent.match(queryRegex);
                            if (match && match[0]) {
                              const extractedQuery = match[0];
                              console.log('Query found via regex:', extractedQuery);
                              this.executeDbQuery(extractedQuery, []);
                              queryHandled = true;
                            }
                          }
                  
                          // 3. If still not handled, treat as a conversational message
                          if (!queryHandled) {
                            this.chatHistory.push({ role: 'assistant', content: aiContent });
                          }
                          
                          this.cdr.detectChanges();
                        },
                        error: (err) => {
                          console.error('AI API Error:', err);
                          this.aiError = 'Failed to get AI response. Check console for details.';
                          this.loadingAi = false;
                          this.chatHistory.push({ role: 'assistant', content: 'Error communicating with AI.' });
                          this.cdr.detectChanges();
                        }
                      });    }
  
    // executeDbQuery now directly called when AI generates a query
    executeDbQuery(query: string, params: any[] = []): void {
      this.loadingDb = true;
      this.dbError = null;
      this.dbQueryResult = null;
      this.showResultsTable = false;
      this.resultsTableHeaders = [];
      console.log('Executing DB query from AI:', query, params);
  
      this.apiService.queryDb(query, params).subscribe({
        next: (data) => {
          this.dbQueryResult = data;
          this.loadingDb = false;
          this.showResultsTable = true;
          console.log('DB query results:', this.dbQueryResult);
  
          if (this.dbQueryResult && this.dbQueryResult.length > 0) {
            this.resultsTableHeaders = Object.keys(this.dbQueryResult[0]);
          }
          this.cdr.detectChanges(); // Manually trigger change detection
        },
        error: (err) => {
          console.error('DB API Error during AI-generated query:', err);
          this.dbError = 'Failed to execute AI-generated DB query. Check console for details.';
          this.loadingDb = false;
          this.dbQueryResult = null;
          this.showResultsTable = false;
          this.resultsTableHeaders = [];
          this.cdr.detectChanges(); // Manually trigger change detection on error
        }
      });
    }
  
    // Original fetchDbData and fetchAiData are now removed or significantly refactored
    // Keeping them here for context of removal
    fetchDbData(): void {
      // This method is no longer directly called from ngOnInit or user interaction
      // Its logic is now integrated into executeDbQuery
      console.log('fetchDbData is now handled by executeDbQuery.');
    }
  
    fetchAiData(): void {
      // This method is no longer directly called from ngOnInit.
      // Its logic is now integrated into sendChatMessage.
      console.log('fetchAiData is now handled by sendChatMessage.');
    }
  }