import { NextApiRequest, NextApiResponse } from 'next';
import { withIronSessionApiRoute } from 'iron-session/next';
import { Cookie } from 'next-cookie';
import { ironOptions } from 'config/index';
import { prepareConnection } from 'db';
import { User, UserAuth } from 'db/entity/index';
import { setCookie } from 'utils';
import { ISession } from '..';

export default withIronSessionApiRoute(login, ironOptions);

async function login(req:NextApiRequest, res:NextApiResponse) {
  const session: ISession = req.session;
  const cookies = Cookie.fromApiRoute(req, res);

  const {phone='', verify='', identity_type = 'phone'} = req.body;
  const db = await prepareConnection();
  const userRepo = db.getRepository(User);
  const userAuthRepo = db.getRepository(UserAuth);

  if(String(session.verifyCode) === String(verify)) {
    // 验证码正确，在user_auths 表中查找是否有记录
    const userAuth = await userAuthRepo.findOne(
      {
        identity_type,
        identifier: phone
      },
      {
        relations: ['user'],
      }
    )
    if(userAuth) {
      // 已存在的用户
      const user = userAuth.user;
      const { id, nick_name, avatar } = user;
      session.userId = id;
      session.nickname = nick_name;
      session.avatar = avatar;
      userAuth.credential = String(session.verifyCode);

      await session.save();

      setCookie(cookies, { id, nickname: nick_name, avatar });

      res?.status(200).json({code: 0, msg: '登录成功', data: {
        userId: id,
        nickname: nick_name,
        avatar,
      }});

    }else {
      // 新用户，自动注册
      const user = new User();
      user.nick_name = `用户_${Math.floor(Math.random() * 10000)}`;
      user.avatar = '/images/avatar.jpg';
      user.job = '暂无';
      user.introduce = '暂无';

      const userAuth = new UserAuth();
      userAuth.identifier = phone;
      userAuth.identity_type = identity_type;
      userAuth.credential = String(session.verifyCode);
      userAuth.user = user;

      const resUserAuth = await userAuthRepo.save(userAuth);
      const {
        user: {id, nick_name, avatar},
      } = resUserAuth;
      session.userId = id;
      session.nickname = nick_name;
      session.avatar = avatar;

      await session.save();

      setCookie(cookies, { id, nickname: nick_name, avatar });

      res?.status(200).json({code: 0, msg: '登录成功', data: {
        userId: id,
        nickname: nick_name,
        avatar,
      }});
    }
  }else {
    res?.status(200).json({code: -1, msg: '验证码错误'});
  }
}