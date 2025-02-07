import { NextApiRequest, NextApiResponse } from 'next';
import { withIronSessionApiRoute } from 'iron-session/next';
import { ironOptions } from 'config/index';
import { prepareConnection } from 'db';
import { Tag } from 'db/entity/index';
import { ISession } from '..';

export default withIronSessionApiRoute(get, ironOptions);

async function get(req:NextApiRequest, res:NextApiResponse) {
  const session: ISession = req.session;
  const { userId = 0 } = session;
  const { title = '', content = '' } = req.body; 
  const db = await prepareConnection();
  const tagRepo = db.getRepository(Tag);

  const followTags = await tagRepo.find({
    relations: ['users'],
    where: (qb: any) => {
      qb.where('user_id = :id', {
        id: Number(userId)
      })
    }
  });

  const allTags = await tagRepo.find({
    relations: ['users']
  })

  res?.status(200)?.json({
    code: 0,
    msg: '',
    data: {
      followTags,
      allTags
    }
  })
}