import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        console.error('=== SERVER ERROR START ===');
        console.error(exception);
        if (exception instanceof Error) {
            console.error(exception.stack);
        }
        console.error('=== SERVER ERROR END ===');

        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();

        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        const exceptionResponse =
            exception instanceof HttpException ? exception.getResponse() : null;

        let message: any = 'Internal server error';

        if (typeof exceptionResponse === 'string') {
            message = exceptionResponse;
        } else if (
            exceptionResponse &&
            typeof exceptionResponse === 'object' &&
            'message' in exceptionResponse
        ) {
            message = (exceptionResponse as any).message;
        }

        response.status(status).json({
            statusCode: status,
            message,
            path: request.url,
            timestamp: new Date().toISOString(),
        });
    }
}