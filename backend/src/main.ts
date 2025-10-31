import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as session from 'express-session';
import { NestExpressApplication } from "@nestjs/platform-express"
import * as passport from 'passport';
import * as cookieParser from 'cookie-parser';
import { AllExceptionsFilter } from './common/all-exceptions.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  const isProduction = process.env.NODE_ENV == 'production';
  app.enableCors({
    origin: ['https://www.faithconnect.store', 'https://faithconnect-474707.el.r.appspot.com', 'http://localhost:5173'],
    credentials: true,
  });
  console.log(isProduction)
  // Global Filter
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Cookie Parser init
  app.use(cookieParser());
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error('SESSION_SECRET environment variable is not set');
  }


  // Sesssion intitialization
  app.use(
    session({
      secret: secret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 60 * 60 * 1000 * 24 * 365,
        secure: isProduction ? true : false,
        httpOnly: true,
        sameSite: isProduction ? 'none' : 'lax',
      },
    }),
  );
  app.set('trust proxy', 1);
  app.use(passport.initialize());
  app.use(passport.session());
  const port = process.env.PORT || 3000; // App Engine requires 8080
  console.log(port)
  app.listen(port);
}
bootstrap();
