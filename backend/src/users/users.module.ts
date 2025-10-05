import { Module } from "@nestjs/common";
import { User, userSchema } from "src/schemas/User.schema";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { DatabaseModule } from "src/database/database.module";

@Module({
    imports: [DatabaseModule], 
    controllers:[UsersController],
    providers:[UsersService], 
    exports:[UsersService] 
})
export class UsersModule{ 
     
}