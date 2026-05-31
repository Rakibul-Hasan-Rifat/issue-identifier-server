export const Role = {
    contributor: "CONTRIBUTOR",
    maintainer: "MAINTAINER"
} as const;

export type Role = typeof Role[keyof typeof Role]

export default interface IUser {
    id?: number;
    name: string;
    email: string;
    password: string;
    role?: Role;
    created_at?: Date;
    updated_at?: Date;
}
