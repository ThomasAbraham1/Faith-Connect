import { Transform, Type } from "class-transformer";

export class DeleteMemberDto {
    @Transform(({ value }) => value.split(','))
    id: string[]
} 