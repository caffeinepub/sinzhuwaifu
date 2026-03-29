import Set "mo:core/Set";
import Map "mo:core/Map";
import Blob "mo:core/Blob";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Option "mo:core/Option";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";

import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";



actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // Types and Modules ========================

  type UserProfile = {
    username : Text;
    displayName : Text;
    profilePic : Storage.ExternalBlob;
    bio : Text;
    balance : Nat;
    joinDate : Time.Time;
  };

  type WaifuCharacter = {
    id : Text;
    name : Text;
    series : Text;
    rarity : Text;
    imageUrl : Text;
  };

  module WaifuCharacter {
    public func compare(a : WaifuCharacter, b : WaifuCharacter) : Order.Order {
      Text.compare(a.id, b.id);
    };
  };

  type OwnedWaifu = {
    userId : Principal;
    characterId : Text;
    obtainedAt : Nat;
    isFavorite : Bool;
  };

  module OwnedWaifu {
    public func compare(a : OwnedWaifu, b : OwnedWaifu) : Order.Order {
      Blob.compare(a.userId.toBlob(), b.userId.toBlob());
    };
  };

  type ShopItem = {
    id : Text;
    name : Text;
    description : Text;
    price : Nat;
    itemType : Text;
  };

  module ShopItem {
    public func compare(a : ShopItem, b : ShopItem) : Order.Order {
      Text.compare(a.id, b.id);
    };
  };

  type DailyClaim = {
    userId : Principal;
    claimType : Text;
    lastClaimed : Time.Time;
  };

  module DailyClaim {
    public func compare(a : DailyClaim, b : DailyClaim) : Order.Order {
      Blob.compare(a.userId.toBlob(), b.userId.toBlob());
    };
  };

  type Group = {
    name : Text;
    description : Text;
    createdBy : Principal;
    members : [Principal];
    spawnInterval : Nat;
  };

  module Group {
    public func compare(a : Group, b : Group) : Order.Order {
      Text.compare(a.name, b.name);
    };
  };

  type FriendRequest = {
    fromUser : Principal;
    toUser : Principal;
    status : Text;
  };

  module FriendRequest {
    public func compare(a : FriendRequest, b : FriendRequest) : Order.Order {
      let fromCompare = Blob.compare(a.fromUser.toBlob(), b.fromUser.toBlob());
      if (fromCompare == #equal) {
        Blob.compare(a.toUser.toBlob(), b.toUser.toBlob());
      } else {
        fromCompare;
      };
    };
  };

  type DMMessage = {
    fromUser : Principal;
    toUser : Principal;
    content : Text;
    timestamp : Time.Time;
  };

  type GroupMessage = {
    id : Text;
    groupName : Text;
    senderPrincipal : Principal;
    senderName : Text;
    content : Text;
    timestamp : Time.Time;
    isWaifuSpawn : Bool;
    waifuCharacterId : Text;
  };

  module GroupMessage {
    public func compare(a : GroupMessage, b : GroupMessage) : Order.Order {
      Text.compare(a.id, b.id);
    };
  };

  // Ad type for homepage ads
  type Ad = {
    id : Text;
    title : Text;
    imageUrl : Text;
    videoUrl : Text;
    link : Text;
  };

  module Ad {
    public func compare(a : Ad, b : Ad) : Order.Order {
      Text.compare(a.id, b.id);
    };
  };

  // State Variables ==========================

  let userProfiles = Map.empty<Principal, UserProfile>();
  let waifuCharacters = Map.empty<Text, WaifuCharacter>();
  let ownedWaifus = Map.empty<Principal, Set.Set<OwnedWaifu>>();
  let dailyClaims = Map.empty<Principal, Set.Set<DailyClaim>>();
  let shopItems = Map.empty<Text, ShopItem>();
  let groups = Map.empty<Text, Group>();
  let groupMembers = Map.empty<Text, Set.Set<Principal>>();
  let friendRequests = Map.empty<Principal, Set.Set<FriendRequest>>();
  let friendships = Map.empty<Principal, Set.Set<Principal>>();
  let dmMessages = Map.empty<Principal, Map.Map<Principal, [DMMessage]>>();
  let groupMessages = Map.empty<Text, [GroupMessage]>();
  let groupMessageCounts = Map.empty<Text, Nat>();
  let groupWaifuSpawns = Map.empty<Text, Text>();
  let ads = Map.empty<Text, Ad>();

  // User Profile Management ==================

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  // Waifu Character Management ===============

  public shared ({ caller }) func addWaifuCharacter(waifu : WaifuCharacter) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can add waifu characters");
    };
    if (waifuCharacters.containsKey(waifu.id)) {
      Runtime.trap("Waifu character already exists");
    };
    waifuCharacters.add(waifu.id, waifu);
  };

  public query ({ caller }) func getWaifuCharacters() : async [WaifuCharacter] {
    waifuCharacters.values().toArray().sort();
  };

  // Delete waifu character (admin only)
  public shared ({ caller }) func deleteWaifuCharacter(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can delete waifu characters");
    };
    let remaining = Map.empty<Text, WaifuCharacter>();
    waifuCharacters.forEach(func(k, v) {
      if (k != id) { remaining.add(k, v) };
    });
    waifuCharacters.clear();
    remaining.forEach(func(k, v) { waifuCharacters.add(k, v) });
  };

  // Owned Waifu Management ===================

  public shared ({ caller }) func addWaifuToHarem(ownedWaifu : OwnedWaifu) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add waifus to harem");
    };
    if (caller != ownedWaifu.userId) {
      Runtime.trap("Unauthorized: Can only add waifus to your own harem");
    };
    let harem = ownedWaifus.get(ownedWaifu.userId).get(Set.empty<OwnedWaifu>());
    if (harem.contains(ownedWaifu)) {
      Runtime.trap("Waifu already owned by user");
    };
    harem.add(ownedWaifu);
    ownedWaifus.add(ownedWaifu.userId, harem);
  };

  public query ({ caller }) func getUserHarem(user : Principal) : async [OwnedWaifu] {
    switch (ownedWaifus.get(user)) {
      case (null) { [] };
      case (?harem) { harem.toArray().sort() };
    };
  };

  // Shop Management ==========================

  public shared ({ caller }) func addShopItem(item : ShopItem) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can add shop items");
    };
    if (shopItems.containsKey(item.id)) {
      Runtime.trap("Shop item already exists");
    };
    shopItems.add(item.id, item);
  };

  public query ({ caller }) func getShopItems() : async [ShopItem] {
    shopItems.values().toArray().sort();
  };

  // Group Management =========================

  public shared ({ caller }) func createGroup(group : Group) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create groups");
    };
    if (caller != group.createdBy) {
      Runtime.trap("Unauthorized: Can only create groups as yourself");
    };
    groups.add(group.name, group);
    let members = Set.empty<Principal>();
    members.add(group.createdBy);
    groupMembers.add(group.name, members);
    groupMessages.add(group.name, []);
    groupMessageCounts.add(group.name, 0);
  };

  public query ({ caller }) func getGroups() : async [Group] {
    groups.values().toArray().sort();
  };

  public query ({ caller }) func getGroupMembers(groupName : Text) : async [Principal] {
    switch (groupMembers.get(groupName)) {
      case (null) { [] };
      case (?members) { members.toArray() };
    };
  };

  // Friend Request Management ================

  public shared ({ caller }) func sendFriendRequest(toUser : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send friend requests");
    };
    let request : FriendRequest = {
      fromUser = caller;
      toUser;
      status = "pending";
    };
    let requests = friendRequests.get(toUser).get(Set.empty<FriendRequest>());
    if (requests.contains(request)) {
      Runtime.trap("Friend request already sent");
    };
    requests.add(request);
    friendRequests.add(toUser, requests);
  };

  public shared ({ caller }) func acceptFriendRequest(fromUser : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can accept friend requests");
    };
    switch (friendRequests.get(caller)) {
      case (null) { Runtime.trap("No friend requests found") };
      case (?requests) {
        let filtered = requests.filter(
          func(fr) {
            not (fr.fromUser == fromUser and fr.toUser == caller and fr.status == "pending")
          }
        );
        let accepted = Set.empty<FriendRequest>();
        let requestsRet = filtered.union(accepted);
        friendRequests.add(caller, requestsRet);
        let friends = friendships.get(caller).get(Set.empty<Principal>());
        if (friends.contains(fromUser)) {
          Runtime.trap("Already friends");
        };
        friends.add(fromUser);
        friendships.add(caller, friends);
        let fromUserFriends = friendships.get(fromUser).get(Set.empty<Principal>());
        fromUserFriends.add(caller);
        friendships.add(fromUser, fromUserFriends);
      };
    };
  };

  public query ({ caller }) func getFriendRequests(user : Principal) : async [FriendRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view friend requests");
    };
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own friend requests");
    };
    switch (friendRequests.get(user)) {
      case (null) { [] };
      case (?requests) { requests.toArray().sort() };
    };
  };

  // Messaging ================================

  public shared ({ caller }) func sendDM(toUser : Principal, content : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send messages");
    };
    let messages = dmMessages.get(caller).get(Map.empty<Principal, [DMMessage]>());
    let conversation = messages.get(toUser);
    switch (conversation) {
      case (null) {
        let newMessage : DMMessage = { fromUser = caller; toUser; content; timestamp = Time.now() };
        messages.add(toUser, [newMessage]);
      };
      case (?convo) {
        let newMessage : DMMessage = { fromUser = caller; toUser; content; timestamp = Time.now() };
        let updated = convo.concat([newMessage]);
        messages.add(toUser, updated);
      };
    };
    dmMessages.add(caller, messages);
  };

  public query ({ caller }) func getMessagesWith(user : Principal) : async [DMMessage] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view messages");
    };
    switch (dmMessages.get(caller)) {
      case (null) { [] };
      case (?messages) {
        switch (messages.get(user)) {
          case (null) { [] };
          case (?convo) { convo };
        };
      };
    };
  };

  // Group Messaging ==========================

  public shared ({ caller }) func sendGroupMessage(groupName : Text, content : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send group messages");
    };
    switch (groups.get(groupName)) {
      case (null) { Runtime.trap("Group does not exist") };
      case (?group) {
        switch (groupMembers.get(groupName)) {
          case (null) { Runtime.trap("Group has no members") };
          case (?members) {
            if (not members.contains(caller)) {
              Runtime.trap("Unauthorized: Only group members can send messages");
            };
          };
        };
        let senderName = switch (userProfiles.get(caller)) {
          case (null) { "Anonymous" };
          case (?profile) { profile.displayName };
        };
        let currentCount = groupMessageCounts.get(groupName).get(0);
        let newCount = currentCount + 1;
        groupMessageCounts.add(groupName, newCount);
        let message : GroupMessage = {
          id = groupName.concat("_").concat(newCount.toText());
          groupName;
          senderPrincipal = caller;
          senderName;
          content;
          timestamp = Time.now();
          isWaifuSpawn = false;
          waifuCharacterId = "";
        };
        let messages = groupMessages.get(groupName).get([]);
        let updated = messages.concat([message]);
        groupMessages.add(groupName, updated);
        if (newCount % 15 == 0) {
          let waifuIds = waifuCharacters.keys().toArray();
          if (waifuIds.size() > 0) {
            let randomIndex = Time.now().toNat() % waifuIds.size();
            let waifuId = waifuIds[randomIndex];
            groupWaifuSpawns.add(groupName, waifuId);
            let botMessage : GroupMessage = {
              id = groupName.concat("_").concat((newCount + 1).toText());
              groupName;
              senderPrincipal = caller;
              senderName = "Sinzhu Bot";
              content = "A new waifu has spawned in this group!";
              timestamp = Time.now();
              isWaifuSpawn = true;
              waifuCharacterId = waifuId;
            };
            let botMessages = groupMessages.get(groupName).get([]);
            let botUpdated = botMessages.concat([botMessage]);
            groupMessages.add(groupName, botUpdated);
            groupMessageCounts.add(groupName, newCount + 1);
          };
        };
      };
    };
  };

  public query ({ caller }) func getGroupMessages(groupName : Text) : async [GroupMessage] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view group messages");
    };
    switch (groupMembers.get(groupName)) {
      case (null) { Runtime.trap("Group does not exist") };
      case (?members) {
        if (not members.contains(caller) and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only group members can view messages");
        };
      };
    };
    groupMessages.get(groupName).get([]).sort();
  };

  public shared ({ caller }) func huntWaifuInGroup(groupName : Text) : async ?WaifuCharacter {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can hunt waifus");
    };
    switch (groups.get(groupName)) {
      case (null) { Runtime.trap("Group does not exist") };
      case (_group) {
        switch (groupMembers.get(groupName)) {
          case (null) { Runtime.trap("Group has no members") };
          case (?members) {
            if (not members.contains(caller)) {
              Runtime.trap("Unauthorized: Only group members can hunt waifus");
            };
          };
        };
        switch (groupWaifuSpawns.get(groupName)) {
          case (null) { null };
          case (?waifuId) {
            switch (waifuCharacters.get(waifuId)) {
              case (null) { Runtime.trap("Waifu character not found") };
              case (?waifu) {
                let remainingGroupWaifuSpawns = Map.empty<Text, Text>();
                groupWaifuSpawns.forEach(
                  func(gName, wId) {
                    if (gName != groupName) {
                      remainingGroupWaifuSpawns.add(gName, wId);
                    };
                  }
                );
                groupWaifuSpawns.clear();
                remainingGroupWaifuSpawns.forEach(
                  func(gName, wId) { groupWaifuSpawns.add(gName, wId) }
                );
                ?waifu;
              };
            };
          };
        };
      };
    };
  };

  // Group Membership =========================

  public shared ({ caller }) func joinGroup(groupName : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can join groups");
    };
    switch (groupMembers.get(groupName)) {
      case (null) { Runtime.trap("Group does not exist") };
      case (?members) {
        if (members.contains(caller)) {
          Runtime.trap("Already a member of this group");
        };
        members.add(caller);
        groupMembers.add(groupName, members);
      };
    };
  };

  public shared ({ caller }) func addMemberToGroup(groupName : Text, member : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add members to groups");
    };
    switch (groups.get(groupName)) {
      case (null) { Runtime.trap("Group does not exist") };
      case (?group) {
        if (caller != group.createdBy and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only group creator or admin can add members");
        };
        switch (groupMembers.get(groupName)) {
          case (null) { Runtime.trap("Group has no members") };
          case (?members) {
            if (members.contains(member)) {
              Runtime.trap("User already a member of this group");
            };
            members.add(member);
            groupMembers.add(groupName, members);
          };
        };
      };
    };
  };

  // Payment ==================================

  public shared ({ caller }) func transferOnex(toUser : Principal, amount : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can transfer Onex");
    };
    switch (userProfiles.get(caller), userProfiles.get(toUser)) {
      case (null, _) { Runtime.trap("Sender not registered") };
      case (_, null) { Runtime.trap("Receiver not registered") };
      case (?sender, ?recipient) {
        if (sender.balance < amount) { return false };
        let updatedSender : UserProfile = { username = sender.username; displayName = sender.displayName; profilePic = sender.profilePic; bio = sender.bio; balance = sender.balance - amount; joinDate = sender.joinDate };
        let updatedRecipient : UserProfile = { username = recipient.username; displayName = recipient.displayName; profilePic = recipient.profilePic; bio = recipient.bio; balance = recipient.balance + amount; joinDate = recipient.joinDate };
        userProfiles.add(caller, updatedSender);
        userProfiles.add(toUser, updatedRecipient);
        true;
      };
    };
  };

  // Ads Management ===========================

  // Add a new ad (admin only)
  public shared ({ caller }) func addAd(ad : Ad) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can add ads");
    };
    ads.add(ad.id, ad);
  };

  // Delete an ad (admin only)
  public shared ({ caller }) func deleteAd(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can delete ads");
    };
    let remaining = Map.empty<Text, Ad>();
    ads.forEach(func(k, v) {
      if (k != id) { remaining.add(k, v) };
    });
    ads.clear();
    remaining.forEach(func(k, v) { ads.add(k, v) });
  };

  // Get all ads (public)
  public query func getAds() : async [Ad] {
    ads.values().toArray().sort();
  };
};
