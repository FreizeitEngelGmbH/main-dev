import { createContext, useContext, useState, type ReactNode } from "react";
import {
  partnerProfile as initialProfile,
  experiences as initialExperiences,
  bookings as initialBookings,
  availabilitySlots as initialSlots,
  payouts as initialPayouts,
  messages as initialMessages,
  dashboardStats,
} from "../mock-data/data";
import type {
  PartnerProfile,
  Experience,
  Booking,
  AvailabilitySlot,
  Payout,
  Message,
  BookingStatus,
} from "../mock-data/types";

/**
 * DEMO-ONLY, FULLY LOCAL STATE.
 *
 * Everything in this file lives in React state, initialized from static mock
 * data in ./mock-data. There is no fetch(), no axios, no apiRequest, and no
 * import of anything network-related anywhere in this file or the rest of
 * this project. Refreshing the page resets everything back to the mock data
 * above — that is expected and intentional for a demo.
 */

interface DemoDataContextType {
  profile: PartnerProfile;
  updateProfile: (patch: Partial<PartnerProfile>) => void;

  experiences: Experience[];
  toggleExperienceActive: (id: number) => void;
  updateExperience: (id: number, patch: Partial<Experience>) => void;
  addExperience: (exp: Omit<Experience, "id" | "bookingsCount" | "rating">) => void;

  bookings: Booking[];
  updateBookingStatus: (id: number, status: BookingStatus) => void;

  availabilitySlots: AvailabilitySlot[];

  payouts: Payout[];

  messages: Message[];
  markMessageRead: (id: number) => void;
  replyToMessage: (id: number) => void;

  stats: typeof dashboardStats;
}

const DemoDataContext = createContext<DemoDataContextType | null>(null);

export function DemoDataProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState(initialProfile);
  const [experiencesState, setExperiencesState] = useState(initialExperiences);
  const [bookingsState, setBookingsState] = useState(initialBookings);
  const [messagesState, setMessagesState] = useState(initialMessages);

  const updateProfile = (patch: Partial<PartnerProfile>) =>
    setProfile((p) => ({ ...p, ...patch }));

  const toggleExperienceActive = (id: number) =>
    setExperiencesState((list) =>
      list.map((e) => (e.id === id ? { ...e, active: !e.active } : e))
    );

  const updateExperience = (id: number, patch: Partial<Experience>) =>
    setExperiencesState((list) => list.map((e) => (e.id === id ? { ...e, ...patch } : e)));

  const addExperience: DemoDataContextType["addExperience"] = (exp) =>
    setExperiencesState((list) => [
      ...list,
      { ...exp, id: Math.max(0, ...list.map((e) => e.id)) + 1, bookingsCount: 0, rating: 0 },
    ]);

  const updateBookingStatus = (id: number, status: BookingStatus) =>
    setBookingsState((list) => list.map((b) => (b.id === id ? { ...b, status } : b)));

  const markMessageRead = (id: number) =>
    setMessagesState((list) => list.map((m) => (m.id === id ? { ...m, unread: false } : m)));

  const replyToMessage = (id: number) =>
    setMessagesState((list) =>
      list.map((m) => (m.id === id ? { ...m, status: "answered", unread: false } : m))
    );

  return (
    <DemoDataContext.Provider
      value={{
        profile,
        updateProfile,
        experiences: experiencesState,
        toggleExperienceActive,
        updateExperience,
        addExperience,
        bookings: bookingsState,
        updateBookingStatus,
        availabilitySlots: initialSlots,
        payouts: initialPayouts,
        messages: messagesState,
        markMessageRead,
        replyToMessage,
        stats: dashboardStats,
      }}
    >
      {children}
    </DemoDataContext.Provider>
  );
}

export function useDemoData() {
  const ctx = useContext(DemoDataContext);
  if (!ctx) throw new Error("useDemoData must be used within DemoDataProvider");
  return ctx;
}
