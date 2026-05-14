import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';
import { ChurchPaymentConfig, ChurchPaymentConfigDocument } from '../schemas/ChurchPaymentConfig.schema';
import { EncryptionService } from '../common/encryption.service';
import { Registration, RegistrationDocument } from '../schemas/Registration.schema';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(ChurchPaymentConfig.name) private configModel: Model<ChurchPaymentConfigDocument>,
    @InjectModel(Registration.name) private registrationModel: Model<RegistrationDocument>,
    private encryptionService: EncryptionService,
  ) {}

  async saveConfig(churchId: string, keyId: string, keySecret: string) {
    // 1. Verify credentials by making a lightweight test call to Razorpay
    try {
      const razorpayInstance = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });
      // If keys are invalid, this will throw an error
      await razorpayInstance.orders.all({ count: 1 });
    } catch (error: any) {
      const errorMessage = error.error?.description || error.message || 'Invalid Razorpay credentials.';
      throw new BadRequestException(`Razorpay Error: ${errorMessage}`);
    }

    // 2. If valid, encrypt and save
    const encryptedSecret = this.encryptionService.encrypt(keySecret);
    return this.configModel.findOneAndUpdate(
      { churchId: new Types.ObjectId(churchId) },
      {
        churchId: new Types.ObjectId(churchId),
        provider: 'RAZORPAY',
        razorpayKeyId: keyId,
        razorpayKeySecret: encryptedSecret,
        isActive: true,
      },
      { upsert: true, new: true },
    );
  }

  async getConfig(churchId: string) {
    const config = await this.configModel.findOne({ churchId: new Types.ObjectId(churchId) });
    if (!config) return { isConfigured: false };

    return {
      isConfigured: config.isActive,
      razorpayKeyId: config.razorpayKeyId,
      // Masking the key ID for safety (e.g., rzp_test_********1234)
      maskedKeyId: `${config.razorpayKeyId.substring(0, 9)}********${config.razorpayKeyId.slice(-4)}`,
    };
  }

  async disconnectConfig(churchId: string) {
    return this.configModel.deleteOne({ churchId: new Types.ObjectId(churchId) });
  }

  async createOrder(churchId: string, amount: number, registrationId: string) {
    const config = await this.configModel.findOne({ churchId: new Types.ObjectId(churchId) });
    if (!config || !config.isActive) {
      throw new BadRequestException('Payment gateway not configured for this church');
    }

    const decryptedSecret = this.encryptionService.decrypt(config.razorpayKeySecret);

    const razorpay = new Razorpay({
      key_id: config.razorpayKeyId,
      key_secret: decryptedSecret,
    });

    const options = {
      amount: Math.round(amount * 100), // Amount in paise
      currency: 'INR',
      receipt: registrationId,
    };

    try {
      const order = await razorpay.orders.create(options);
      return { order, razorpayKeyId: config.razorpayKeyId };
    } catch (error) {
      console.error('Razorpay order creation failed:', error);
      throw new BadRequestException('Failed to create payment order');
    }
  }

  async verifyPayment(registrationId: string, razorpayPaymentId: string, razorpaySignature: string) {
    const registration = await this.registrationModel.findById(registrationId);
    if (!registration) throw new NotFoundException('Registration not found');

    const config = await this.configModel.findOne({ churchId: registration.churchId });
    if (!config) throw new BadRequestException('Payment configuration missing');

    const decryptedSecret = this.encryptionService.decrypt(config.razorpayKeySecret);

    // Verify signature: HMAC SHA256 (orderId + "|" + paymentId, secret)
    const text = registration.razorpayOrderId + '|' + razorpayPaymentId;
    const generatedSignature = crypto
      .createHmac('sha256', decryptedSecret)
      .update(text)
      .digest('hex');

    if (generatedSignature === razorpaySignature) {
      registration.paymentStatus = 'PAID';
      registration.razorpayPaymentId = razorpayPaymentId;
      await registration.save();
      return { success: true };
    } else {
      registration.paymentStatus = 'FAILED';
      await registration.save();
      throw new BadRequestException('Payment verification failed');
    }
  }
}
