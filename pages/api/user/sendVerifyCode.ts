import { NextApiRequest, NextApiResponse } from 'next';
import { withIronSessionApiRoute } from 'iron-session/next';
import { format } from 'date-fns';
import md5 from 'md5';
import { encode } from 'js-base64';
import request from 'service/fetch';
import { ironOptions } from 'config/index';
import { ISession } from 'pages/api/index';

export default withIronSessionApiRoute(sendVerifyCode, ironOptions);

async function sendVerifyCode(req:NextApiRequest, res:NextApiResponse) {
  const session: ISession = req.session;
  const { to='', templateId='1' } = req.body;
  const AppId = '2c94811c9035ff9f01916068df5b41e1';
  const AccountId = '2c94811c9035ff9f01916068dddf41da';
  const AuthToken = '50a98657a95e4df5a6b82a9a2786c617';
  const NowDate = format(new Date(), 'yyyyMMddHHmmss');
  const SigParameter = md5(`${AccountId}${AuthToken}${NowDate}`);
  const Authorization = encode(`${AccountId}:${NowDate}`);
  const verifyCode = Math.floor(Math.random()*(8999)) + 1000;
  const expireMinute = '5';
  const url = `https://app.cloopen.com:8883/2013-12-26/Accounts/${AccountId}/SMS/TemplateSMS?sig=${SigParameter}`;
  
  const response = await request.post(url, {
    to,
    templateId,
    appId: AppId,
    datas: [verifyCode, expireMinute],
  }, {
    headers: {
      Authorization
    }
  })

  console.log(response);
  const { statusCode, statusMsg, TemplateSMS } = response as any;

  if(statusCode === '000000') {
    session.verifyCode = verifyCode;
    await session.save();
    res.status(200).json({
      code: 0,
      msg: statusMsg,
      data: {TemplateSMS}
    })
  } else {
    res.status(200).json({
      code: statusCode,
      msg: statusMsg
    })
  }
}