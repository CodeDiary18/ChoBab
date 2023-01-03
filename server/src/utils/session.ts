import * as session from 'express-session';
import * as fileStoreCreateFunction from 'session-file-store';
import { ONE_HOUR_MILLISECOND } from '@constants/time';

const FileStore = fileStoreCreateFunction(session);

export const sessionMiddleware = (cookieSecret: string) => {
  return session({
    resave: false,
    saveUninitialized: true,
    secret: cookieSecret,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: ONE_HOUR_MILLISECOND, // 세션쿠키 유효시간 설정 (1시간)
    },
    store: new FileStore(),
  });
};
