import nunjucks from 'nunjucks';
import path from 'path';
import {fileURLToPath} from 'url';
import languages from 'iso-639-1';
import * as filters from '../filters/index.js';

/**
 * @param {Function} app Express
 * @returns {object} Nunjucks environment
 */
export default function (app) {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));

  const views = [
    path.join(__dirname, '..', 'components'),
    path.join(__dirname, '..', 'layouts'),
    app ? app.settings.views : ''
  ];

  const options = {
    autoescape: true,
    express: app,
    watch: true
  };

  const parser = nunjucks.configure(views, options);
  parser.addFilter('markdown', filters.markdown);
  parser.addFilter('language', string => languages.getNativeName(string));

  return parser;
}
