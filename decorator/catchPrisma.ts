import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message : any = 'Internal server error';

    // Special handling for Prisma errors
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      status = HttpStatus.BAD_REQUEST;
      message = exception.message;

      if (exception.code === 'P2002') {
        message = 'Unique constraint failed';
        status = HttpStatus.CONFLICT;
      }
      
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.getResponse();
    } else if (exception?.message) {
      message = exception.message;
    }

    response.status(status).json({
      statusCode: status,
      message,
      error: exception.name || 'Error',
    });
  }
}