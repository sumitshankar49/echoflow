import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'revoked_tokens' })
export class RevokedToken {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index('idx_revoked_tokens_token', { unique: true })
  @Column({ type: 'varchar', length: 512 })
  token!: string;

  @Column({ type: 'timestamp' })
  expiresAt!: Date;
}
