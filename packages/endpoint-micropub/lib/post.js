import {supplant} from './utils.js';

export const post = {
  /**
   * Create post
   *
   * @param {object} publication Publication configuration
   * @param {object} postData Post data
   * @returns {object} Response data
   */
  create: async (publication, postData) => {
    const {posts, store} = publication;
    const content = publication.postTemplate(postData.properties);
    const message = supplant(store.messageFormat, {
      action: 'create',
      fileType: 'post',
      postType: postData.properties['post-type']
    });
    const published = await store.createFile(postData.path, content, message);

    if (published) {
      postData.date = new Date();
      postData.lastAction = 'create';

      if (posts) {
        await posts.insertOne(postData, {
          checkKeys: false
        });
      }

      return {
        location: postData.properties.url,
        status: 202,
        json: {
          success: 'create_pending',
          success_description: `Post will be created at ${postData.properties.url}`
        }
      };
    }
  },

  /**
   * Update post
   *
   * @param {object} publication Publication configuration
   * @param {object} postData Post data
   * @param {string} url Files attached to request
   * @returns {object} Response data
   */
  update: async (publication, postData, url) => {
    const {posts, store} = publication;
    const content = publication.postTemplate(postData.properties);
    const message = supplant(store.messageFormat, {
      action: 'update',
      fileType: 'post',
      postType: postData.properties['post-type']
    });
    const published = await store.updateFile(postData.path, content, message);

    if (published) {
      postData.date = new Date();
      postData.lastAction = 'update';

      if (posts) {
        await posts.replaceOne({
          url: postData.properties.url
        }, postData, {
          checkKeys: false
        });
      }

      const hasUpdatedUrl = (url !== postData.properties.url);
      return {
        location: postData.properties.url,
        status: hasUpdatedUrl ? 201 : 200,
        json: {
          success: 'update',
          success_description: hasUpdatedUrl ?
            `Post updated and moved to ${postData.properties.url}` :
            `Post updated at ${url}`
        }
      };
    }
  },

  /**
   * Delete post
   *
   * @param {object} publication Publication configuration
   * @param {object} postData Post data
   * @returns {object} Response data
   */
  delete: async (publication, postData) => {
    const {posts, store} = publication;
    const message = supplant(store.messageFormat, {
      action: 'delete',
      fileType: 'post',
      postType: postData.properties['post-type']
    });
    const published = await store.deleteFile(postData.path, message);

    if (published) {
      postData.date = new Date();
      postData.lastAction = 'delete';

      if (posts) {
        await posts.replaceOne({
          url: postData.properties.url
        }, postData, {
          checkKeys: false
        });
      }

      return {
        status: 200,
        json: {
          success: 'delete',
          success_description: `Post deleted from ${postData.properties.url}`
        }
      };
    }
  },

  /**
   * Undelete post
   *
   * @param {object} publication Publication configuration
   * @param {object} postData Post data
   * @returns {object} Response data
   */
  undelete: async (publication, postData) => {
    const {posts, store} = publication;

    if (postData.lastAction !== 'delete') {
      throw new Error('Post was not previously deleted');
    }

    const content = publication.postTemplate(postData.properties);
    const message = supplant(store.messageFormat, {
      action: 'undelete',
      fileType: 'post',
      postType: postData.properties['post-type']
    });
    const published = await store.createFile(postData.path, content, message);

    if (published) {
      postData.date = new Date();
      postData.lastAction = 'undelete';

      if (posts) {
        await posts.replaceOne({
          url: postData.properties.url
        }, postData, {
          checkKeys: false
        });
      }

      return {
        location: postData.properties.url,
        status: 200,
        json: {
          success: 'delete_undelete',
          success_description: `Post undeleted from ${postData.properties.url}`
        }
      };
    }
  }
};
