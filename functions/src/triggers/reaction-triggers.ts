import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';

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

      const increment = admin.firestore.FieldValue.increment(1);

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

      const decrement = admin.firestore.FieldValue.increment(-1);

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
    const newData = change.after.data();
    const oldData = change.before.data();

    if (newData.type === oldData.type) return;

    const { postId } = newData;
    const postRef = db.collection('posts').doc(postId);

    await db.runTransaction(async (transaction) => {
      const postDoc = await transaction.get(postRef);
      if (!postDoc.exists) return;

      const increment = admin.firestore.FieldValue.increment(1);
      const decrement = admin.firestore.FieldValue.increment(-1);

      const updates: any = {};

      if (oldData.type === 'like') {
        updates.likesCount = decrement;
      } else if (oldData.type === 'dislike') {
        updates.dislikesCount = decrement;
      }

      if (newData.type === 'like') {
        updates.likesCount = increment;
      } else if (newData.type === 'dislike') {
        updates.dislikesCount = increment;
      }

      transaction.update(postRef, updates);
    });
  });
