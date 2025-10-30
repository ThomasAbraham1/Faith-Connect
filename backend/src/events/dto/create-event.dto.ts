import { IsDate, IsNotEmpty, IsString } from "class-validator"

export class CreateEventDto {
    @IsString()
    @IsNotEmpty()
    eventName: string
    @IsString()
    @IsNotEmpty()
    eventDate: Date
     @IsString()
    @IsNotEmpty()
    eventLocation: string
     @IsString()
    @IsNotEmpty()
    description: string
     @IsString()
    @IsNotEmpty()
    organizer: string
}
