import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as session from 'express-session';
import * as passport from 'passport';
import * as cookieParser from 'cookie-parser';
import { AllExceptionsFilter } from './common/all-exceptions.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const isProduction = process.env.NODE_ENV == 'production';
  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        'https://effervescent-beignet-60b0fd.netlify.app',
        'http://localhost:5173',
        'https://faith-connect.onrender.com',
      'https://faithconnect-474707.el.r.appspot.com'
      ];
      console.log('Request Origin:', origin); // Log the origin
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
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
        sameSite: isProduction ? 'none' : 'lax',
      },
    }),
  );

  // console.log(process.env.JWT_SECRET)
  app.use(passport.initialize());
  app.use(passport.session());
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const host = '0.0.0.0'; // Required for Cloud Run
  await app.listen(port, host);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  // await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
