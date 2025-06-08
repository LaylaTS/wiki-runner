import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { WikipediaService, WikipediaPage } from '../services/wikipedia.service';
import { GameService } from '../services/game.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-game-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="game-container">
      <div class="game-header">
        <div class="game-info">
          <div class="target-info">
            <span class="label">Target:</span>
            <span class="value">{{ gameState.targetArticle }}</span>
          </div>
          <div class="current-info">
            <span class="label">Current:</span>
            <span class="value">{{ gameState.currentArticle }}</span>
          </div>
          <div class="stats">
            <span class="label">Time:</span>
            <span class="value">{{ formatTime(elapsedTime) }}</span>
            <span class="label">Articles:</span>
            <span class="value">{{ gameState.clickCount }}</span>
          </div>
        </div>
      </div>

      <div class="article-container" *ngIf="currentPage">
        <div class="article-content" [innerHTML]="currentPage.content" (click)="onContentClick($event)"></div>
      </div>

      <div class="loading" *ngIf="isLoading">
        <div class="spinner"></div>
        <p>Loading article...</p>
      </div>
    </div>
  `,
  styles: [`
    .game-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #1E1B4B 100%);
    }

    .game-header {
      background: rgba(30, 27, 75, 0.9);
      backdrop-filter: blur(10px);
      border-bottom: 2px solid #4C1D95;
      padding: 1rem 2rem;
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .game-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .target-info, .current-info, .stats {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .label {
      font-weight: bold;
      color: #8B5CF6;
    }

    .value {
      color: #E5E7EB;
      font-weight: 500;
    }

    .stats {
      gap: 1rem;
    }    .article-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 4rem;
      background: linear-gradient(145deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.95));
      margin-top: 1rem;
      border-radius: 20px;
      box-shadow: 
        0 20px 60px rgba(0, 0, 0, 0.4),
        0 0 0 1px rgba(139, 92, 246, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.8);
      border: 2px solid rgba(139, 92, 246, 0.4);
      backdrop-filter: blur(10px);
    }

    .article-content {
      color: #1F2937;
      line-height: 1.8;
      font-size: 1.1rem;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      text-rendering: optimizeLegibility;
    }    .article-content :global(h1),
    .article-content :global(h2),
    .article-content :global(h3) {
      color: #1F2937;
      margin: 3rem 0 1.5rem 0;
      padding: 1.5rem 0 1rem 0;
      font-weight: 700;
      position: relative;
    }

    .article-content :global(h1) {
      font-size: 2.5rem;
      color: #111827;
      background: linear-gradient(135deg, #8B5CF6, #3B82F6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      border-bottom: 3px solid transparent;
      background-image: linear-gradient(white, white), linear-gradient(135deg, #8B5CF6, #3B82F6);
      background-origin: border-box;
      background-clip: padding-box, border-box;
      margin-bottom: 2rem;
      text-align: center;
      padding: 2rem 0;
    }

    .article-content :global(h1::after) {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 100px;
      height: 3px;
      background: linear-gradient(135deg, #8B5CF6, #3B82F6);
      border-radius: 2px;
    }

    .article-content :global(h2) {
      font-size: 2rem;
      color: #1F2937;
      border-left: 6px solid #8B5CF6;
      padding-left: 1.5rem;
      background: linear-gradient(90deg, rgba(139, 92, 246, 0.08), transparent);
      border-radius: 0 12px 12px 0;
      margin-top: 4rem;
      margin-bottom: 2rem;
      padding-top: 1rem;
      padding-bottom: 1rem;
    }

    .article-content :global(h2::before) {
      content: '';
      position: absolute;
      left: -2rem;
      top: 50%;
      transform: translateY(-50%);
      width: 8px;
      height: 40px;
      background: linear-gradient(135deg, #8B5CF6, #3B82F6);
      border-radius: 4px;
      box-shadow: 0 4px 8px rgba(139, 92, 246, 0.3);
    }

    .article-content :global(h3) {
      font-size: 1.5rem;
      color: #374151;
      border-bottom: 2px solid rgba(139, 92, 246, 0.3);
      padding-bottom: 0.75rem;
      margin-top: 2.5rem;
      position: relative;
    }

    .article-content :global(h3::after) {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 60px;
      height: 2px;
      background: linear-gradient(135deg, #8B5CF6, #3B82F6);
      border-radius: 1px;
    }    .article-content :global(a) {
      color: #1E40AF;
      text-decoration: none;
      border-bottom: 1px solid transparent;
      transition: all 0.3s ease;
      cursor: pointer;
      font-weight: 600;
      padding: 3px 6px;
      border-radius: 6px;
      position: relative;
      background: linear-gradient(135deg, transparent, rgba(30, 64, 175, 0.05));
    }

    .article-content :global(a:hover) {
      color: #1D4ED8;
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(139, 92, 246, 0.1));
      border-bottom-color: #3B82F6;
      text-decoration: none;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
    }    .article-content :global(p) {
      margin: 1.5rem 0;
      color: #374151;
      font-size: 1.1rem;
      text-align: justify;
      text-justify: inter-word;
    }

    .article-content :global(p:first-of-type) {
      font-size: 1.2rem;
      font-weight: 500;
      color: #1F2937;
      line-height: 1.9;
      padding: 1.5rem;
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(59, 130, 246, 0.05));
      border-left: 4px solid #8B5CF6;
      border-radius: 0 12px 12px 0;
      margin: 2rem 0;
    }

    .article-content :global(ul),
    .article-content :global(ol) {
      margin: 1.5rem 0;
      padding-left: 2.5rem;
      color: #374151;
    }

    .article-content :global(li) {
      margin: 0.8rem 0;
      color: #374151;
      line-height: 1.7;
    }

    .article-content :global(li::marker) {
      color: #8B5CF6;
      font-weight: bold;
    }    .article-content :global(table) {
      border-collapse: collapse;
      width: 100%;
      margin: 2rem 0;
      background: #FFFFFF;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 
        0 8px 25px rgba(0, 0, 0, 0.15),
        0 0 0 1px rgba(139, 92, 246, 0.1);
    }

    .article-content :global(th),
    .article-content :global(td) {
      border: 1px solid rgba(209, 213, 219, 0.8);
      padding: 1.2rem;
      text-align: left;
    }

    .article-content :global(th) {
      background: linear-gradient(135deg, #8B5CF6, #3B82F6);
      color: white;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-size: 0.9rem;
    }

    .article-content :global(td) {
      color: #374151;
      background: #FFFFFF;
      font-size: 1rem;
    }

    .article-content :global(tr:nth-child(even) td) {
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.03), rgba(59, 130, 246, 0.02));
    }

    .article-content :global(tr:hover td) {
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(59, 130, 246, 0.05));
      transition: background 0.3s ease;
    }    .article-content :global(blockquote) {
      border-left: 5px solid #8B5CF6;
      padding: 1.5rem 2rem;
      margin: 2rem 0;
      font-style: italic;
      color: #4B5563;
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(59, 130, 246, 0.05));
      border-radius: 0 16px 16px 0;
      box-shadow: 0 4px 12px rgba(139, 92, 246, 0.1);
      position: relative;
    }

    .article-content :global(blockquote::before) {
      content: '"';
      font-size: 4rem;
      color: rgba(139, 92, 246, 0.3);
      position: absolute;
      top: -10px;
      left: 15px;
      font-family: serif;
    }

    /* Section Dividers */
    .article-content :global(hr) {
      border: none;
      height: 3px;
      background: linear-gradient(135deg, #8B5CF6, #3B82F6, #10B981);
      margin: 3rem 0;
      border-radius: 2px;
      box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);
    }

    /* Add visual section breaks after certain elements */
    .article-content :global(h2 + *) {
      border-top: 1px solid rgba(139, 92, 246, 0.1);
      padding-top: 1.5rem;
      margin-top: 1.5rem;
    }

    .article-content :global(code) {
      background: linear-gradient(135deg, #F3F4F6, #E5E7EB);
      color: #1F2937;
      padding: 4px 8px;
      border-radius: 6px;
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
      border: 1px solid rgba(139, 92, 246, 0.2);
    }

    .article-content :global(pre) {
      background: linear-gradient(135deg, #F3F4F6, #E5E7EB);
      color: #1F2937;
      padding: 1.5rem;
      border-radius: 12px;
      overflow-x: auto;
      margin: 2rem 0;
      border: 1px solid rgba(139, 92, 246, 0.2);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .loading {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 50vh;
      color: #E5E7EB;
    }

    .spinner {
      width: 50px;
      height: 50px;
      border: 3px solid rgba(139, 92, 246, 0.3);
      border-top: 3px solid #8B5CF6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .game-info {
        flex-direction: column;
        align-items: flex-start;
      }
        .article-container {
        margin: 1rem;
        padding: 2rem 1.5rem;
      }
      
      .article-content {
        font-size: 1rem;
      }
      
      .article-content :global(h1) {
        font-size: 1.8rem;
      }
      
      .article-content :global(h2) {
        font-size: 1.5rem;
      }
      
      .article-content :global(h3) {
        font-size: 1.2rem;
      }
    }
  `]
})
export class GameViewComponent implements OnInit, OnDestroy {
  currentPage: WikipediaPage | null = null;
  gameState: any = {};
  elapsedTime = 0;
  isLoading = false;
  private timerSubscription?: Subscription;

  constructor(
    private wikipediaService: WikipediaService,
    private gameService: GameService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.gameState = this.gameService.getGameState();
    this.loadCurrentArticle();
    this.startTimer();
  }

  ngOnDestroy(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  private startTimer(): void {
    this.timerSubscription = interval(10).subscribe(() => {
      this.elapsedTime = this.gameService.getElapsedTime();
    });
  }
  private loadCurrentArticle(): void {
    if (this.gameState.currentArticle) {
      this.isLoading = true;
      this.wikipediaService.getArticle(this.gameState.currentArticle).subscribe({
        next: (page) => {
          this.currentPage = {
            ...page,
            content: this.sanitizer.bypassSecurityTrustHtml(page.content) as any
          };
          this.isLoading = false;
          
          // Scroll to top when new article loads
          setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }, 100);
        },
        error: (error) => {
          console.error('Error loading article:', error);
          this.isLoading = false;
        }
      });
    }
  }

  onContentClick(event: Event): void {
    const target = event.target as HTMLElement;
    
    if (target.tagName === 'A') {
      event.preventDefault();
      const href = target.getAttribute('href');
      
      if (href && href.startsWith('./')) {
        const articleTitle = decodeURIComponent(href.substring(2));
        this.navigateToArticle(articleTitle);
      }
    }
  }

  private navigateToArticle(title: string): void {
    const gameWon = this.gameService.visitArticle(title);
    this.gameState = this.gameService.getGameState();
    
    if (gameWon) {
      // Game completed!
      return;
    }
    
    this.loadCurrentArticle();
  }

  formatTime(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const ms = Math.floor((milliseconds % 1000) / 10);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  }
}
