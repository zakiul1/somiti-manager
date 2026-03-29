export type AuthUser = {
    id?: number;
    name?: string;
    email?: string;
    roles?: string[];
};

export type AuthProps = {
    user?: AuthUser | null;
};
