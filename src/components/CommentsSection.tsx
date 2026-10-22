import React, { useState } from 'react';
import { MessageSquare, Send, Trash2, Heart } from 'lucide-react';
import { Comment } from '../types';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { formatTimeAgo } from '../utils/formatters';

interface CommentsSectionProps {
  comments: Comment[];
  onAddComment: (text: string) => void;
  onDeleteComment: (commentId: string) => void;
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({
  comments,
  onAddComment,
  onDeleteComment,
}) => {
  const { currentUser, isAdmin } = useAuth();
  const { lang, t } = useLanguage();
  const [commentText, setCommentText] = useState('');
  const [likedCommentIds, setLikedCommentIds] = useState<Record<string, boolean>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(commentText.trim());
    setCommentText('');
  };

  const toggleCommentLike = (id: string) => {
    setLikedCommentIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="mt-8 space-y-6">
      {/* Comments Header */}
      <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
        <MessageSquare className="w-5 h-5 text-amber-500" />
        <h3 className="text-base font-bold text-neutral-100">
          {t('feed.comments')} ({comments.length})
        </h3>
      </div>

      {/* Add Comment Input */}
      {currentUser ? (
        <form onSubmit={handleSubmit} className="flex gap-3 items-start">
          <img
            src={currentUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
            alt={currentUser.displayName}
            className="w-10 h-10 rounded-full object-cover ring-1 ring-neutral-700 shrink-0"
          />
          <div className="flex-1 space-y-2">
            <textarea
              rows={2}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={t('feed.add_comment')}
              className="w-full bg-neutral-900 border border-neutral-800 focus:border-amber-500 rounded-xl p-3 text-xs sm:text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none resize-none transition-colors"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-neutral-950 transition-all shadow"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{t('feed.post_comment')}</span>
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-400 text-center">
          Please sign in to join the conversation.
        </div>
      )}

      {/* Comment List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-xs text-neutral-500 py-6 text-center">
            {t('feed.no_comments')}
          </p>
        ) : (
          comments.map((comment) => {
            const isOwner = currentUser?.uid === comment.authorId;
            const canDelete = isOwner || isAdmin;
            const isLiked = likedCommentIds[comment.id];
            const likeCount = (comment.likesCount || 0) + (isLiked ? 1 : 0);

            return (
              <div
                key={comment.id}
                className="group flex gap-3 p-3 rounded-2xl bg-neutral-900/40 hover:bg-neutral-900/80 border border-transparent hover:border-neutral-800 transition-all"
              >
                <img
                  src={comment.authorPhotoURL || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100'}
                  alt={comment.authorName}
                  className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-neutral-700"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-neutral-200">
                        {comment.authorName}
                      </span>
                      <span className="text-[11px] text-neutral-500">
                        {formatTimeAgo(comment.createdAt, lang)}
                      </span>
                    </div>

                    {canDelete && (
                      <button
                        onClick={() => onDeleteComment(comment.id)}
                        className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-rose-400 p-1 rounded transition-opacity"
                        title={t('admin.delete')}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-neutral-300 mt-1 leading-relaxed break-words">
                    {comment.text}
                  </p>

                  <div className="flex items-center gap-3 mt-2 text-[11px] text-neutral-500">
                    <button
                      onClick={() => toggleCommentLike(comment.id)}
                      className={`flex items-center gap-1 transition-colors ${
                        isLiked ? 'text-rose-400 font-bold' : 'hover:text-neutral-300'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
                      <span>{likeCount > 0 ? likeCount : ''}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
