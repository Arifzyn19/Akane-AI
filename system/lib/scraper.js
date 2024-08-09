
/*
  Author : AR
  Github : http://github.com/Arifzyn19
*/

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const scraperDir = path.join(__dirname, '../../storage', 'scraper');
const scraper = {};

const loadScraper = async () => {
  const files = fs.readdirSync(scraperDir);

  for (const file of files) {
    if (path.extname(file) === '.js') {
      const scraperName = path.basename(file, '.js');
      try {
        const module = await import(path.join(scraperDir, file));
        scraper[scraperName] = module.default;
      } catch (error) {
        console.error(`Gagal memuat scraper ${file}:`, error);
      }
    }
  }

  return scraper;
};

export {
	loadScraper,
	scraper
}