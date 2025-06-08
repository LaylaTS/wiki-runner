import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../services/game.service';

@Component({
  selector: 'app-end-game',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="end-game-container">
      <div class="completion-card">
        <h1 class="victory-title">🎉 Speedrun Complete! 🎉</h1>
          <!-- Main Statistics Display -->
        <div class="main-stats">
          <div class="primary-stat time-stat">
            <div class="stat-icon">⏱️</div>
            <div class="stat-content">
              <div class="stat-value">{{ formatTime(elapsedTime) }}</div>
              <div class="stat-label">Completion Time</div>
            </div>
          </div>
          
          <div class="primary-stat articles-stat">
            <div class="stat-icon">📄</div>
            <div class="stat-content">
              <div class="stat-value">{{ gameState.clickCount }}</div>
              <div class="stat-label">Articles Visited</div>
            </div>
          </div>
        </div>        <div class="secondary-stats">
          <div class="stat-card target-card">
            <div class="stat-icon">🎯</div>
            <div class="stat-content">
              <div class="stat-value">{{ gameState.targetArticle }}</div>
              <div class="stat-label">Target Article</div>
            </div>
          </div>
          
          <div class="stat-card efficiency-card">
            <div class="stat-icon">⚡</div>
            <div class="stat-content">
              <div class="stat-value">{{ getOverallRating().rank }}</div>
              <div class="stat-label">Overall Performance</div>
            </div>
          </div>
        </div>

        <!-- Detailed Performance Rankings -->
        <div class="performance-rankings">
          <div class="ranking-grid">            <div class="rank-card time-rank">
              <div class="rank-header">
                <div class="rank-icon">⏱️</div>
                <div class="rank-title">Time Rank</div>
              </div>
              <div class="rank-content">
                <div class="rank-display">
                  <div class="rank-grade">{{ getTimeRating().rank }}</div>
                  <div class="rank-description">{{ getTimeRating().description }}</div>
                </div>
              </div>
            </div>

            <div class="rank-card efficiency-rank">
              <div class="rank-header">
                <div class="rank-icon">🎯</div>
                <div class="rank-title">Click Efficiency</div>
              </div>
              <div class="rank-content">
                <div class="rank-display">
                  <div class="rank-grade">{{ getClickRating().rank }}</div>
                  <div class="rank-description">{{ getClickRating().description }}</div>
                </div>
              </div>
            </div>

            <div class="rank-card overall-rank">
              <div class="rank-header">
                <div class="rank-icon">🏆</div>
                <div class="rank-title">Overall Rank</div>
              </div>
              <div class="rank-content">
                <div class="rank-display">
                  <div class="rank-grade">{{ getOverallRating().rank }}</div>
                  <div class="rank-description">{{ getOverallRating().description }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="path-section">
          <h3>Your Path:</h3>
          <div class="article-path">
            <div 
              *ngFor="let article of gameState.visitedArticles; let i = index" 
              class="path-item"
              [class.target]="article === gameState.targetArticle"
            >
              <span class="article-number">{{ i + 1 }}</span>
              <span class="article-name">{{ article }}</span>
              <div *ngIf="i < gameState.visitedArticles.length - 1" class="arrow">→</div>
            </div>
          </div>
        </div>        <div class="action-buttons">
          <button class="play-again-btn" (click)="playAgain()">
            🔄 Play Again
          </button>
        </div><div class="performance-analysis">
          <h4>📊 Detailed Performance Analysis</h4>
          <div class="analysis-grid">
            <div class="analysis-item">
              <span class="metric">Average time per article:</span>
              <span class="value">{{ formatTime(elapsedTime / gameState.clickCount) }}</span>
            </div>
            <div class="analysis-item">
              <span class="metric">Total completion time:</span>
              <span class="value">{{ formatTime(elapsedTime) }}</span>
            </div>
            <div class="analysis-item">
              <span class="metric">Navigation efficiency:</span>
              <span class="value">{{ getNavigationEfficiency() }}%</span>
            </div>
            <div class="analysis-item">
              <span class="metric">Speed category:</span>
              <span class="value">{{ getSpeedCategory() }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .end-game-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #1E1B4B 100%);
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 2rem;
    }

    .completion-card {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(20px);
      border: 2px solid #8B5CF6;
      border-radius: 20px;
      padding: 3rem;
      max-width: 800px;
      width: 100%;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      text-align: center;
    }

    .victory-title {
      font-size: 2.5rem;
      background: linear-gradient(45deg, #8B5CF6, #3B82F6, #10B981);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 2rem;
      animation: rainbow 3s ease-in-out infinite;
    }

    @keyframes rainbow {
      0%, 100% { filter: hue-rotate(0deg); }
      50% { filter: hue-rotate(90deg); }
    }    .main-stats {
      display: flex;
      justify-content: center;
      gap: 3rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }

    .primary-stat {
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.2));
      border: 2px solid #8B5CF6;
      border-radius: 20px;
      padding: 2rem;
      min-width: 200px;
      display: flex;
      align-items: center;
      gap: 1rem;
      transition: all 0.3s ease;
      box-shadow: 0 10px 30px rgba(139, 92, 246, 0.3);
    }

    .primary-stat:hover {
      transform: translateY(-5px) scale(1.02);
      box-shadow: 0 15px 40px rgba(139, 92, 246, 0.4);
    }

    .time-stat {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.2));
      border-color: #10B981;
    }

    .articles-stat {
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.2));
      border-color: #F59E0B;
    }

    .stat-icon {
      font-size: 3rem;
      filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.3));
    }

    .stat-content {
      flex: 1;
    }

    .primary-stat .stat-value {
      font-size: 2.5rem;
      font-weight: bold;
      color: #F3F4F6;
      margin-bottom: 0.5rem;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    }

    .primary-stat .stat-label {
      color: #D1D5DB;
      font-size: 1.1rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .secondary-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }    .stat-card {
      background: rgba(139, 92, 246, 0.1);
      border: 1px solid #4C1D95;
      border-radius: 16px;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      transition: transform 0.3s ease;
    }

    .stat-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 25px rgba(139, 92, 246, 0.2);
    }

    .stat-card .stat-icon {
      font-size: 2rem;
    }

    .stat-card .stat-value {
      font-size: 1.3rem;
      font-weight: bold;
      color: #E5E7EB;
      margin-bottom: 0.3rem;
      word-break: break-word;
    }    .stat-card .stat-label {
      color: #8B5CF6;
      font-weight: 500;
      font-size: 0.9rem;
    }    .performance-rankings {
      margin: 2rem 0;
      padding: 2rem;
      background: rgba(30, 27, 75, 0.4);
      border-radius: 20px;
      border: 2px solid #4C1D95;
    }    .ranking-grid {
      display: flex;
      justify-content: center;
      align-items: stretch;
      gap: 1rem;
      flex-wrap: nowrap;
    }    .rank-card {
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(59, 130, 246, 0.15));
      border: 2px solid transparent;
      border-radius: 24px;
      padding: 1.5rem;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
      flex: 1;
      min-width: 180px;
      max-width: 220px;
      display: flex;
      flex-direction: column;
    }

    .rank-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, #8B5CF6, #3B82F6);
      opacity: 0;
      transition: opacity 0.3s ease;
      z-index: -1;
    }

    .rank-card:hover {
      transform: translateY(-5px) scale(1.02);
      box-shadow: 0 15px 40px rgba(139, 92, 246, 0.3);
    }

    .rank-card:hover::before {
      opacity: 0.1;
    }    .time-rank {
      border-color: #10B981;
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(5, 150, 105, 0.25));
    }

    .efficiency-rank {
      border-color: #F59E0B;
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(217, 119, 6, 0.25));
    }

    .overall-rank {
      border-color: #8B5CF6;
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(59, 130, 246, 0.25));
    }

    .rank-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .rank-icon {
      font-size: 1.5rem;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
    }

    .rank-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: #E5E7EB;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }    .rank-content {
      text-align: center;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .rank-display {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }

    .rank-grade {
      font-size: 3rem;
      font-weight: bold;
      background: linear-gradient(45deg, #8B5CF6, #3B82F6, #10B981);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      animation: shimmer 2s ease-in-out infinite;
    }

    @keyframes shimmer {
      0%, 100% { filter: hue-rotate(0deg) brightness(1); }
      50% { filter: hue-rotate(30deg) brightness(1.2); }
    }

    .rank-description {
      font-size: 1.1rem;
      font-weight: 600;
      color: #E5E7EB;
    }

    .path-section {
      margin: 2rem 0;
      text-align: left;
    }

    .path-section h3 {
      color: #E5E7EB;
      margin-bottom: 1rem;
      text-align: center;
    }

    .article-path {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      max-height: 300px;
      overflow-y: auto;      padding: 1rem;
      background: rgba(30, 27, 75, 0.3);
      border-radius: 16px;
      border: 1px solid #4C1D95;
    }    .path-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      transition: all 0.3s ease;
    }

    .path-item.target {
      background: rgba(139, 92, 246, 0.2);
      border: 1px solid #8B5CF6;
      box-shadow: 0 0 15px rgba(139, 92, 246, 0.3);
    }

    .article-number {
      background: #8B5CF6;
      color: white;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 0.9rem;
    }

    .article-name {
      flex: 1;
      color: #E5E7EB;
      font-weight: 500;
    }

    .arrow {
      color: #8B5CF6;
      font-size: 1.2rem;
      font-weight: bold;
    }

    .action-buttons {
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin: 2rem 0;
      flex-wrap: wrap;
    }    .play-again-btn {
      padding: 1.25rem 3rem;
      font-size: 1.2rem;
      font-weight: bold;
      border: none;
      border-radius: 20px;
      cursor: pointer;
      transition: all 0.3s ease;
      min-width: 200px;
      background: linear-gradient(45deg, #10B981, #059669);
      color: white;
      box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .play-again-btn:hover {
      transform: translateY(-3px) scale(1.05);
      box-shadow: 0 10px 30px rgba(16, 185, 129, 0.5);
      background: linear-gradient(45deg, #059669, #047857);
    }

    .play-again-btn:active {
      transform: translateY(-1px) scale(1.02);
    }.performance-analysis {
      margin-top: 2rem;
      padding: 1.5rem;
      background: rgba(30, 27, 75, 0.3);
      border-radius: 16px;
      border: 1px solid #4C1D95;
    }.performance-analysis h4 {
      color: #E5E7EB;
      margin-bottom: 1rem;
      text-align: center;
    }

    .analysis-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }    .analysis-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem;
      background: rgba(139, 92, 246, 0.1);
      border-radius: 12px;
      border: 1px solid rgba(139, 92, 246, 0.2);
      color: #E5E7EB;
      transition: all 0.3s ease;
    }

    .analysis-item:hover {
      background: rgba(139, 92, 246, 0.15);
      transform: translateY(-2px);
    }

    .metric {
      color: #8B5CF6;
    }

    .value {
      font-weight: bold;
    }    @media (max-width: 768px) {
      .completion-card {
        padding: 2rem;
        margin: 1rem;
      }
      
      .victory-title {
        font-size: 2rem;
      }
      
      .main-stats {
        flex-direction: column;
        gap: 1.5rem;
      }
      
      .primary-stat {
        min-width: auto;
        padding: 1.5rem;
      }
      
      .primary-stat .stat-value {
        font-size: 2rem;
      }
      
      .secondary-stats {
        grid-template-columns: 1fr;
      }      .ranking-grid {
        flex-direction: column;
        align-items: center;
        gap: 1rem;
      }

      .rank-card {
        padding: 1.25rem;
        min-width: auto;
        max-width: 100%;
        width: 100%;
      }

      .rank-grade {
        font-size: 2.5rem;
      }

      .analysis-grid {
        grid-template-columns: 1fr;
      }
      
      .action-buttons {
        flex-direction: column;
        align-items: center;
      }
    }
  `]
})
export class EndGameComponent implements OnInit {
  gameState: any = {};
  elapsedTime = 0;

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    this.gameState = this.gameService.getGameState();
    this.elapsedTime = this.gameService.getElapsedTime();
  }

  formatTime(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const ms = Math.floor((milliseconds % 1000) / 10);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  }
  getEfficiencyRating(): string {
    const clicks = this.gameState.clickCount;
    
    if (clicks <= 3) return "🏆 Legendary";
    if (clicks <= 5) return "⭐ Excellent";
    if (clicks <= 8) return "🎯 Good";
    if (clicks <= 12) return "👍 Average";
    return "🔄 Keep Practicing";
  }
  getTimeRating(): { rank: string, description: string } {
    const timeInSeconds = this.elapsedTime / 1000;
    
    if (timeInSeconds <= 30) {
      return { rank: "S+", description: "Lightning Fast" };
    } else if (timeInSeconds <= 60) {
      return { rank: "S", description: "Blazing Speed" };
    } else if (timeInSeconds <= 120) {
      return { rank: "A+", description: "Very Fast" };
    } else if (timeInSeconds <= 180) {
      return { rank: "A", description: "Fast" };
    } else if (timeInSeconds <= 300) {
      return { rank: "B+", description: "Good Speed" };
    } else if (timeInSeconds <= 480) {
      return { rank: "B", description: "Average Speed" };
    } else if (timeInSeconds <= 600) {
      return { rank: "C+", description: "Moderate Speed" };
    } else if (timeInSeconds <= 900) {
      return { rank: "C", description: "Slow" };
    } else {
      return { rank: "D", description: "Very Slow" };
    }
  }
  getClickRating(): { rank: string, description: string } {
    const clicks = this.gameState.clickCount;
    
    if (clicks <= 2) {
      return { rank: "S+", description: "Perfect Path" };
    } else if (clicks <= 3) {
      return { rank: "S", description: "Near Perfect" };
    } else if (clicks <= 5) {
      return { rank: "A+", description: "Excellent" };
    } else if (clicks <= 7) {
      return { rank: "A", description: "Very Good" };
    } else if (clicks <= 10) {
      return { rank: "B+", description: "Good" };
    } else if (clicks <= 15) {
      return { rank: "B", description: "Average" };
    } else if (clicks <= 20) {
      return { rank: "C+", description: "Below Average" };
    } else if (clicks <= 30) {
      return { rank: "C", description: "Poor" };
    } else {
      return { rank: "D", description: "Very Poor" };
    }
  }
  getOverallRating(): { rank: string, description: string } {
    const timeRating = this.getTimeRating();
    const clickRating = this.getClickRating();
    
    // Convert ranks to numeric scores for calculation
    const rankToScore = (rank: string): number => {
      switch(rank) {
        case 'S+': return 10;
        case 'S': return 9;
        case 'A+': return 8;
        case 'A': return 7;
        case 'B+': return 6;
        case 'B': return 5;
        case 'C+': return 4;
        case 'C': return 3;
        case 'D': return 2;
        default: return 1;
      }
    };

    const timeScore = rankToScore(timeRating.rank);
    const clickScore = rankToScore(clickRating.rank);
    
    // Weight time and clicks equally for overall score
    const averageScore = (timeScore + clickScore) / 2;
    
    if (averageScore >= 9.5) {
      return { rank: "S+", description: "Speedrun Master" };
    } else if (averageScore >= 8.5) {
      return { rank: "S", description: "Elite Runner" };
    } else if (averageScore >= 7.5) {
      return { rank: "A+", description: "Expert" };
    } else if (averageScore >= 6.5) {
      return { rank: "A", description: "Skilled" };
    } else if (averageScore >= 5.5) {
      return { rank: "B+", description: "Competent" };
    } else if (averageScore >= 4.5) {
      return { rank: "B", description: "Average" };
    } else if (averageScore >= 3.5) {
      return { rank: "C+", description: "Developing" };
    } else if (averageScore >= 2.5) {
      return { rank: "C", description: "Beginner" };
    } else {
      return { rank: "D", description: "Practice More" };
    }
  }

  getNavigationEfficiency(): number {
    // Calculate efficiency based on ideal minimum clicks (usually 2-3) vs actual clicks
    const idealClicks = 3; // Assume most articles can be reached in 3 clicks ideally
    const actualClicks = this.gameState.clickCount;
    const efficiency = Math.max(0, Math.min(100, (idealClicks / actualClicks) * 100));
    return Math.round(efficiency);
  }

  getSpeedCategory(): string {
    const timeInSeconds = this.elapsedTime / 1000;
    
    if (timeInSeconds <= 60) return "Speed Demon";
    if (timeInSeconds <= 180) return "Quick Navigator";
    if (timeInSeconds <= 300) return "Steady Explorer";
    if (timeInSeconds <= 600) return "Casual Browser";
    return "Methodical Researcher";
  }

  playAgain(): void {
    // Reset and start new game with same target
    this.gameService.resetGame();
    // Trigger navigation back to target selection or directly start new game
    window.location.reload();
  }

  newTarget(): void {
    // Reset completely and go to target selection
    this.gameService.resetGame();
    window.location.reload();
  }
}
