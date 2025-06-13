import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserSession } from 'types/auth';
import * as elliptic from 'elliptic';
import { JwtService } from '@nestjs/jwt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

const EC = elliptic.ec;
const ec = new EC('secp256k1');

@Injectable()
export class AuthService {
    // private userSessions: Map<string, UserSession> = new Map()
    constructor(@Inject(CACHE_MANAGER) private cache : Cache, private readonly prisma: PrismaService, private readonly jwt: JwtService) { }

    async validateUser(userId: string, signature: string, timestamp: string, endpoint: string, method: string) {
        const user : UserSession = await this.cache.get("user_"+userId)
        
        if (user) {
            const signatureHash = `${timestamp}:${endpoint}:${method}:${userId}`;
            const isValid = this.verifySignature(user.client_secret, signature, signatureHash);
            if (!isValid) {
                throw new UnauthorizedException('Invalid signature');
            }
            return user;
        }

        throw new UnauthorizedException('User session not found');
    }
    
    private verifySignature(public_key: string, signature: string, message: string) {
        const key = ec.keyFromPublic(public_key, 'hex');
        const isSign = key.verify(message, signature);
        return isSign;
    }

    async login(nama: string, nip: string, client_secret: string) {

        const user = await this.prisma.user.findFirst({
            where: {
                name: nama,
                nip: nip,
            },
            include: {
                result: true,
            }
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        if (user.client_secret !== client_secret) {
            await this.prisma.user.update({
                where: {
                    id: user.id,
                },
                data: {
                    client_secret: client_secret,
                }
            })
        }

        const token = this.jwt.sign({
            user_id: user.id
        })

        const userSession: UserSession = {
            id: user.id,
            name: user.name,
            client_secret: client_secret,
            result: user.result,
            role : user.role,
            ban: user.ban
        };

        this.cache.set("user_"+user.id, userSession);

        return {
            payload: {
                id: user.id,
                name: user.name,
                role: user.role,
            },
            token: token
        }
    }



}
