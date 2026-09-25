import React, { useState } from 'react';
import { ArtisanProfile, ViewTab } from '../types';
import { getTranslation } from '../i18n/translations';
import {
  ShieldCheck,
  Award,
  MapPin,
  Phone,
  Landmark,
  CheckCircle2,
  Edit3,
  Globe,
  Sparkles,
  BookOpen,
  Calendar,
  Save,
  Star,
  ShoppingBag
} from 'lucide-react';

interface ProfileViewProps {
  profile: ArtisanProfile;
  currentLang: string;
  onUpdateProfile: (updated: ArtisanProfile) => void;
  onNavigateTab: (tab: ViewTab) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  currentLang,
  onUpdateProfile,
  onNavigateTab,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profile.name);
  const [hindiName, setHindiName] = useState(profile.hindiName);
  const [craftCategory, setCraftCategory] = useState(profile.craftCategory);
  const [about, setAbout] = useState(profile.about);
  const [phone, setPhone] = useState(profile.phone);

  const handleSave = () => {
    onUpdateProfile({
      ...profile,
      name,
      hindiName,
      craftCategory,
      about,
      phone,
    });
    setIsEditing(false);
  };

  return (
    <div id="profile-view" className="space-y-6 max-w-5xl mx-auto p-4 sm:p-6 pb-24 md:pb-12">
      {/* 1. Profile Banner & Card */}
      <div className="bg-white border border-[#E8DFC8] rounded-3xl overflow-hidden shadow-xs">
        {/* Banner with subtle textile motif */}
        <div className="h-32 sm:h-40 bg-gradient-to-r from-[#3D405B] via-terracotta to-[#E07A5F] relative p-6 flex items-end">
          <div className="absolute inset-0 opacity-20 bg-craft-pattern pointer-events-none"></div>
          <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            <span className="px-3 py-1 rounded-sm bg-black/40 backdrop-blur-md text-white text-[10px] uppercase tracking-wider font-bold border border-white/30 flex items-center gap-1 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-[#81B29A]" />
              Pehchan ID Verified
            </span>
          </div>
        </div>

        {/* Profile Details Container */}
        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-14 sm:-mt-16 mb-4">
            <div className="flex items-end gap-4">
              <img
                src={profile.profilePhoto}
                alt={profile.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-white shadow-craft-md bg-ivory"
              />
              <div className="mb-1">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2C241E] font-craft tracking-tight">
                  {profile.name}
                </h2>
                <p className="text-xs sm:text-sm font-bold text-terracotta uppercase tracking-wider mt-1">
                  {profile.craftCategory} • {profile.experienceYears} Years Experience
                </p>
              </div>
            </div>

            <button
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-ivory hover:bg-[#E8DFC8] border border-[#E8DFC8] text-xs font-bold text-[#2C241E] cursor-pointer"
            >
              {isEditing ? (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Profile</span>
                </>
              ) : (
                <>
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </>
              )}
            </button>
          </div>

          {/* Verification Badges Row */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-[#E8DFC8]/60">
            <span className="px-3 py-1 rounded-full bg-[#81B29A]/15 border border-[#81B29A]/30 text-xs font-bold text-[#2D6A4F] flex items-center gap-1">
              <Award className="w-3.5 h-3.5" />
              National Handicraft Awardee
            </span>
            <span className="px-3 py-1 rounded-full bg-[#81B29A]/15 border border-[#81B29A]/30 text-xs font-bold text-[#2D6A4F] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              GI Tag Certified Artisan
            </span>
            <span className="px-3 py-1 rounded-full bg-ivory border border-[#E8DFC8] text-xs font-bold text-brown flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-[#F4A261] fill-current" />
              {profile.rating} Rating (142+ Reviews)
            </span>
            <span className="px-3 py-1 rounded-full bg-ivory border border-[#E8DFC8] text-xs font-bold text-brown flex items-center gap-1">
              <ShoppingBag className="w-3.5 h-3.5 text-[#E07A5F]" />
              {profile.totalProductsSold} Total Units Sold
            </span>
          </div>
        </div>
      </div>

      {/* 2. Artisan Identity & Government Verification Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pehchan Card Info */}
        <div className="bg-white border border-[#E8DFC8] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#E07A5F]/15 text-[#E07A5F]">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#2C241E]">
                Ministry of Textiles Verification
              </h3>
              <p className="text-xs text-[#7A6E65]">
                Govt. of India Certified Master Craftsperson
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-2xl bg-ivory border border-[#E8DFC8] flex items-center justify-between">
              <span className="text-[#7A6E65]">National Artisan ID (Pehchan):</span>
              <span className="font-extrabold text-[#2C241E]">{profile.artisanCardNumber}</span>
            </div>

            <div className="p-3 rounded-2xl bg-ivory border border-[#E8DFC8] flex items-center justify-between">
              <span className="text-[#7A6E65]">GI Registration:</span>
              <span className="font-extrabold text-[#2D6A4F] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> GI Certified
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-ivory border border-[#E8DFC8] flex items-center justify-between">
              <span className="text-[#7A6E65]">Direct Bank Linkage:</span>
              <span className="font-bold text-[#2C241E]">
                {profile.bankAccountLinked ? 'State Bank of India (***4912) Linked' : 'Pending Linkage'}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-ivory border border-[#E8DFC8] flex items-center justify-between">
              <span className="text-[#7A6E65]">Contact Phone:</span>
              <span className="font-bold text-[#2C241E]">{profile.phone}</span>
            </div>
          </div>
        </div>

        {/* Bio & Craft Heritage */}
        <div className="bg-white border border-[#E8DFC8] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#81B29A]/15 text-[#2D6A4F]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#2C241E]">
                Artisan Story & Lineage
              </h3>
              <p className="text-xs text-[#7A6E65]">
                {profile.region}, {profile.state}
              </p>
            </div>
          </div>

          {isEditing ? (
            <textarea
              rows={4}
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              className="w-full p-3.5 rounded-2xl bg-ivory border border-[#E8DFC8] text-xs leading-relaxed text-[#2C241E]"
            />
          ) : (
            <p className="text-xs sm:text-sm text-brown leading-relaxed italic bg-ivory p-4 rounded-2xl border border-[#E8DFC8]">
              "{profile.about}"
            </p>
          )}

          <div className="pt-2 text-xs text-[#7A6E65] flex items-center justify-between">
            <span>Primary Languages:</span>
            <span className="font-bold text-[#2C241E]">
              {profile.languages.join(', ')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
