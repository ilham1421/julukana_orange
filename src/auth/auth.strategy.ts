import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthPayload, RequestSignatureSchema } from 'types/auth';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly authService: AuthService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.SECRET_KEY, // Use env variable in production,
            passReqToCallback : true
        });
    }

    async validate(request : Request, payload: AuthPayload) {


        const parseRequest = RequestSignatureSchema.safeParse({
            signature: request.headers?.['x-signature'],
            timestamp: request.headers?.['x-timestamp'],
            endpoint: request.headers?.['x-endpoint'],
            method: request.headers?.['x-method'],
        })

        if (!parseRequest.success) {
            throw new Error('Invalid request signature');
        }

        const { signature, timestamp, endpoint, method } = parseRequest.data;


        const user = await this.authService.validateUser(
            payload.user_id,
            signature,
            timestamp,
            endpoint,
            method
        )

    

        return user
    }
}