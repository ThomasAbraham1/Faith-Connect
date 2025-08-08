import { Body, Controller, Post, Get, UseGuards, Request } from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/CreateUser.dto";
// import { AuthenticatedGuard } from "src/auth/authenticated.guard";

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService){

    }
@Post()
createUser(@Body() createUserDto:CreateUserDto){
    // console.log(createUserDto);
    return this.usersService.createUser(createUserDto);
}

// @UseGuards(JwtAuthGuard)
@Get('profile')
getProfile(@Request() req) {
  return req.user;
}


 //Get / protected
      // @UseGuards(AuthenticatedGuard)
      @Get('/protected')
      getHello(@Request() req): string {
        return req.user;
      }
} 