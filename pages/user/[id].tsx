import { prepareConnection } from "db";
import { Article, User } from "db/entity/index";
import styles from './index.module.scss';
import { Avatar, Button, Divider } from "antd";
import { CodeOutlined, FireOutlined, FundViewOutlined } from "@ant-design/icons";
import Link from "next/link";
import ListItem from "components/listItem";


export async function getServerSideProps({ params }: any) {
  const userId = params?.id;
  const db = await prepareConnection();
  const user = await db.getRepository(User).findOne({
    where: {
      id: Number(userId)
    }
  })
  const articles = await db.getRepository(Article).find({
    where: {
      user: { id: Number(userId) }
    },
    relations: ['user', 'tags'],
  })

  return {
    props: {
      userInfo: JSON.parse(JSON.stringify(user)),
      articles: JSON.parse(JSON.stringify(articles))
    }
  }
}

const UserDetail = (props: any) => {
  const { userInfo = {}, articles = [] } = props;
  const viewsCount = articles.reduce((prev: number, next: Article) => prev + next.views, 0)


  return (
    <div className={styles.userDetail}>
      <div className={styles.left}>
        <div className={styles.userInfo}>
          <Avatar className={styles.avatar} src={userInfo?.avatar} size={90} />
          <div>
            <div className={styles.nickname}>{userInfo?.nick_name}</div>
            <div className={styles.desc}>
              <CodeOutlined /> {userInfo?.job}
            </div>
            <div className={styles.desc}>
              <FireOutlined /> {userInfo?.introduce}
            </div>
          </div>
          <Link href="/user/profile">
            <Button>编辑个人资料</Button>
          </Link>
        </div>
        <Divider />
        <div className={styles.article}>
          {articles?.map((article: any) => (
            <div key={article?.id}>
              <ListItem article={article} />
              <Divider />
            </div>
          ))}
        </div>
      </div>
      <div className={styles.right}>
        <div className={styles.achievement}>
          <div className={styles.header}>个人成就</div>
          <div className={styles.number}>
            <div className={styles.wrapper}>
              <FundViewOutlined />
              <span>共创作 {articles?.length} 篇文章</span>
            </div>
            <div className={styles.wrapper}>
              <FundViewOutlined />
              <span>文章被阅读 {viewsCount} 次</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserDetail;