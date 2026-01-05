import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './room.entity';
import * as Y from 'yjs';

@Injectable()
export class PersistenceService {
    constructor(
        @InjectRepository(Room)
        private roomRepository: Repository<Room>,
    ) { }

    async saveState(roomId: string, update: Uint8Array) {
        let room = await this.roomRepository.findOneBy({ id: roomId });

        if (!room) {
            room = this.roomRepository.create({ id: roomId, state: Buffer.from(update) });
        } else {
            // Merge current state with update
            const doc = new Y.Doc();
            if (room.state) {
                Y.applyUpdate(doc, new Uint8Array(room.state));
            }
            Y.applyUpdate(doc, update);
            room.state = Buffer.from(Y.encodeStateAsUpdate(doc));
        }

        await this.roomRepository.save(room);
    }

    async getState(roomId: string): Promise<Uint8Array> {
        let room = await this.roomRepository.findOneBy({ id: roomId });
        if (room?.state) {
            return new Uint8Array(room.state);
        }

        // Initialize with default state if room doesn't exist or has no state
        const doc = new Y.Doc();
        const columnsArray = doc.getArray('columns');
        columnsArray.push([
            { id: 'todo', title: 'To Do' },
            { id: 'in-progress', title: 'In Progress' },
            { id: 'done', title: 'Done' },
        ]);

        const initialState = Y.encodeStateAsUpdate(doc);

        // Auto-save the initial state so we don't re-init next time
        if (!room) {
            room = this.roomRepository.create({ id: roomId, state: Buffer.from(initialState) });
        } else {
            room.state = Buffer.from(initialState);
        }
        await this.roomRepository.save(room);

        return initialState;
    }
}
