import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
    BeforeInsert
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('users')
@Index('idx_user_email', ['email'], { unique: true })
@Index('idx_user_uuid', ['uuid'], { unique: true })
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({
        type: 'varchar',
        length: 36,
        unique: true,
        nullable: false
    })
    uuid!: string;

    @Column({
        type: 'varchar',
        length: 255,
        unique: true,
        nullable: false,
        name: 'user_email'
    })
    email!: string;

    @Column({
        type: 'varchar',
        length: 255,
        nullable: false,
        name: 'user_pwd'
    })
    password!: string;

    @CreateDateColumn({
        type: 'timestamp',
        name: 'created_at'
    })
    createdAt!: Date;

    @UpdateDateColumn({
        type: 'timestamp',
        name: 'updated_at'
    })
    updatedAt!: Date;

    @BeforeInsert()
    generateUuid() {
        if (!this.uuid) {
            this.uuid = uuidv4();
        }
    }

    static create(email: string, hashedPassword: string): User {
        const user = new User();
        user.email = email;
        user.password = hashedPassword;
        return user;
    }
}
