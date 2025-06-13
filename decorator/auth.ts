import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/auth.guard';

export function UseAuth() {
  return applyDecorators(
    ApiHeader({ name: 'x-signature', required: true, description: 'Request signature' }),
    ApiHeader({ name: 'x-timestamp', required: true, description: 'Request timestamp' }),
    ApiHeader({ name: 'x-method', required: true, description: 'HTTP method' }),
    ApiHeader({ name: 'x-endpoint', required: true, description: 'Request endpoint' }),
    UseGuards(JwtAuthGuard),
    ApiBearerAuth()
  );
}