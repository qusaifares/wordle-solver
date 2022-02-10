import { describe } from 'mocha';
import { assert, expect } from 'chai';
import { Guess, LetterGuess, LetterStatus } from '../../types/guess';
import WordService from './WordService';

const generateMockGuess = (guessedWord: string, actualWord: string): Guess => {
  const word: LetterGuess[] = guessedWord.split('').map((letter, i) => {
    let status: LetterStatus;
    if (actualWord[i] === letter) {
      status = LetterStatus.Correct;
    } else if (actualWord.includes(letter)) {
      status = LetterStatus.Present;
    } else {
      status = LetterStatus.Absent;
    }

    return { letter, status, order: i + 1 };
  });
  return { word, number: 1 };
};

describe('WordService', function () {
  describe('getAllowedWords', () => {
    const wordService = new WordService();

    const mockGuess: Guess = generateMockGuess('apple', 'apple');

    wordService.filterWords(mockGuess);
    const words = wordService.getAllowedWords();

    it('Should return an array of length 1.', () => {
      expect(words).length(1, 'array length of 1');
    });
    it('Should return an array with the exact word.', () => {
      assert(words.includes('apple'), 'exact word is present');
    });
  });
});
