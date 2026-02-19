import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

const db = admin.firestore();

export const onCommentCreated = functions.firestore
  .document('comments/{commentId}')
  .onCreate(async (snapshot) => {
    const comment = snapshot.data();

    const postId = comment.postId;

    if (comment.parentId || !postId) return null;

    const postRef = db.collection('posts').doc(postId);
    return postRef.update({ commentCount: FieldValue.increment(1) });
  });

export const onCommentDeleted = functions.firestore
  .document('comments/{commentId}')
  .onDelete(async (snapshot) => {
    const comment = snapshot.data();
    const postId = comment.postId;

    if (comment.parentId || !postId) return null;

    const postRef = db.collection('posts').doc(postId);
    return postRef.update({ commentCount: FieldValue.increment(-1) });
  });
