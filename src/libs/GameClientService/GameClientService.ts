import { GameClient } from '../../types/game-client';
import { Guess } from '../../types/guess';

export default interface GameClientService<C extends GameClient> {
  client: C;
  initClient(): Promise<void>;
  getLastGuess(): Promise<Guess | null>;
  guessWord(word: string): Promise<void>;
}
