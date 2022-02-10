import PuppeteerService from './libs/GameClientService/PuppeteerService/PuppeteerService';
import GameService from './libs/GameService/GameService';
import GuessService from './libs/GuessService/GuessService';
import WordService from './libs/WordService/WordService';

const run = async () => {
  const game = new GameService(await PuppeteerService.init());
  game.playGame({ random: true });
};

run();
