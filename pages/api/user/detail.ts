import { NextApiRequest, NextApiResponse } from 'next';
import { withIronSessionApiRoute } from 'iron-session/next';
import { ironOptions } from 'config/index';
import { prepareConnection } from 'db';
import { User } from 'db/entity/index';
import { ISession } from '..';
import { EXCEPTION_USER } from '../config/codes';

export default withIronSessionApiRoute(detail, ironOptions);

async function detail(req:NextApiRequest, res:NextApiResponse) {
  const session: ISession = req.session;

  const { userId } = session;
  const db = await prepareConnection();
  const userRepo = db.getRepository(User);

  const user = await userRepo.findOne({
    where: {
      id: Number(userId)
    }
  })

  if(user) {
    res?.status(200).json({
      code: 0,
      msg: '',
      data: {
        userInfo: user
      }
    })
  }else {
    res?.status(200).json({
      ...EXCEPTION_USER.NOT_FOUND
    })
  }
}