import { Injectable } from '@angular/core';

export interface GameState {
  isGameActive: boolean;
  startTime: number | null;
  endTime: number | null;
  targetArticle: string | null;
  currentArticle: string | null;
  visitedArticles: string[];
  clickCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private gameState: GameState = {
    isGameActive: false,
    startTime: null,
    endTime: null,
    targetArticle: null,
    currentArticle: null,
    visitedArticles: [],
    clickCount: 0
  };

  getGameState(): GameState {
    return { ...this.gameState };
  }

  setTargetArticle(article: string): void {
    this.gameState.targetArticle = article;
  }

  startGame(startingArticle: string): void {
    this.gameState.isGameActive = true;
    this.gameState.startTime = performance.now();
    this.gameState.endTime = null;
    this.gameState.currentArticle = startingArticle;
    this.gameState.visitedArticles = [startingArticle];
    this.gameState.clickCount = 0;
  }
  visitArticle(article: string): boolean {
    if (!this.gameState.isGameActive) return false;

    this.gameState.currentArticle = article;
    this.gameState.visitedArticles.push(article);
    this.gameState.clickCount++;

    // Check if we reached the target - normalize both titles for comparison
    const normalizedArticle = this.normalizeTitle(article);
    const normalizedTarget = this.normalizeTitle(this.gameState.targetArticle || '');
    
    if (normalizedArticle === normalizedTarget) {
      this.endGame();
      return true;
    }

    return false;
  }

  private normalizeTitle(title: string): string {
    // Normalize title by replacing underscores with spaces and trimming
    return title.replace(/_/g, ' ').trim().toLowerCase();
  }

  private endGame(): void {
    this.gameState.isGameActive = false;
    this.gameState.endTime = performance.now();
  }

  getElapsedTime(): number {
    if (!this.gameState.startTime) return 0;
    const endTime = this.gameState.endTime || performance.now();
    return endTime - this.gameState.startTime;
  }

  resetGame(): void {
    this.gameState = {
      isGameActive: false,
      startTime: null,
      endTime: null,
      targetArticle: null,
      currentArticle: null,
      visitedArticles: [],
      clickCount: 0
    };
  }
}
