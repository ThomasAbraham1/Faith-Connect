import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import session from 'express-session';
import { NestExpressApplication } from "@nestjs/platform-express"
import passport from 'passport';
import cookieParser from 'cookie-parser';
const MongoDBStore = require('connect-mongodb-session')(session);
import { AllExceptionsFilter } from './common/all-exceptions.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.set('trust proxy', 1);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  const isProduction = process.env.NODE_ENV == 'production';
  app.enableCors({
    origin: ['https://www.faithconnect.store', 'https://faithconnect-474707.el.r.appspot.com', 'http://localhost:5173', 'http://13.201.3.191', 'http://app.harpazotech.com', 'https://app.harpazotech.com'],
    credentials: true,
  });
  console.log(isProduction)
  // Global Filter
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Cookie Parser init
  app.use(cookieParser());
  const secret = process.env.SESSION_SECRET;
  const mongoUri = process.env.MONGO_DB_URI;

  if (!secret) {
    throw new Error('SESSION_SECRET environment variable is not set');
  }
  if (!mongoUri) {
    throw new Error('MONGO_DB_URI environment variable is not set');
  }

  // Session Store initialization
  const store = new MongoDBStore({
    uri: mongoUri,
    collection: 'sessions',
    expires: 1000 * 60 * 60 * 24 * 30, // 30 days
  });

  store.on('error', (error) => {
    console.error('Session store error:', error);
  });

  // Session initialization

  app.use(
    session({
      secret: secret,
      resave: false,
      saveUninitialized: false,
      proxy: true, // Enable trust for proxy headers (required for reverse proxy setup)
      store: store, // Tell express-session to use our MongoDB store
      cookie: {
        maxAge: 60 * 60 * 1000 * 24 * 365,
        secure: false, // Set to false since we are on http for now
        httpOnly: true,
        sameSite: 'lax',
      },
    }),
  );
  // app.set('trust proxy', 1); // Moved to top
  // console.log(process.env.JWT_SECRET) 
  app.use(passport.initialize());
  app.use(passport.session());
  const port = process.env.PORT || 3000; // App Engine requires 8080
  console.log(port)
  app.listen(port);
}
bootstrap();
