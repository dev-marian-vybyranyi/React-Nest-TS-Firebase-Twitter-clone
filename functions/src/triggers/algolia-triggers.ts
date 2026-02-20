import { algoliasearch } from 'algoliasearch';
import * as functions from 'firebase-functions/v1';

let algoliaClient: ReturnType<typeof algoliasearch> | null = null;

const getAlgoliaClient = () => {
  if (!algoliaClient) {
    algoliaClient = algoliasearch(
      process.env.ALGOLIA_APP_ID || '',
      process.env.ALGOLIA_ADMIN_KEY || '',
    );
  }
  return algoliaClient;
};

export const syncPostToAlgolia = functions.firestore
  .document('posts/{postId}')
  .onWrite(async (change, context) => {
    const { postId } = context.params;

    if (!change.after.exists) {
      console.log(`Deleting post ${postId} from Algolia`);
      await getAlgoliaClient().deleteObject({
        indexName: 'posts',
        objectID: postId,
      });
      return;
    }

    const postData = change.after.data();

    const algoliaObject: Record<string, any> = {
      ...postData,
      objectID: postId,
    };

    if (
      postData?.createdAt &&
      typeof postData.createdAt.toDate === 'function'
    ) {
      algoliaObject.createdAt = postData.createdAt.toDate().getTime();
    }
    if (
      postData?.updatedAt &&
      typeof postData.updatedAt.toDate === 'function'
    ) {
      algoliaObject.updatedAt = postData.updatedAt.toDate().getTime();
    }

    console.log(`Syncing post ${postId} to Algolia`);
    await getAlgoliaClient().saveObject({
      indexName: 'posts',
      body: algoliaObject,
    });
  });
