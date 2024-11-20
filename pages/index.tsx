import { useEffect, useState } from 'react';
import { Divider } from 'antd';
import classnames from 'classnames';
import { prepareConnection } from "db/index";
import { Article, Tag } from "db/entity";
import ListItem from "components/listItem";
import { IArticle } from './api';
import request from 'service/fetch';
import styles from './index.module.scss';



interface IProps {
  articles: IArticle[];
  tags: Tag[];
}

export async function getServerSideProps() {
  const db = await prepareConnection();
  const articles = await db.getRepository(Article).find({
    relations: ['user'],
  });
  const tags = await db.getRepository(Tag).find({
    relations: ['users'],
  })
  return {
    props: {
      articles: JSON.parse(JSON.stringify(articles)) || {},
      tags: JSON.parse(JSON.stringify(tags)) || {},
    }
  }
}

const Home = (props: IProps) => {
  const { articles, tags } = props;
  const [selectTag, setSelectTag] = useState<number>(0);
  const [showArticles, setShowArticles] = useState(articles);

  useEffect(() => {
    if(selectTag) {
      request.get(`/api/article/get?tag_id=${selectTag}`).then((res: any) => {
        if(res?.code === 0) {
          setShowArticles(res?.data);
        }
      })
    }else {
      setShowArticles(articles);
    }
  },[selectTag]);

  const handleSelectTag = (event: any) => {
    const { tagid } = event?.target?.dataset;
    if(tagid == selectTag) {
      setSelectTag(0)
    } else {
      setSelectTag(Number(tagid));
    }
  }

  return (
    <div>
      <div className={styles.tags} onClick={handleSelectTag}>
        {tags?.map(tag => (
          <div 
            key={tag?.id} 
            className={classnames(styles.tag, selectTag === tag?.id ? styles['active'] : '')}
            data-tagid={tag?.id}
          >
            {tag?.title}
          </div>
        ))}
      </div>
      <div className="content-layout">
        {showArticles.map((article) => (
          <>
            <ListItem article={article}/>
            <Divider />
          </>
        ))}
      </div>
    </div>
  )
};

export default Home;