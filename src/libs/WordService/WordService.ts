import allowedWordsJson from '../../data/allowedWords.json';
import possibleWordsJson from '../../data/possibleWords.json';
import { Guess, LetterStatus } from '../../types/guess';

export default class WordService {
  private allowedWords: string[] = allowedWordsJson;

  shuffleWords() {
    for (let i = 0; i < this.allowedWords.length; i++) {
      const temp = this.allowedWords[i];
      const randomIndex = Math.floor(Math.random() * this.allowedWords.length);
      this.allowedWords[i] = this.allowedWords[randomIndex];
      this.allowedWords[randomIndex] = temp;
    }
  }

  getAllowedWords(): string[] {
    return this.allowedWords;
  }

  filterWords(guess: Guess): void {
    this.allowedWords = this.newWordsIfGuessed(guess);
  }

  newWordsIfGuessed(guess: Guess): string[] {
    let newWords = [...this.allowedWords];
    guess.word.forEach(({ letter, order, status }) => {
      newWords = newWords.filter((word) => {
        if (status === LetterStatus.Absent) {
          if (
            guess.word.findIndex((l) => l.letter === letter && l.status !== LetterStatus.Absent) ===
            -1
          ) {
            return !word.includes(letter);
          } else {
            return true;
          }
        }

        if (status === LetterStatus.Present) {
          return word.includes(letter) && word[order - 1] !== letter;
        }

        if (status === LetterStatus.Correct) {
          return word[order - 1] === letter;
        }
      });
    });
    return newWords;
  }
}
