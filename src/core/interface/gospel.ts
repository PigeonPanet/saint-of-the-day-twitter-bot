export interface IGospelContempla {
  gospel_text: string;
  gospel_title: string;
  url: string;
  comments: CommentContempla[];
}

interface CommentContempla {
  comment_text: string;
  verse: string;
  social_text: string;
}
