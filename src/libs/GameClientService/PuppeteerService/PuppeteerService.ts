import { Page } from 'puppeteer';
import puppeteer from 'puppeteer';
import { Guess, LetterGuess, LetterStatus } from '../../../types/guess';
import GameClientService from '../GameClientService';
import { ElementHandle } from 'puppeteer';

export default class PuppeteerService implements GameClientService<Page> {
  public client!: Page;

  static async init(): Promise<PuppeteerService> {
    const service = new PuppeteerService();
    await service.initClient();
    return service;
  }

  async initClient(): Promise<void> {
    const browser = await puppeteer.launch({ headless: false });
    this.client = await browser.newPage();
    await this.client.goto('https://www.powerlanguage.co.uk/wordle/', {
      waitUntil: 'domcontentloaded',
    });

    await this.closeModal();
  }

  private async closeModal() {
    return this.client.evaluate(() => {
      const closeBtn = document
        .querySelector('game-app')
        ?.shadowRoot?.querySelector<HTMLElement>('#game > game-modal');
      closeBtn?.click();
    });
  }

  private async getGuessFromRow(
    rowHandle: ElementHandle<HTMLElement>,
    rowNumber: number
  ): Promise<Guess> {
    const word = await this.client.evaluate((row: HTMLElement) => {
      const letters = (row as any)._letters;
      if (!letters) {
        throw new Error("Row's letters attribute not found.");
      }
      const word: LetterGuess[] = [];
      const { $tiles } = row as any;
      for (let i = 0; i < 5; i++) {
        const tile = $tiles[i];
        const letter = tile._letter;
        const status = tile._state as LetterStatus | null;

        if (!letter) {
          throw new Error("Tile's letter attribute not found.");
        }

        if (!status) {
          throw new Error("Tile's evaluation attribute not found.");
        }

        word.push({ letter, status, order: i + 1 });
      }
      return word;
    }, rowHandle);
    return {
      word,
      number: rowNumber,
    };
  }

  async getLastGuessNumber(): Promise<number> {
    // get rows
    const lastGuessRow = await this.client.evaluate(() => {
      const board = document.querySelector('game-app')?.shadowRoot?.getElementById('board');

      const rows = board?.querySelectorAll('game-row');

      if (!rows) return;
      let lastGuess: number = 0;
      rows.forEach((row, i) => {
        const shadow = row.shadowRoot;
        const tile = shadow?.querySelector('game-tile');
        if (['absent', 'present', 'correct'].includes((tile as any).getAttribute('evaluation'))) {
          lastGuess = i + 1;
        }
        // turn lastGuess element into Guess object
      });
      return lastGuess;
    }, []);

    return lastGuessRow || 0;
  }

  async getAllGuesses(): Promise<Guess[]> {
    // get rows
    const guessRows =
      (await this.client.evaluate(() => {
        const board = document.querySelector('game-app')?.shadowRoot?.getElementById('board');

        const rows = board?.querySelectorAll('game-row');

        if (!rows) return;
        const guessRows: Element[] = [];
        rows.forEach((row) => {
          const shadow = row.shadowRoot;
          const tile = shadow?.querySelector('game-tile');
          if (['absent', 'present', 'correct'].includes((tile as any).getAttribute('evaluation'))) {
            guessRows.push(row);
          }
          // turn lastGuess element into Guess object
        });
        return guessRows;
      }, [])) || [];
    // find last row with guessed letters
    return Promise.all(
      guessRows.map((row, i) => this.getGuessFromRow(row as unknown as ElementHandle, i + 1))
    );
  }

  async getLastGuess(): Promise<Guess | null> {
    // get rows
    const { lastGuessRow, lastRowNumber } =
      (await this.client.evaluate(() => {
        const board = document.querySelector('game-app')?.shadowRoot?.getElementById('board');

        const rows = board?.querySelectorAll('game-row');

        if (!rows) return;
        let lastGuess: Element | undefined;
        let lastRowNumber = 0;
        rows.forEach((row, i) => {
          const shadow = row.shadowRoot;
          const tile = shadow?.querySelector('game-tile');
          if (['absent', 'present', 'correct'].includes((tile as any).getAttribute('evaluation'))) {
            lastGuess = row;
            lastRowNumber = i + 1;
          }
          // turn lastGuess element into Guess object
        });
        return { lastGuessRow: lastGuess, lastRowNumber };
      }, [])) || {};
    // find last row with guessed letters
    return lastGuessRow
      ? this.getGuessFromRow(lastGuessRow as unknown as ElementHandle, lastRowNumber || 0)
      : null;
  }

  async guessWord(word: string): Promise<void> {
    // erase next row
    for (let i = 0; i < 5; i++) {
      await this.client.keyboard.press('Backspace');
    }
    // type letters and press enter
    await this.client.keyboard.type(word);
    await this.client.keyboard.press('Enter');
    // wait for animation to finish
    this.closeModal();
    await this.client.waitForTimeout(1750);
  }
}
