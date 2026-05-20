import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common"
@Injectable()
export class AuthenticatedGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest()
    
    // 1. Check if passport authenticated them
    const isLoggedIn = request.isAuthenticated()
    if (!isLoggedIn) return false
    
    // 2. Allow access to OTP verification routes
    const path = request.route.path;
    if (path === '/auth/otpRequest' || path === '/auth/verifyOtp') {
      return true;
    }
    
    // 3. Block all other routes if 2FA is not verified yet
    if (request.session.is2faVerified !== true) {
      return false;
    }
    
    return true;
  }
} 