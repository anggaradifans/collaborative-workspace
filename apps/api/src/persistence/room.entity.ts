import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class Room {
    @PrimaryColumn()
    id: string;

    @Column({ type: 'bytea', nullable: true })
    state: Buffer;
}
