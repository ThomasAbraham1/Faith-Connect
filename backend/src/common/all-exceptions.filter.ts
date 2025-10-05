// src/common/filters/all-exceptions.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { MongoError, MongoServerError } from 'mongodb';
import mongoose from 'mongoose';

interface Error extends MongoServerError {
  keyValue: Record<string, string>
}


@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Something went wrong';
    let errorCode = 'INTERNAL_ERROR';
    let redirectPage = ''
    console.log(exception)
    if (exception instanceof HttpException) {
      console.log("HELLOASDAS")
      status = exception.getStatus();
      const res = exception.getResponse();
      message = (res as any).message;
    }
    if(exception instanceof NotFoundException || exception instanceof UnauthorizedException){
      console.log("Inside Not found exception filter")
      message = (exception.getResponse() as any).message || 'An error occured ( Not Found Exception )';
      console.log(exception)
    }
    // Detect database duplicate entry error
    else if (exception instanceof MongoServerError) {
      if (exception.code == 11000) {
        const field = Object.keys(exception.keyValue)[0];
        const value = exception.keyValue[field];
        console.log("hello")
        errorCode = exception.custom?.code || 11000
        message = exception.custom?.message || `The value '${value}' already exists in the system` 
        redirectPage = exception.custom?.redirectPage
      }
    }
    console.log("It's happeneing in all exceptions filter")
    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      redirectPage,
      errorCode,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
