import { Generated, Insertable, Selectable, Updateable } from 'kysely';

export type UserTable = {
  id: Generated<string>;
  email: string;
};

export type User = Selectable<UserTable>;
export type NewUser = Insertable<UserTable>;
export type UserUpdate = Updateable<UserTable>;
