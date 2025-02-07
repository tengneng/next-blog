import Link from 'next/link';
import { EyeOutlined } from '@ant-design/icons';
import { formatDistanceToNow } from 'date-fns';
import { markdownToTxt } from 'markdown-to-txt';
import { IArticle } from 'pages/api/index';
import styles from './index.module.scss';

interface IProps {
  article: IArticle
}

const ListItem = (props: IProps) => {
  const { article } = props;
  const { user } = article;
  console.log('1111111:', article);
  return (
    <Link href={`/article/${article.id}`}>
      <div className={styles.container}>
        <div className={styles.article}>
          <div className={styles.userInfo}>
            <span className={styles.name}>{user.nick_name}</span>
            <span className={styles.date}>{formatDistanceToNow(new Date(article.update_time))}</span>
          </div>
          <h4 className={styles.title}>{article.title}</h4>
          <p className={styles.content}>{markdownToTxt(article.content)}</p>
          <div className={styles.statistics}>
            <EyeOutlined />
            <span>{article.views}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default ListItem;