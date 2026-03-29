import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Ad,
  DMMessage,
  Group,
  OwnedWaifu,
  ShopItem,
  UserProfile,
  WaifuCharacter,
} from "../backend";
import { ExternalBlob } from "../backend";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

// Re-export Ad so other files can import from here
export type { Ad };

export function useWaifuCharacters() {
  const { actor, isFetching } = useActor();
  return useQuery<WaifuCharacter[]>({
    queryKey: ["waifuCharacters"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getWaifuCharacters();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUserHarem(userPrincipal: Principal | null) {
  const { actor, isFetching } = useActor();
  return useQuery<OwnedWaifu[]>({
    queryKey: ["harem", userPrincipal?.toString()],
    queryFn: async () => {
      if (!actor || !userPrincipal) return [];
      return actor.getUserHarem(userPrincipal);
    },
    enabled: !!actor && !isFetching && !!userPrincipal,
  });
}

export function useCallerProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["callerProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useShopItems() {
  const { actor, isFetching } = useActor();
  return useQuery<ShopItem[]>({
    queryKey: ["shopItems"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getShopItems();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGroups() {
  const { actor, isFetching } = useActor();
  return useQuery<Group[]>({
    queryKey: ["groups"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getGroups();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMessagesWith(otherUser: Principal | null) {
  const { actor, isFetching } = useActor();
  return useQuery<DMMessage[]>({
    queryKey: ["messages", otherUser?.toString()],
    queryFn: async () => {
      if (!actor || !otherUser) return [];
      return actor.getMessagesWith(otherUser);
    },
    enabled: !!actor && !isFetching && !!otherUser,
    refetchInterval: 3000,
  });
}

export function useSaveProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Not connected");
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callerProfile"] });
    },
  });
}

export function useAddWaifuToHarem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (owned: OwnedWaifu) => {
      if (!actor) throw new Error("Not connected");
      await actor.addWaifuToHarem(owned);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["harem"] });
    },
  });
}

export function useAddWaifuCharacter() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (waifu: WaifuCharacter) => {
      if (!actor) throw new Error("Not connected");
      await actor.addWaifuCharacter(waifu);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["waifuCharacters"] });
    },
  });
}

export function useAddShopItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (item: ShopItem) => {
      if (!actor) throw new Error("Not connected");
      await actor.addShopItem(item);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopItems"] });
    },
  });
}

export function useSendDM() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      toUser,
      content,
    }: { toUser: Principal; content: string }) => {
      if (!actor) throw new Error("Not connected");
      await actor.sendDM(toUser, content);
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["messages", vars.toUser.toString()],
      });
    },
  });
}

export function useSendFriendRequest() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (toUser: Principal) => {
      if (!actor) throw new Error("Not connected");
      await actor.sendFriendRequest(toUser);
    },
  });
}

export function useCreateGroup() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (group: Group) => {
      if (!actor) throw new Error("Not connected");
      await actor.createGroup(group);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });
}

export function useTransferOnex() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      toUser,
      amount,
    }: { toUser: Principal; amount: bigint }) => {
      if (!actor) throw new Error("Not connected");
      return actor.transferOnex(toUser, amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callerProfile"] });
    },
  });
}

export function useUserProfile(principal: Principal | null) {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["userProfile", principal?.toString()],
    queryFn: async () => {
      if (!actor || !principal) return null;
      return actor.getUserProfile(principal);
    },
    enabled: !!actor && !isFetching && !!principal,
  });
}

export function useGetFriendRequests(principal: Principal | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["friendRequests", principal?.toString()],
    queryFn: async () => {
      if (!actor || !principal) return [];
      return actor.getFriendRequests(principal);
    },
    enabled: !!actor && !isFetching && !!principal,
  });
}

export function useAcceptFriendRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (fromUser: Principal) => {
      if (!actor) throw new Error("Not connected");
      await actor.acceptFriendRequest(fromUser);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
    },
  });
}

export function useSendGroupMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      groupName,
      content,
    }: { groupName: string; content: string }) => {
      if (!actor) throw new Error("Not connected");
      await actor.sendGroupMessage(groupName, content);
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["groupMessages", vars.groupName],
      });
    },
  });
}

export function useGetGroupMessages(groupName: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["groupMessages", groupName],
    queryFn: async () => {
      if (!actor || !groupName) return [];
      return actor.getGroupMessages(groupName);
    },
    enabled: !!actor && !isFetching && !!groupName,
    refetchInterval: 2000,
  });
}

export function useJoinGroup() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (groupName: string) => {
      if (!actor) throw new Error("Not connected");
      await actor.joinGroup(groupName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });
}

export function useHuntWaifuInGroup() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (groupName: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.huntWaifuInGroup(groupName);
    },
    onSuccess: (_data, groupName) => {
      queryClient.invalidateQueries({ queryKey: ["groupMessages", groupName] });
      queryClient.invalidateQueries({ queryKey: ["harem"] });
    },
  });
}

export function useAddMemberToGroup() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      groupName,
      member,
    }: { groupName: string; member: Principal }) => {
      if (!actor) throw new Error("Not connected");
      await actor.addMemberToGroup(groupName, member);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });
}

// ── Ads ──────────────────────────────────────────────────────────────────────

export function useAds() {
  const { actor, isFetching } = useActor();
  return useQuery<Ad[]>({
    queryKey: ["ads"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAds();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddAd() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ad: Ad) => {
      if (!actor) throw new Error("Not connected");
      await actor.addAd(ad);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ads"] });
    },
  });
}

export function useDeleteAd() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Not connected");
      await actor.deleteAd(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ads"] });
    },
  });
}

export function useDeleteWaifuCharacter() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Not connected");
      await actor.deleteWaifuCharacter(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["waifuCharacters"] });
    },
  });
}

// Keep ExternalBlob accessible for other files that import from here
export { ExternalBlob };
