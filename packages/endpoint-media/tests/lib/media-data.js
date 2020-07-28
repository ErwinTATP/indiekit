import test from 'ava';
import {getFixture} from '../helpers/fixture.js';
import {JekyllPreset} from '../../../preset-jekyll/index.js';
import {mediaData} from '../../lib/media-data.js';

test('Creates media data', async t => {
  const file = {
    buffer: getFixture('photo.jpg', false),
    originalname: 'photo.jpg'
  };
  const publication = {
    config: new JekyllPreset().config,
    me: 'https://website.example'
  };
  const result = await mediaData.create(publication, file);
  t.is(result.type, 'photo');
  t.regex(result.path, /\b[\d\w]{5}\b/g);
  t.truthy(result.properties);
});

test('Throws error creating media data without a known post type', async t => {
  const file = {
    buffer: getFixture('font.ttf', false),
    originalname: 'font.ttf'
  };
  const publication = {
    config: new JekyllPreset().config,
    me: 'https://website.example'
  };
  const error = await t.throwsAsync(
    mediaData.create(publication, file)
  );
  t.is(error.message, 'Cannot read property \'media\' of undefined');
});

test('Throws error creating media data without a file', async t => {
  const publication = {
    config: new JekyllPreset().config,
    me: 'https://website.example'
  };
  const error = await t.throwsAsync(
    mediaData.create(publication, false)
  );
  t.is(error.message, 'No file included in request');
});

test('Reads media data', async t => {
  const url = 'https://website.example/photo.jpg';
  const publication = {
    media: {
      get: async key => ({
        type: 'photo',
        path: 'photo.jpg',
        url: key,
        properties: {}
      })
    }
  };
  const result = await mediaData.read(publication, url);
  t.is(result.type, 'photo');
});

test('Throws error reading media', async t => {
  const url = 'https://website.example/photo.jpg';
  const error = await t.throwsAsync(
    mediaData.read(false, url)
  );
  t.is(error.message, 'Cannot read property \'get\' of undefined');
});