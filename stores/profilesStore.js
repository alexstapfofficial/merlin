import { defineStore } from "pinia";

export const useProfilesStore = defineStore("profiles", {
  state: () => ({
    myProfile: null,
    friendProfiles: [],
  }),

  getters: {
    getAllProfiles() {
      const profiles = [];
      if (this.myProfile) {
        profiles.push({ ...this.myProfile, isMine: true });
      }
      profiles.push(...this.friendProfiles.map(p => ({ ...p, isMine: false })));
      return profiles;
    },

    getProfileById: (state) => (id) => {
      if (state.myProfile && state.myProfile.id === id) {
        return state.myProfile;
      }
      return state.friendProfiles.find(p => p.id === id);
    },
  },

  actions: {
    setMyProfile(profileData) {
      this.myProfile = {
        id: 'my-profile',
        name: profileData.name,
        birthdate: profileData.birthdate,
        birthtime: profileData.birthtime,
        coordinates: profileData.coordinates,
        createdAt: new Date().toISOString(),
      };
      this.saveToLocalStorage();
    },

    addFriendProfile(profileData) {
      const newProfile = {
        id: `profile-${Date.now()}`,
        name: profileData.name,
        birthdate: profileData.birthdate,
        birthtime: profileData.birthtime,
        coordinates: profileData.coordinates,
        createdAt: new Date().toISOString(),
      };
      this.friendProfiles.push(newProfile);
      this.saveToLocalStorage();
    },

    updateProfile(id, profileData) {
      if (id === 'my-profile') {
        this.myProfile = {
          ...this.myProfile,
          name: profileData.name,
          birthdate: profileData.birthdate,
          birthtime: profileData.birthtime,
          coordinates: profileData.coordinates,
        };
      } else {
        const index = this.friendProfiles.findIndex(p => p.id === id);
        if (index !== -1) {
          this.friendProfiles[index] = {
            ...this.friendProfiles[index],
            name: profileData.name,
            birthdate: profileData.birthdate,
            birthtime: profileData.birthtime,
            coordinates: profileData.coordinates,
          };
        }
      }
      this.saveToLocalStorage();
    },

    deleteProfile(id) {
      if (id === 'my-profile') {
        this.myProfile = null;
      } else {
        this.friendProfiles = this.friendProfiles.filter(p => p.id !== id);
      }
      this.saveToLocalStorage();
    },

    saveToLocalStorage() {
      if (typeof window !== 'undefined') {
        localStorage.setItem('astro-profiles', JSON.stringify({
          myProfile: this.myProfile,
          friendProfiles: this.friendProfiles,
        }));
      }
    },

    loadFromLocalStorage() {
      if (typeof window !== 'undefined') {
        const data = localStorage.getItem('astro-profiles');
        if (data) {
          try {
            const parsed = JSON.parse(data);
            this.myProfile = parsed.myProfile || null;
            this.friendProfiles = parsed.friendProfiles || [];
          } catch (e) {
            console.error('Error loading profiles from localStorage:', e);
          }
        }
      }
    },
  },
});
