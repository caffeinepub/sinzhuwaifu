import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type Time = bigint;
export interface GroupMessage {
    id: string;
    isWaifuSpawn: boolean;
    content: string;
    waifuCharacterId: string;
    senderPrincipal: Principal;
    timestamp: Time;
    senderName: string;
    groupName: string;
}
export interface Group {
    members: Array<Principal>;
    name: string;
    createdBy: Principal;
    description: string;
    spawnInterval: bigint;
}
export interface ShopItem {
    id: string;
    name: string;
    description: string;
    itemType: string;
    price: bigint;
}
export interface OwnedWaifu {
    userId: Principal;
    obtainedAt: bigint;
    isFavorite: boolean;
    characterId: string;
}
export interface FriendRequest {
    status: string;
    toUser: Principal;
    fromUser: Principal;
}
export interface DMMessage {
    content: string;
    toUser: Principal;
    timestamp: Time;
    fromUser: Principal;
}
export interface WaifuCharacter {
    id: string;
    name: string;
    series: string;
    imageUrl: string;
    rarity: string;
}
export interface UserProfile {
    bio: string;
    username: string;
    balance: bigint;
    displayName: string;
    joinDate: Time;
    profilePic: ExternalBlob;
}
export interface Ad {
    id: string;
    title: string;
    imageUrl: string;
    videoUrl: string;
    link: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    acceptFriendRequest(fromUser: Principal): Promise<void>;
    addAd(ad: Ad): Promise<void>;
    addMemberToGroup(groupName: string, member: Principal): Promise<void>;
    addShopItem(item: ShopItem): Promise<void>;
    addWaifuCharacter(waifu: WaifuCharacter): Promise<void>;
    addWaifuToHarem(ownedWaifu: OwnedWaifu): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createGroup(group: Group): Promise<void>;
    deleteAd(id: string): Promise<void>;
    deleteWaifuCharacter(id: string): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getAds(): Promise<Array<Ad>>;
    getFriendRequests(user: Principal): Promise<Array<FriendRequest>>;
    getGroupMembers(groupName: string): Promise<Array<Principal>>;
    getGroupMessages(groupName: string): Promise<Array<GroupMessage>>;
    getGroups(): Promise<Array<Group>>;
    getMessagesWith(user: Principal): Promise<Array<DMMessage>>;
    getShopItems(): Promise<Array<ShopItem>>;
    getUserHarem(user: Principal): Promise<Array<OwnedWaifu>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWaifuCharacters(): Promise<Array<WaifuCharacter>>;
    huntWaifuInGroup(groupName: string): Promise<WaifuCharacter | null>;
    isCallerAdmin(): Promise<boolean>;
    joinGroup(groupName: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendDM(toUser: Principal, content: string): Promise<void>;
    sendFriendRequest(toUser: Principal): Promise<void>;
    sendGroupMessage(groupName: string, content: string): Promise<void>;
    transferOnex(toUser: Principal, amount: bigint): Promise<boolean>;
}
