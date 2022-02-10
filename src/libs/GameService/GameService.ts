import { Guess, LetterStatus } from './../../types/guess';
import { GameClient, GameClientOptions } from '../../types/game-client';
import GameClientService from '../GameClientService/GameClientService';
import GuessService from '../GuessService/GuessService';
import WordService from '../WordService/WordService';

export default class GameService {
  private guesses: Guess[] = [];
  private wordService: WordService;
  private guessService: GuessService;

  constructor(private clientService: GameClientService<GameClient>) {
    this.wordService = new WordService();
    this.guessService = new GuessService(this.wordService);
  }

  async playGame(options: GameClientOptions = {}) {
    const { random = false, screenshot = false } = options;
    let won = false;
    while (!won && this.guesses.length < 6) {
      if (random) this.wordService.shuffleWords();
      await this.makeGuess();
      await this.updateGuesses();
      this.updateWords();
      won = this.isLastGuessCorrect();
    }

    console.log(won ? 'WON' : 'LOST');
  }

  private get lastGuess(): Guess | undefined {
    return this.guesses[this.guesses.length - 1];
  }

  private isLastGuessCorrect() {
    return !!this.lastGuess?.word.every((letter) => letter.status === LetterStatus.Correct);
  }

  private async makeGuess() {
    const word = this.guessService.highestValueGuess(this.wordService.getAllowedWords());

    await this.clientService.guessWord(word);
  }

  private updateWords() {
    if (!this.lastGuess) return;
    this.wordService.filterWords(this.lastGuess);
  }

  // change this to get all guesses from client
  private async updateGuesses() {
    const guess = await this.clientService.getLastGuess();
    if (!guess) return;
    if (this.lastGuess && guess.number <= this.lastGuess.number) return;

    this.guesses.push(guess);
  }
}
