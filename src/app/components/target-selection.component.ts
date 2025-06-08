import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WikipediaService } from '../services/wikipedia.service';
import { GameService } from '../services/game.service';

@Component({
  selector: 'app-target-selection',
  standalone: true,
  imports: [CommonModule, FormsModule],  template: `
    <div class="target-selection">
      <h1>WikiRunner</h1>
      <br>      <div class="game-setup-container">
        <!-- Starting and Target Article Sections -->
        <div class="articles-container">
          <!-- Starting Article Section -->
          <div class="setup-section">
            <div class="section-header">
              <h3>🚀 Starting Article</h3>
              <p class="section-description">Where do you want to begin? Leave empty for random starting point.</p>
            </div>
            
            <div class="search-container">
              <input 
                type="text" 
                [(ngModel)]="startSearchQuery" 
                (input)="onStartSearchInput()"
                (focus)="showStartSuggestions = true"
                (blur)="hideStartSuggestions()"
                placeholder="Type to search for starting article..."
                class="search-input"
              />
                <div class="search-suggestions" *ngIf="startSearchResults.length > 0 && showStartSuggestions">
                <div 
                  *ngFor="let result of startSearchResults" 
                  class="suggestion-item"
                  [class.disabled]="result === selectedTarget"
                  (mousedown)="selectStart(result)"
                >
                  <span class="article-icon">📄</span>
                  {{ result }}
                  <span *ngIf="result === selectedTarget" class="disabled-text">(Already selected as target)</span>
                </div>
              </div>
            </div>

            <div class="selected-article" *ngIf="selectedStart">
              <span class="selected-label">Selected:</span>
              <span class="selected-value">{{ selectedStart }}</span>
              <button class="clear-btn" (click)="clearStart()">✕</button>
            </div>
          </div>

          <!-- Target Article Section -->
          <div class="setup-section">
            <div class="section-header">
              <h3>🎯 Target Article</h3>
              <p class="section-description">Where do you want to end up? Leave empty for random destination.</p>
            </div>
            
            <div class="search-container">
              <input 
                type="text" 
                [(ngModel)]="targetSearchQuery" 
                (input)="onTargetSearchInput()"
                (focus)="showTargetSuggestions = true"
                (blur)="hideTargetSuggestions()"
                placeholder="Type to search for target article..."
                class="search-input"
              />
                <div class="search-suggestions" *ngIf="targetSearchResults.length > 0 && showTargetSuggestions">
                <div 
                  *ngFor="let result of targetSearchResults" 
                  class="suggestion-item"
                  [class.disabled]="result === selectedStart"
                  (mousedown)="selectTarget(result)"
                >
                  <span class="article-icon">📄</span>
                  {{ result }}
                  <span *ngIf="result === selectedStart" class="disabled-text">(Already selected as start)</span>
                </div>
              </div>
            </div>

            <div class="selected-article" *ngIf="selectedTarget">
              <span class="selected-label">Selected:</span>
              <span class="selected-value">{{ selectedTarget }}</span>
              <button class="clear-btn" (click)="clearTarget()">✕</button>
            </div>
          </div>
        </div>

        <!-- Game Configuration Preview -->
        <div class="config-preview" *ngIf="selectedTarget || selectedStart">
          <h3>🎮 Game Configuration</h3>
          <div class="config-items">
            <div class="config-item">
              <span class="config-icon">🚀</span>
              <span class="config-label">Starting Article:</span>
              <span class="config-value">{{ selectedStart || '🎲 Random' }}</span>
            </div>
            <div class="config-item">
              <span class="config-icon">🎯</span>
              <span class="config-label">Target Article:</span>
              <span class="config-value">{{ selectedTarget || '🎲 Random' }}</span>
            </div>
          </div>
        </div>        <!-- Action Buttons -->
        <div class="action-buttons">
          <button class="start-button" (click)="startSpeedrun()" [disabled]="isLoading">
            <span *ngIf="!isLoading" class="button-content">
              <span class="button-icon">🏁</span>
              <span class="button-text">Start Game</span>
            </span>
            <span *ngIf="isLoading" class="button-content">
              <span class="button-icon">⏳</span>
              <span class="button-text">Setting up...</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  `,  styles: [`    .target-selection {
      max-width: 1200px;
      margin: 2rem auto;
      padding: 2rem;
      text-align: center;
      min-height: 100vh;
      position: relative;
      overflow: hidden;
      box-sizing: border-box;
    }

    h1 {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
      background: linear-gradient(45deg, #8B5CF6, #3B82F6, #10B981);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: rainbow 3s ease-in-out infinite;
    }

    @keyframes rainbow {
      0%, 100% { filter: hue-rotate(0deg); }
      50% { filter: hue-rotate(90deg); }
    }

    p {
      font-size: 1.2rem;
      margin-bottom: 3rem;
      color: #E5E7EB;
    }    .game-setup-container {
      display: flex;
      flex-direction: column;
      gap: 2rem;
      overflow: visible;
    }.articles-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      overflow: visible;
    }.setup-section {
      background: rgba(139, 92, 246, 0.1);
      border: 2px solid #4C1D95;
      border-radius: 20px;
      padding: 2rem;
      transition: all 0.3s ease;
      text-align: left;
      position: relative;
      z-index: 1;
      overflow: visible;
    }

    .setup-section:hover {
      border-color: #8B5CF6;
      box-shadow: 0 10px 30px rgba(139, 92, 246, 0.2);
      transform: translateY(-2px);
    }

    .section-header {
      margin-bottom: 1.5rem;
    }

    .section-header h3 {
      color: #E5E7EB;
      margin-bottom: 0.5rem;
      font-size: 1.4rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .section-description {
      color: #9CA3AF;
      font-size: 0.95rem;
      margin: 0;
    }    .search-container {
      position: relative;
      margin-bottom: 1rem;
      z-index: 1;
    }

    .search-input {
      width: 100%;
      padding: 1.2rem 1rem;
      font-size: 1rem;
      border: 2px solid #4C1D95;
      border-radius: 16px;
      background: rgba(139, 92, 246, 0.1);
      color: #E5E7EB;
      outline: none;
      transition: all 0.3s ease;
      box-sizing: border-box;
    }

    .search-input:focus {
      border-color: #8B5CF6;
      box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
      background: rgba(139, 92, 246, 0.15);
      transform: scale(1.02);
    }

    .search-input::placeholder {
      color: #9CA3AF;
    }    .search-suggestions {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      max-height: 200px;
      overflow-y: auto;
      overflow-x: hidden;
      border: 2px solid #8B5CF6;
      border-top: none;
      border-radius: 0 0 16px 16px;
      background: rgba(30, 27, 75, 0.98);
      backdrop-filter: blur(20px);
      z-index: 1000;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
      animation: slideDown 0.2s ease-out;
      scrollbar-width: thin;
      scrollbar-color: #8B5CF6 transparent;
    }

    .search-suggestions::-webkit-scrollbar {
      width: 6px;
    }

    .search-suggestions::-webkit-scrollbar-track {
      background: transparent;
    }

    .search-suggestions::-webkit-scrollbar-thumb {
      background: #8B5CF6;
      border-radius: 3px;
    }/* Target section (second) gets higher z-index to appear above start section */
    .setup-section:nth-child(2) .search-suggestions {
      z-index: 1001;
    }    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }.suggestion-item {
      padding: 1rem;
      cursor: pointer;
      border-bottom: 1px solid #4C1D95;
      transition: all 0.3s ease;
      color: #E5E7EB;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .suggestion-item:hover:not(.disabled) {
      background: rgba(139, 92, 246, 0.3);
      transform: translateX(8px);
      color: #F3F4F6;
    }

    .suggestion-item.disabled {
      opacity: 0.5;
      cursor: not-allowed;
      color: #9CA3AF;
    }

    .suggestion-item.disabled:hover {
      background: rgba(239, 68, 68, 0.1);
      transform: none;
    }

    .suggestion-item:last-child {
      border-bottom: none;
    }

    .disabled-text {
      font-size: 0.8rem;
      color: #EF4444;
      font-style: italic;
    }

    .article-icon {
      font-size: 1.1rem;
      opacity: 0.7;
    }

    .selected-article {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: rgba(139, 92, 246, 0.2);
      border: 2px solid #8B5CF6;
      border-radius: 12px;
      animation: selectedPulse 0.5s ease-out;
    }

    @keyframes selectedPulse {
      0% {
        transform: scale(1);
        box-shadow: 0 0 0 rgba(139, 92, 246, 0.4);
      }
      50% {
        transform: scale(1.02);
        box-shadow: 0 0 20px rgba(139, 92, 246, 0.4);
      }
      100% {
        transform: scale(1);
        box-shadow: 0 0 0 rgba(139, 92, 246, 0.4);
      }
    }

    .selected-label {
      color: #8B5CF6;
      font-weight: 600;
      font-size: 0.9rem;
    }

    .selected-value {
      color: #F3F4F6;
      font-weight: 500;
      flex: 1;
    }

    .clear-btn {
      background: rgba(239, 68, 68, 0.2);
      border: 1px solid #EF4444;
      border-radius: 50%;
      width: 30px;
      height: 30px;
      color: #EF4444;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.9rem;
    }

    .clear-btn:hover {
      background: rgba(239, 68, 68, 0.3);
      transform: scale(1.1);
    }

    .config-preview {
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(59, 130, 246, 0.15));
      border: 2px solid #8B5CF6;
      border-radius: 20px;
      padding: 2rem;
      animation: fadeIn 0.5s ease-out;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .config-preview h3 {
      color: #E5E7EB;
      margin-bottom: 1.5rem;
      font-size: 1.3rem;
      text-align: center;
    }

    .config-items {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .config-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: rgba(30, 27, 75, 0.4);
      border-radius: 12px;
      border: 1px solid #4C1D95;
      transition: all 0.3s ease;
    }

    .config-item:hover {
      background: rgba(30, 27, 75, 0.6);
      transform: translateX(5px);
    }

    .config-icon {
      font-size: 1.2rem;
    }

    .config-label {
      color: #8B5CF6;
      font-weight: 600;
      min-width: 120px;
    }

    .config-value {
      color: #E5E7EB;
      font-weight: 500;
      flex: 1;
    }

    .action-buttons {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-top: 1rem;
    }    .start-button {
      padding: 1.5rem 2rem;
      font-size: 1.1rem;
      font-weight: bold;
      border: none;
      border-radius: 16px;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      background: linear-gradient(45deg, #8B5CF6, #3B82F6);
      color: white;
      box-shadow: 0 6px 20px rgba(139, 92, 246, 0.3);
    }

    .start-button:hover:not(:disabled) {
      transform: translateY(-3px);
      box-shadow: 0 8px 25px rgba(139, 92, 246, 0.4);
      background: linear-gradient(45deg, #7C3AED, #2563EB);
    }

    .start-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .button-content {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .button-icon {
      font-size: 1.3rem;
    }

    .button-text {
      font-weight: 600;
      letter-spacing: 0.5px;
    }    @media (max-width: 768px) {
      .target-selection {
        margin: 1rem;
        padding: 1.5rem;
      }

      h1 {
        font-size: 2rem;
      }

      p {
        font-size: 1rem;
        margin-bottom: 2rem;
      }

      .articles-container {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }

      .setup-section {
        padding: 1.5rem;
      }

      .search-input {
        padding: 1rem;
      }

      .config-items {
        gap: 0.75rem;
      }

      .config-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
        text-align: left;
      }

      .config-label {
        min-width: auto;
      }      .action-buttons {
        gap: 1rem;
      }

      .start-button {
        padding: 1.25rem 1.5rem;
        font-size: 1rem;
      }
    }
  `]
})
export class TargetSelectionComponent {
  // Target article search
  targetSearchQuery = '';
  targetSearchResults: string[] = [];
  selectedTarget = '';
  showTargetSuggestions = false;

  // Starting article search
  startSearchQuery = '';
  startSearchResults: string[] = [];
  selectedStart = '';
  showStartSuggestions = false;

  // UI state
  isLoading = false;

  private targetSearchTimeout: any;
  private startSearchTimeout: any;

  constructor(
    private wikipediaService: WikipediaService,
    private gameService: GameService
  ) {}

  onTargetSearchInput(): void {
    clearTimeout(this.targetSearchTimeout);
    this.targetSearchTimeout = setTimeout(() => {
      if (this.targetSearchQuery.trim().length > 2) {
        this.wikipediaService.searchArticles(this.targetSearchQuery).subscribe({
          next: (results) => {
            this.targetSearchResults = results;
            this.showTargetSuggestions = true;
          },
          error: (error) => {
            console.error('Target search error:', error);
            this.targetSearchResults = [];
            this.showTargetSuggestions = false;
          }
        });
      } else {
        this.targetSearchResults = [];
        this.showTargetSuggestions = false;
      }
    }, 300);
  }

  onStartSearchInput(): void {
    clearTimeout(this.startSearchTimeout);
    this.startSearchTimeout = setTimeout(() => {
      if (this.startSearchQuery.trim().length > 2) {
        this.wikipediaService.searchArticles(this.startSearchQuery).subscribe({
          next: (results) => {
            this.startSearchResults = results;
            this.showStartSuggestions = true;
          },
          error: (error) => {
            console.error('Start search error:', error);
            this.startSearchResults = [];
            this.showStartSuggestions = false;
          }
        });
      } else {
        this.startSearchResults = [];
        this.showStartSuggestions = false;
      }
    }, 300);
  }
  selectTarget(target: string): void {
    // Prevent selecting the same article as starting article
    if (target === this.selectedStart) {
      // Show a brief warning or just return
      return;
    }
    this.selectedTarget = target;
    this.targetSearchQuery = target;
    this.targetSearchResults = [];
    this.showTargetSuggestions = false;
  }

  selectStart(start: string): void {
    // Prevent selecting the same article as target article
    if (start === this.selectedTarget) {
      // Show a brief warning or just return
      return;
    }
    this.selectedStart = start;
    this.startSearchQuery = start;
    this.startSearchResults = [];
    this.showStartSuggestions = false;
  }

  clearTarget(): void {
    this.selectedTarget = '';
    this.targetSearchQuery = '';
    this.targetSearchResults = [];
    this.showTargetSuggestions = false;
  }

  clearStart(): void {
    this.selectedStart = '';
    this.startSearchQuery = '';
    this.startSearchResults = [];
    this.showStartSuggestions = false;
  }

  hideTargetSuggestions(): void {
    // Small timeout to allow click events to register first
    setTimeout(() => {
      this.showTargetSuggestions = false;
    }, 150);
  }
  hideStartSuggestions(): void {
    // Small timeout to allow click events to register first
    setTimeout(() => {
      this.showStartSuggestions = false;
    }, 150);
  }

  startSpeedrun(): void {
    // Prevent starting if both articles are the same
    if (this.selectedStart && this.selectedTarget && this.selectedStart === this.selectedTarget) {
      // Could show an error message here
      console.warn('Cannot start game with the same article as start and target');
      return;
    }

    this.isLoading = true;
    
    // Determine final target and start articles
    const finalTarget = this.selectedTarget || null;
    const finalStart = this.selectedStart || null;

    // Function to get random article if needed
    const getRandomIfNeeded = (selected: string | null) => {
      if (selected) {
        return Promise.resolve(selected);
      } else {
        return this.wikipediaService.getRandomArticle().toPromise();
      }
    };    // Get both articles (random if not specified)
    Promise.all([
      getRandomIfNeeded(finalStart),
      getRandomIfNeeded(finalTarget)
    ]).then(([startArticle, targetArticle]) => {
      // Ensure they're different even if random
      if (startArticle === targetArticle) {
        // Get a new random target if they're the same
        return this.wikipediaService.getRandomArticle().toPromise().then(newTarget => {
          if (startArticle && newTarget) {
            this.gameService.setTargetArticle(newTarget);
            this.gameService.startGame(startArticle);
          }
          return Promise.resolve();
        });
      } else if (startArticle && targetArticle) {
        this.gameService.setTargetArticle(targetArticle);
        this.gameService.startGame(startArticle);
        return Promise.resolve();
      }
      return Promise.resolve();
    }).catch((error) => {
      console.error('Error setting up game:', error);
      this.isLoading = false;
    });
  }
}
