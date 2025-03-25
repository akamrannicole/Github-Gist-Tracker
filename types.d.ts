import mongoose from 'mongoose';
import { JwtPayload } from 'jsonwebtoken';

declare global {
  var mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  } | undefined;
}

declare module 'jsonwebtoken' {
  export interface JwtPayload {
    id?: string;
  }
}