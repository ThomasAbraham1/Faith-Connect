// database.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Otp, otpSchema } from 'src/schemas/Otp.schema';
import { Twofa, TwofaSchema } from 'src/schemas/Twofa.schema';
import { User, userSchema } from 'src/schemas/User.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: userSchema },
      { name: Otp.name, schema: otpSchema },
      {name: Twofa.name, schema:TwofaSchema}
    ]),
  ],
  exports: [MongooseModule], // This module now exports all configured models
})
export class DatabaseModule {}
