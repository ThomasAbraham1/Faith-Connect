import { IsBoolean, IsDateString, IsNotEmpty, IsOptional, IsString } from "class-validator"
import { Transform } from "class-transformer"

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
    @Transform(({ value }) => value === 'true' || value === true)
    @IsBoolean()
    isRecurring?: boolean

    @IsOptional()
    @Transform(({ value }) => value === "" ? undefined : value)
    @IsString()
    recurrenceType?: string

    @IsOptional()
    @Transform(({ value }) => value === "" ? undefined : value)
    @IsString()
    recurrenceDay?: string

    @IsOptional()
    @Transform(({ value }) => value === "" ? undefined : value)
    @IsDateString() // Using IsDateString because frontend sends JSON
    recurrenceEndDate?: Date

    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    @IsBoolean()
    registrationOpen?: boolean;

    @IsOptional()
    @IsString()
    churchId?: string;

    @IsOptional()
    @IsString()
    coverImageUrl?: string;
}
