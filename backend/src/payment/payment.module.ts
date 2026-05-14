import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { ChurchPaymentConfig, ChurchPaymentConfigSchema } from '../schemas/ChurchPaymentConfig.schema';
import { EncryptionService } from '../common/encryption.service';
import { Registration, RegistrationSchema } from '../schemas/Registration.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ChurchPaymentConfig.name, schema: ChurchPaymentConfigSchema },
      { name: Registration.name, schema: RegistrationSchema },
    ]),
  ],
  controllers: [PaymentController],
  providers: [PaymentService, EncryptionService],
  exports: [PaymentService, EncryptionService],
})
export class PaymentModule {}
