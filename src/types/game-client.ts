import puppeteer from 'puppeteer';

export type GameClientOptions = {
  random?: boolean;
  screenshot?: boolean;
};

export type GameClient = puppeteer.Page;
