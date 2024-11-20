import type { NextPage } from "next";
import { observer } from 'mobx-react-lite';
import styles from './index.module.scss';
import { navs } from "./config";
import Link from "next/link";
import { Button, Dropdown, Avatar, Menu, message } from 'antd';
import type { MenuProps } from 'antd';
import { LoginOutlined, HomeOutlined } from '@ant-design/icons';
import { useRouter } from "next/router";
import { useState } from "react";
import Login from 'components/login';
import { useStore } from 'store/index';
import request from 'service/fetch';

const Navbar: NextPage = ({ children }) => {
  const [isShowLogin, setIsShowLogin] = useState(false);
  const { pathname, push } = useRouter();
  const store = useStore();
  const { userId, avatar } = store.user.userInfo;
  const handleLogin = () => {
    setIsShowLogin(true);
  };
  const handleClose = () => {
    setIsShowLogin(false);
  };
  const handleGotoEditorPage = () => {
    if(userId) {
      push('/editor/new');
    }else {
      message.warning('请先登录');
    }
  };
  
  const handleGotoPersonalPage = () => {
    push(`/user/${userId}`);
  };

  const handleLogout = () => {
    request.post('/api/user/logout').then((res: any) => {
      if(res?.code === 0){
        store.user.setUserInfo({});
      }
    })
  }

  const onClick: MenuProps['onClick'] = ({ key }) => {
    console.log('key:', key);
    if(key === 'personalPage') {
      handleGotoPersonalPage();
    }else if(key === 'logout') {
      handleLogout();
    }
  }

  const items: MenuProps['items'] = [
    {
      label: '个人主页',
      key: 'personalPage',
      icon: <HomeOutlined />
    },
    {
      label: '退出系统',
      key: 'logout',
      icon: <LoginOutlined />
    }
  ]
  return (
    <div className={styles.navbar}>
      <section className={styles.logoArea}>blog-c</section>
      <section className={styles.linkArea}>
        {navs?.map((nav) => {
          return (
            <Link key={nav?.label} href={nav?.value}>
              <a className={pathname === nav?.value ? styles.active : ''}>
                {nav?.label}
              </a>
            </Link>
          )
        })}
      </section>
      <section className={styles.operationArea}>
        <Button onClick={handleGotoEditorPage}>写文章</Button>

        {
          userId ? (
            <>
              <Dropdown menu={{ items, onClick }} placement="bottomLeft">
                <Avatar src={avatar} size={32} />
              </Dropdown>
            </>
          ) : <Button type="primary" onClick={handleLogin}>登录</Button>
        }
      </section>
      <Login isShow={isShowLogin} onClose={handleClose} />
    </div>
  )
};

export default observer(Navbar);