import { useState } from 'react';
import { prepareConnection } from 'db/index';
import { Article, Comment } from 'db/entity';
import { IArticle } from 'pages/api';
import styles from './index.module.scss';
import { Avatar, Button, Divider, Input, message } from 'antd';
import { useStore } from 'store';
import Link from 'next/link';
import Markdown from 'markdown-to-jsx';
import { format } from 'date-fns';
import request from 'service/fetch';


interface IProps {
  article: IArticle
}

export async function getServerSideProps({ params }: any) {
  const articleId = params?.id;
  const db = await prepareConnection();
  const articleRepo = db.getRepository(Article);
  const article = await articleRepo.findOne({
    where: {
      id: articleId
    },
    relations: ['user', 'comments', 'comments.user'],
  });

  console.log('newnewnewarticle:111', article);
  
  if(article) {
    article.views =  article.views + 1;
    await articleRepo.save(article);
  }

  return {
    props: {
      article: JSON.parse(JSON.stringify(article))
    }
  }
}

const ArticleDetail = (props: IProps) => {
  const { article } = props;
  const { user: {nick_name, avatar, id} } = article;
  const [inputVal, setInputVal] = useState('');
  const [comments, setComments] = useState(article?.comments as any|| [] );
  const store = useStore();
  const loginUserInfo = store?.user?.userInfo;

  const handleComment = () => {
    request.post('/api/comment/publish', {
      articleId: article?.id,
      content: inputVal,
    }).then((res: any) => {
      if(res?.code === 0) {
        message.success('评论发表成功');
        const newComments = [{
          id: Math.random(),
          create_time: new Date(),
          update_time: new Date(),
          content: inputVal,
          user: {
            avatar: loginUserInfo?.avatar,
            nick_name: loginUserInfo?.nickname,
          }
        }].concat([...comments]);
        setComments(newComments);
        setInputVal('');
      }else {
        message.error('评论发表失败');
      }
    })
  };

  return (
    <div>
      <div className='content-layout'>
        <h2 className={styles.title}>{article?.title}</h2>
        <div className={styles.user}>
          <Avatar src={avatar} size={50} />
          <div className={styles.info}>
            <div className={styles.name}>{nick_name}</div>
            <div className={styles.date}>
              <div>{format(new Date(article?.update_time), 'yyyy-MM-dd hh:mm:ss')}</div>
              <div>阅读 {article?.views}</div>
              {Number(loginUserInfo?.userId) === Number(id) && (
                <Link href={`/editor/${article?.id}`}>编辑</Link>
              )}
            </div>
          </div>
        </div>
        <Markdown className={styles.markdown}>{article?.content}</Markdown>
      </div>

      <div className={styles.divider}></div>

      <div className='content-layout'>
        <div className={styles.comment}>
          <h3>评论</h3>
          {loginUserInfo?.userId && (
            <div className={styles.enter}>
              <Avatar src={avatar} size={40} />
              <div className={styles.content}>
                <Input.TextArea 
                  placeholder='请输入评论' 
                  rows={4} 
                  value={inputVal} 
                  onChange={(event) => {setInputVal(event?.target?.value)}}
                />
                <Button type="primary" onClick={handleComment}>发表评论</Button>
              </div>
            </div>
          )}
          <Divider />
          <div className={styles.display}>
            {comments?.map((comment: any) => (
              <div className={styles.wrapper} key={comment.id}>
                <Avatar src={comment?.user?.avatar} size={40} />
                <div className={styles.info}>
                  <div className={styles.name}>
                    <div>{comment?.user.nick_name}</div>
                    <div className={styles.date}>
                      {format(new Date(comment?.update_time), 'yyyy-MM-dd hh:mm:ss')}
                    </div>
                  </div>
                  <div className={styles.content}>{comment?.content}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ArticleDetail;