import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from './services/game.service';
import { TargetSelectionComponent } from './components/target-selection.component';
import { GameViewComponent } from './components/game-view.component';
import { EndGameComponent } from './components/end-game.component';

@Component({
  selector: 'app-root',
  imports: [CommonModule, TargetSelectionComponent, GameViewComponent, EndGameComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.less'
})
export class AppComponent implements OnInit {
  title = 'wiki-runner';
  gameState: any = {};

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    // Check game state every 100ms to update the view
    setInterval(() => {
      this.gameState = this.gameService.getGameState();
    }, 100);
  }

  get currentView(): string {
    if (!this.gameState.targetArticle) {
      return 'target-selection';
    } else if (this.gameState.isGameActive) {
      return 'game-view';
    } else if (this.gameState.endTime) {
      return 'end-game';
    }
    return 'target-selection';
  }
}
