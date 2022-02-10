import { Guess } from './../../types/guess';
import WordService from '../WordService/WordService';

export default class GuessService {
  constructor(private wordService: WordService) {}
  getUniqueLetterWords(words: string[]): string[] {
    return words.filter((word) => new Set(word.split('')).size === 5);
  }

  getGuessValue(guess: Guess): number {
    // const { length: currentLength } = this.wordService.getAllowedWords();
    // const { length: newLength } = this.wordService.newWordsIfGuessed(guess);
    return this.wordService.getAllowedWords().length;
  }

  highestValueGuess(words: string[]): string {
    return this.getUniqueLetterWords(words)[0] || words[0];
  }
}
