import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

const db = admin.firestore();

export const onReactionCreate = functions.firestore
  .document('reactions/{reactionId}')
  .onCreate(async (snapshot) => {
    const reaction = snapshot.data();
    const { postId, type } = reaction;

    const postRef = db.collection('posts').doc(postId);

    await db.runTransaction(async (transaction) => {
      const postDoc = await transaction.get(postRef);
      if (!postDoc.exists) return;

      const increment = FieldValue.increment(1);

      if (type === 'like') {
        transaction.update(postRef, { likesCount: increment });
      } else if (type === 'dislike') {
        transaction.update(postRef, { dislikesCount: increment });
      }
    });
  });

export const onReactionDelete = functions.firestore
  .document('reactions/{reactionId}')
  .onDelete(async (snapshot) => {
    const reaction = snapshot.data();
    const { postId, type } = reaction;

    const postRef = db.collection('posts').doc(postId);

    await db.runTransaction(async (transaction) => {
      const postDoc = await transaction.get(postRef);
      if (!postDoc.exists) return;

      const decrement = FieldValue.increment(-1);

      if (type === 'like') {
        transaction.update(postRef, { likesCount: decrement });
      } else if (type === 'dislike') {
        transaction.update(postRef, { dislikesCount: decrement });
      }
    });
  });

export const onReactionUpdate = functions.firestore
  .document('reactions/{reactionId}')
  .onUpdate(async (change) => {
    const afterData = change.after.data();
    const beforeData = change.before.data();

    if (beforeData.type === afterData.type) return null;

    const { postId } = afterData;
    const postRef = db.collection('posts').doc(postId);

    const oldField =
      beforeData.type === 'like' ? 'likesCount' : 'dislikesCount';
    const newField = afterData.type === 'like' ? 'likesCount' : 'dislikesCount';

    const decrease = FieldValue.increment(-1);
    const increase = FieldValue.increment(1);

    await db.runTransaction(async (transaction) => {
      const postDoc = await transaction.get(postRef);
      if (!postDoc.exists) return;

      const updates: any = {};

      if (beforeData.type === 'like') {
        updates.likesCount = decrease;
      } else if (beforeData.type === 'dislike') {
        updates.dislikesCount = decrease;
      }

      if (afterData.type === 'like') {
        updates.likesCount = increase;
      } else if (afterData.type === 'dislike') {
        updates.dislikesCount = increase;
      }

      transaction.update(postRef, updates);
    });
  });
