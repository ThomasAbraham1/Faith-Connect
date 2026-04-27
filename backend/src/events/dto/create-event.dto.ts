import { IsBoolean, IsDateString, IsNotEmpty, IsOptional, IsString } from "class-validator"

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

    @IsOptional()
    @IsBoolean()
    isRecurring?: boolean

    @IsOptional()
    @IsString()
    recurrenceType?: string

    @IsOptional()
    @IsString()
    recurrenceDay?: string

    @IsOptional()
    @IsDateString() // Using IsDateString because frontend sends JSON
    recurrenceEndDate?: Date

    @IsOptional()
    @IsBoolean()
    registrationOpen?: boolean;

    @IsOptional()
    @IsString()
    churchId?: string;

    @IsOptional()
    @IsString()
    coverImageUrl?: string;
}
