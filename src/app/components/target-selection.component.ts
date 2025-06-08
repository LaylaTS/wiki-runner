import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WikipediaService } from '../services/wikipedia.service';
import { GameService } from '../services/game.service';

@Component({
  selector: 'app-target-selection',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="target-selection">
      <h1>Wikipedia Speedrun</h1>
      <p>Choose your target article to speedrun to:</p>
      
      <div class="search-container">
        <input 
          type="text" 
          [(ngModel)]="searchQuery" 
          (input)="onSearchInput()"
          placeholder="Search for target article..."
          class="search-input"
        />
      </div>

      <div class="search-results" *ngIf="searchResults.length > 0">
        <div 
          *ngFor="let result of searchResults" 
          class="search-result"
          (click)="selectTarget(result)"
        >
          {{ result }}
        </div>
      </div>

      <div class="selected-target" *ngIf="selectedTarget">
        <h3>Selected Target: {{ selectedTarget }}</h3>
        <button class="start-button" (click)="startSpeedrun()">
          Start Speedrun
        </button>
      </div>
    </div>
  `,
  styles: [`
    .target-selection {
      max-width: 600px;
      margin: 2rem auto;
      padding: 2rem;
      text-align: center;
    }

    h1 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      background: linear-gradient(45deg, #8B5CF6, #3B82F6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    p {
      font-size: 1.2rem;
      margin-bottom: 2rem;
      color: #E5E7EB;
    }

    .search-container {
      margin-bottom: 1rem;
    }

    .search-input {
      width: 100%;
      padding: 1rem;
      font-size: 1.1rem;
      border: 2px solid #4C1D95;
      border-radius: 12px;
      background: rgba(139, 92, 246, 0.1);
      color: #E5E7EB;
      outline: none;
      transition: all 0.3s ease;
    }

    .search-input:focus {
      border-color: #8B5CF6;
      box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
    }

    .search-input::placeholder {
      color: #9CA3AF;
    }

    .search-results {
      max-height: 300px;
      overflow-y: auto;
      border: 1px solid #4C1D95;
      border-radius: 12px;
      background: rgba(30, 27, 75, 0.5);
      margin-bottom: 1rem;
    }

    .search-result {
      padding: 0.75rem 1rem;
      cursor: pointer;
      border-bottom: 1px solid #4C1D95;
      transition: all 0.3s ease;
    }

    .search-result:hover {
      background: rgba(139, 92, 246, 0.2);
      transform: translateX(5px);
    }

    .search-result:last-child {
      border-bottom: none;
    }

    .selected-target {
      margin-top: 2rem;
      padding: 1.5rem;
      border: 2px solid #8B5CF6;
      border-radius: 12px;
      background: rgba(139, 92, 246, 0.1);
    }

    .selected-target h3 {
      color: #E5E7EB;
      margin-bottom: 1rem;
    }

    .start-button {
      padding: 1rem 2rem;
      font-size: 1.2rem;
      font-weight: bold;
      color: white;
      background: linear-gradient(45deg, #8B5CF6, #3B82F6);
      border: none;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
    }

    .start-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4);
    }
  `]
})
export class TargetSelectionComponent {
  searchQuery = '';
  searchResults: string[] = [];
  selectedTarget = '';
  private searchTimeout: any;

  constructor(
    private wikipediaService: WikipediaService,
    private gameService: GameService
  ) {}

  onSearchInput(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      if (this.searchQuery.trim().length > 2) {
        this.wikipediaService.searchArticles(this.searchQuery).subscribe({
          next: (results) => {
            this.searchResults = results;
          },
          error: (error) => {
            console.error('Search error:', error);
            this.searchResults = [];
          }
        });
      } else {
        this.searchResults = [];
      }
    }, 300);
  }

  selectTarget(target: string): void {
    this.selectedTarget = target;
    this.searchResults = [];
    this.searchQuery = target;
  }

  startSpeedrun(): void {
    if (this.selectedTarget) {
      this.gameService.setTargetArticle(this.selectedTarget);
      // Get random starting article
      this.wikipediaService.getRandomArticle().subscribe({
        next: (randomArticle) => {
          this.gameService.startGame(randomArticle);
        },
        error: (error) => {
          console.error('Error getting random article:', error);
        }
      });
    }
  }
}
