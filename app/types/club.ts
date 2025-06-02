export interface ClubAdmin {
    id: string;
    name: string;
    avatar: string;
}

export interface Club {
    id: string;
    name: string;
    admins: ClubAdmin[];
    eventCount: number;
    color: string;
} 