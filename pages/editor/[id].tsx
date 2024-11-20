import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import dynamic from 'next/dynamic';
import { ChangeEvent, useEffect, useState } from 'react';
import styles from './index.module.scss';
import request from 'service/fetch';
import { useStore } from 'store';
import { Button, Input, Select, message } from 'antd';
import { useRouter } from 'next/router';
import { prepareConnection } from 'db';
import { IArticle } from 'pages/api';
import { Article, Tag } from 'db/entity';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), {ssr: false});

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
    relations: ['user', 'tags'],
  });

  return {
    props: {
      article: JSON.parse(JSON.stringify(article))
    }
  }
}

const ModifyEditor = (props: IProps) => {
  const store = useStore();
  const { push, query } = useRouter();
  const { userId } = store.user.userInfo;
  const { article } = props;
  const [title, setTitle] = useState(article?.title || '');
  const [content, setContent] = useState(article?.content || '');
  const [allTags, setAllTags] = useState([] as Tag[]);
  const [selectTags, setSelectTags] = useState(article?.tags || []);
  console.log('mmmmmmmmmmmmmmmmmmmmmmmarticle:', article);

  useEffect(() => {
    request.get('/api/tag/get').then((res: any) => {
      if(res?.code === 0){
        setAllTags(res?.data?.allTags);
      }
    })
  }, [])

  const handleTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTitle(event?.target?.value);
  }

  const handleContentChange = (content: any) => {
    setContent(content);
  }

  const handlePublish = () => {
    if(!title) {
      message.warning('请输入文章标题');
      return;
    } else {
      request.post('/api/article/update', {
        id: article?.id,
        title,
        content,
        selectTagIds: selectTags?.map((tag) => tag.id)
      }).then((res: any) => {
        if(res.code === 0) {
          message.success('更新成功');
          article?.id ? push(`/article/${article?.id}`) : push('/');
        }else {
          message.error(res?.msg || '发布失败');
        }
      })
    }
  }
  
  const handleSelectTag = (values: string[]) => {
    const newSelectTags = allTags?.filter((tag) => values.includes(tag.title));
    setSelectTags(newSelectTags);
  }

  

  return (
    <div className={styles.container}>
      <div className={styles.operation}>
        <Input className={styles.title} placeholder='请输入文章标题' value={title} onChange={handleTitleChange}/>
        <Select 
          defaultValue={selectTags.map((tag) => tag.title) as []}
          className={styles.tag} 
          mode="multiple" 
          allowClear 
          placeholder="请选择标签" 
          onChange={handleSelectTag}
        >
          {allTags?.map((tag: Tag) => (
            <Select.Option key={tag?.id} value={tag?.title}>
              {tag?.title}
            </Select.Option>
          ))}
        </Select>
        <Button className={styles.button} type="primary" onClick={handlePublish}>发布</Button>
      </div>
      <MDEditor value={content} height={1080} onChange={handleContentChange}/>
    </div>
  )
}

(ModifyEditor as any).layout = null;

export default ModifyEditor;