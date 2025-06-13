import { z } from 'zod';
import { Result, Role } from "@prisma/client";

export type AuthPayload = {
    id: string;
}

export type UserSession = {
    id: string;
    name: string;
    client_secret: string;
    result: Result;
    role : Role;
    ban : boolean;
};

export const RequestSignatureSchema = z.object({
    signature: z.string().min(1, 'Signature is required'),
    timestamp: z.number().int().positive('Timestamp must be a positive integer'),
    endpoint: z.string().min(1, 'Endpoint is required'),
    method: z.string().min(1, 'Method is required'),
});
