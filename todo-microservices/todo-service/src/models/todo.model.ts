import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    BeforeInsert,
    Index
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('todos')
@Index('idx_todo_uuid', ['uuid'], { unique: true })
@Index('idx_todo_user', ['userUuid'])
export class Todo {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'varchar',
        length: 36,
        unique: true,
        nullable: false
    })
    uuid: string;

    @Column({
        type: 'text',
        nullable: false
    })
    content: string;

    @Column({
        type: 'varchar',
        length: 36,
        name: 'user_uuid',
        nullable: false
    })
    userUuid: string;

    @Column({
        type: 'boolean',
        default: false
    })
    completed: boolean;

    @CreateDateColumn({
        type: 'timestamp',
        name: 'created_at'
    })
    createdAt: Date;

    @UpdateDateColumn({
        type: 'timestamp',
        name: 'updated_at'
    })
    updatedAt: Date;

    @BeforeInsert()
    generateUuid() {
        if (!this.uuid) {
            this.uuid = uuidv4();
        }
    }
}