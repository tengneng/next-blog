import { Comment } from "db/entity";
import { Tag } from 'db/entity';
import { IronSession } from "iron-session";
import { IUserInfo } from "store/userStore";

export type IArticle = {
  id: number,
  title: string,
  content: string,
  views: number,
  create_time: Date,
  update_time: Date,
  user: {
    nick_name: string,
    avatar: string,
    id: number,
  },
  comments: Comment[],
  tags: Tag[]
};

export type ISession = IronSession & {
  verifyCode?: number;
  userId?: number;
  nickname?: string;
  avatar?: string;
};