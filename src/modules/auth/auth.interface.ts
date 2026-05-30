export default interface IUser {
    id?: number;
    name: string;
    email: string;
    password: string;
    role?: typeof Role;
    created_at?: Date;
    updated_at?: Date;
}

export const Role = {
    contributor: "CONTRIBUTOR",
    maintainer: "MAINTAINER"
} as const