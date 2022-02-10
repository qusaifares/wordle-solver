export enum LetterStatus {
  Absent = 'absent',
  Present = 'present',
  Correct = 'correct',
}

export interface LetterGuess {
  letter: string;
  status: LetterStatus;
  order: number;
}

export interface Guess {
  word: LetterGuess[];
  number: number;
}
