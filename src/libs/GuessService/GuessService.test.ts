import { describe } from 'mocha';
import { expect } from 'chai';
import GuessService from './GuessService';
import WordService from '../WordService/WordService';

describe('GuessService', function () {
  const guessService = new GuessService(new WordService());
  const mockWords = ['apple', 'audio', 'skill'];
  describe('highestValueGuess', () => {
    const word = guessService.highestValueGuess(mockWords);

    it('should return a word in the list of allowed words', () => {
      expect(mockWords).includes(word);
    });

    it('should return a word with unique letters', () => {
      expect(new Set(word.split('')).size).equals(5);
    });
  });
});
