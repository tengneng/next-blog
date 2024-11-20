import { UserAuth, User } from 'db/entity/index';
import { NextApiRequest, NextApiResponse } from 'next';
import { withIronSessionApiRoute } from 'iron-session/next';
import { Cookie } from 'next-cookie';
import { ironOptions } from 'config/index';
import { setCookie } from 'utils';
import { ISession } from '..';
import request from 'service/fetch';
import { prepareConnection } from 'db';

export default withIronSessionApiRoute(redirect, ironOptions);

async function redirect(req:NextApiRequest, res:NextApiResponse) {
  const session: ISession = req.session;
  // http://localhost:3000/api/oauth/redirect?code=xxx
  const { code } = req.query;
  console.log('code:', code);
  const githubClientID = 'Ov23litM2FtWGgd5cj7O';
  const githubClientSecret = 'a0e4999357deea9614e46fd1abcbf8846f652287';
  const url = `https://github.com/login/oauth/access_token?client_id=${githubClientID}&client_secret=${githubClientSecret}&code=${code}`;

  const result = await request.post(url, {}, {
    headers: {
      accept: 'application/json',
    }
  });
  const { access_token } = result as any;
  console.log('access_token:++++++++++++++++++', result);

  const githubUserInfo = await request.get('https://api.github.com/user',{
    headers: {
      accept: 'application/json',
      Authorization: `token ${access_token}`
    }
  })
  console.log('githubUserInfo++++++++++++++++++:', githubUserInfo);

  const cookies = Cookie.fromApiRoute(req, res);
  const db = await prepareConnection();
  const userAuth = await db.getRepository(UserAuth).findOne({
    identity_type: 'github',
    identifier: githubClientID,
  }, {
      relations: ['user'],
  })
  console.log('userAuth:----------', userAuth);

  if(userAuth) {
    // 之前登录过的用户，直接从 user 里面获取用户信息，并且更新 credential
    const user = userAuth.user;
    const { id, nick_name, avatar } = user;

    userAuth.credential = access_token;

    session.userId = id;
    session.nickname = nick_name;
    session.avatar = avatar;

    await session.save();

    setCookie(cookies, { id, nickname: nick_name, avatar });

    res.writeHead(302, {
      Location: '/'
    });
  }else {
    // 创建一个新用户，包括user 和 user_auth
    const { login = '', avatar_url = '' } = githubUserInfo as any;
    const user = new User();
    user.nick_name = login;
    user.avatar = avatar_url;

    const userAuth = new UserAuth();
    userAuth.identity_type = 'github';
    userAuth.identifier = githubClientID;
    userAuth.credential = access_token;
    userAuth.user = user;

    const userAuthRepo = db.getRepository(UserAuth);
    const resUserAuth = await userAuthRepo.save(userAuth);

    const { id, nick_name, avatar } = resUserAuth?.user;

    session.userId = id;
    session.nickname = nick_name;
    session.avatar = avatar;

    await session.save();

    setCookie(cookies, { id, nickname: nick_name, avatar });

    res.writeHead(302, {
      Location: '/'
    });
  }
}