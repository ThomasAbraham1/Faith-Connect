import { Transform, Type } from "class-transformer";

export class DeleteEventDto {
    @Transform(({ value }) => value.split(','))
    id: string[]
} 