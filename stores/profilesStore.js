import { defineStore } from "pinia";

export const useProfilesStore = defineStore("profiles", {
  state: () => ({
    profile: null,
    friends: [],
    loaded: false,
  }),

  getters: {
    hasProfile() {
      return this.profile !== null;
    },
    hasFriends() {
      return this.friends.length > 0;
    },
    // Backward-compatible aliases used by some pages.
    myProfile() {
      return this.profile;
    },
    friendProfiles() {
      return this.friends;
    },
  },

  actions: {
    // Load the user's profile and friends from the database.
    async fetchProfiles() {
      const all = await $fetch("/api/profiles");
      this.profile = all.find((p) => p.isOwner) || null;
      this.friends = all.filter((p) => !p.isOwner);
      this.loaded = true;
    },

    // Backward-compatible alias for previous localStorage-based API.
    async loadFromLocalStorage() {
      return this.fetchProfiles();
    },

    async setProfile(profileData) {
      const payload = {
        name: profileData.name,
        birthdate: profileData.birthdate,
        birthtime: profileData.birthtime,
        coordinates: profileData.coordinates,
        isOwner: true,
      };

      if (this.profile) {
        this.profile = await $fetch(`/api/profiles/${this.profile.id}`, {
          method: "PUT",
          body: payload,
        });
      } else {
        this.profile = await $fetch("/api/profiles", {
          method: "POST",
          body: payload,
        });
      }
      return this.profile;
    },

    // Updating the owner profile is the same operation as setting it.
    async updateProfile(profileData) {
      return this.setProfile(profileData);
    },

    async deleteProfile() {
      if (!this.profile) return;
      await $fetch(`/api/profiles/${this.profile.id}`, { method: "DELETE" });
      this.profile = null;
    },

    // Friends management
    async addFriend(friendData) {
      const friend = await $fetch("/api/profiles", {
        method: "POST",
        body: {
          name: friendData.name,
          birthdate: friendData.birthdate,
          birthtime: friendData.birthtime,
          coordinates: friendData.coordinates,
          isOwner: false,
        },
      });
      this.friends.push(friend);
      return friend;
    },

    async updateFriend(friendId, friendData) {
      const updated = await $fetch(`/api/profiles/${friendId}`, {
        method: "PUT",
        body: {
          name: friendData.name,
          birthdate: friendData.birthdate,
          birthtime: friendData.birthtime,
          coordinates: friendData.coordinates,
        },
      });
      const index = this.friends.findIndex((f) => f.id === friendId);
      if (index !== -1) this.friends[index] = updated;
      return updated;
    },

    async deleteFriend(friendId) {
      await $fetch(`/api/profiles/${friendId}`, { method: "DELETE" });
      this.friends = this.friends.filter((f) => f.id !== friendId);
    },
  },
});
