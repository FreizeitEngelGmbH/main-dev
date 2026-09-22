import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { apiConfig } from "@/api/config";
import type { HttpMethod } from "@/api/types";
import type { MockResponse } from "@/mocks/mockEngine";
import {
  demoPartnerProfile,
  demoPartnerStats,
  demoBookings,
  demoExperiences,
  demoSettlements,
  demoCities,
  demoPartners,
  demoFeaturedExperiences,
  demoBundles,
  demoPartnerResources,
  demoCategories,
  demoCommissionInvoices,
  demoPartnerGroupActivitiesSeed,
  demoPartnerInquiriesSeed,
  demoPartnerInquiryTemplatesSeed,
  demoShopPartners,
  demoShopExperiences,
} from "./demo-data";

/**
 * PARTNER-DEMO MOCK BACKEND (static, in-memory, no network).
 *
 * Answers the `/api/partner/*` calls (plus the public shop/home/bundle
 * lookups) made by the Partner Demo screens. It is mounted only around those
 * screens (see `PartnerDemoApp.tsx`), as a nested QueryClientProvider, and is
 * kept separate from the admin's mock API (`src/mocks`) on purpose: both
 * speak paths like `/api/partners` and `/api/experiences` but return
 * differently shaped data.
 *
 * Login/session is NOT handled here. The unified app restores the real
 * backend session through GET /api/user and never persists auth state in
 * browser storage.
 *
 * No fetch(), axios, XMLHttpRequest, WebSocket or EventSource is used. Every
 * response is built in memory from ./demo-data and wrapped in a native
 * `Response` so `res.json()` keeps working in the unmodified screens.
 * Edits made in the demo (new groups, inquiry replies, check-ins) live in
 * memory and reset on reload, by design.
 */

// Local, in-memory copy of the demo partner's group activities - mutated
// when the create-group dialog "creates" a new group, so it actually shows
// up in the list afterward. Resets on page refresh - by design.
let partnerGroupActivities: any[] = [...demoPartnerGroupActivitiesSeed];
let nextGroupActivityId = 8100;

// Local, in-memory copy of the demo partner's inbox (Anfragemanagement) -
// mutated when a reply is sent or a status/priority/notes change, and when
// templates are created/edited/deleted. Resets on page refresh - by design.
let partnerInquiries: any[] = demoPartnerInquiriesSeed.map((i) => ({ ...i, replies: [...i.replies] }));
let partnerInquiryTemplates: any[] = [...demoPartnerInquiryTemplatesSeed];
let nextInquiryReplyId = 9700;
let nextTemplateId = 7300;

// Local, in-memory copy of the demo bookings, extended with a QR
// bookingReference and checkedIn state - backs the QR-Scanner's
// validate-booking / check-in endpoints. Resets on page refresh - by design.
let scannerBookings: any[] = demoBookings.map((b) => ({
  ...b,
  bookingReference: `FE-${b.id}`,
  checkedIn: false,
  checkedInAt: null as string | null,
}));

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function delay(ms = 350) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function computeInquiryStats(all: any[]) {
  const buckets: Record<string, number> = { new: 0, in_progress: 0, quoted: 0, won: 0, lost: 0 };
  let totalResponseMs = 0;
  let respondedCount = 0;
  for (const i of all) {
    if (buckets.hasOwnProperty(i.status)) buckets[i.status] += 1;
    if (i.respondedAt && i.createdAt) {
      totalResponseMs += new Date(i.respondedAt).getTime() - new Date(i.createdAt).getTime();
      respondedCount += 1;
    }
  }
  const avgResponseTimeHours = respondedCount > 0 ? Math.round(((totalResponseMs / respondedCount) / 3600000) * 10) / 10 : 0;
  return { ...buckets, total: all.length, avgResponseTimeHours };
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

/**
 * Mocked replacement for the real apiRequest(method, url, data).
 * Same signature as the real function - every real file calling it works
 * completely unchanged.
 */
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown
): Promise<Response | MockResponse> {
  if (!apiConfig.useMockApi) {
    return apiClient.raw(url, {
      method: method.toUpperCase() as HttpMethod,
      body: data,
    });
  }

  await delay();

  // --- Partner application form (partner-page.tsx) ---
  if (method === "POST" && url === "/api/partners") {
    const res = json({ id: 999, ...((data as object) ?? {}), approved: false });
    await throwIfResNotOk(res);
    return res;
  }

  // --- Create-a-group dialog (CreateGroupDialog) ---
  if (method === "POST" && url === "/api/group-activities") {
    const submitted = (data ?? {}) as Record<string, unknown>;
    const newGroup = {
      id: nextGroupActivityId++,
      partnerId: 501,
      status: "open",
      currentParticipants: 1,
      ...submitted,
    };
    partnerGroupActivities = [newGroup, ...partnerGroupActivities];
    const res = json(newGroup);
    await throwIfResNotOk(res);
    return res;
  }

  // --- Group inquiry form on the public shop page (GroupInquiryForm.tsx) ---
  if (method === "POST" && url === "/api/group-inquiry") {
    const submitted = (data ?? {}) as Record<string, unknown>;
    const res = json({
      id: Date.now(),
      ...submitted,
      message: "Vielen Dank für Ihre Anfrage! Der Partner meldet sich in Kürze bei Ihnen.",
      createdAt: new Date().toISOString(),
    });
    await throwIfResNotOk(res);
    return res;
  }

  // --- Anfragemanagement (partner-inquiries.tsx) ---
  const replyMatch = url.match(/^\/api\/partner\/inquiries\/(\d+)\/reply$/);
  if (method === "POST" && replyMatch) {
    const id = Number(replyMatch[1]);
    const inquiry = partnerInquiries.find((i) => i.id === id);
    if (!inquiry) {
      const res = json({ message: "Anfrage nicht gefunden" }, 404);
      await throwIfResNotOk(res);
      return res;
    }
    const { message, isInternal, newStatus } = (data ?? {}) as { message?: string; isInternal?: boolean; newStatus?: string };
    const now = new Date().toISOString();
    const reply = {
      id: nextInquiryReplyId++,
      inquiryId: id,
      fromType: "partner",
      authorName: demoPartnerProfile.companyName,
      message: (message ?? "").trim(),
      isInternal: !!isInternal,
      emailSent: !isInternal,
      createdAt: now,
    };
    inquiry.replies = [...inquiry.replies, reply];
    inquiry.replyCount = inquiry.replies.length;
    inquiry.lastReplyBy = "partner";
    inquiry.updatedAt = now;
    if (!isInternal && !inquiry.respondedAt) inquiry.respondedAt = now;
    if (newStatus) inquiry.status = newStatus;
    const res = json({ ...inquiry, replies: inquiry.replies });
    await throwIfResNotOk(res);
    return res;
  }

  const inquiryPatchMatch = url.match(/^\/api\/partner\/inquiries\/(\d+)$/);
  if (method === "PATCH" && inquiryPatchMatch) {
    const id = Number(inquiryPatchMatch[1]);
    const inquiry = partnerInquiries.find((i) => i.id === id);
    if (!inquiry) {
      const res = json({ message: "Anfrage nicht gefunden" }, 404);
      await throwIfResNotOk(res);
      return res;
    }
    const patch = (data ?? {}) as Record<string, unknown>;
    (["status", "priority", "internalNotes", "assignedTo", "subject"] as const).forEach((k) => {
      if (patch[k] !== undefined) (inquiry as any)[k] = patch[k];
    });
    if (patch.status === "won" || patch.status === "lost" || patch.status === "closed") {
      inquiry.closedAt = new Date().toISOString();
    }
    inquiry.updatedAt = new Date().toISOString();
    const res = json(inquiry);
    await throwIfResNotOk(res);
    return res;
  }

  if (method === "POST" && url === "/api/partner/inquiry-templates") {
    const submitted = (data ?? {}) as Record<string, unknown>;
    const template = {
      id: nextTemplateId++,
      partnerId: 501,
      name: submitted.name ?? "",
      category: submitted.category ?? "custom",
      subject: submitted.subject ?? null,
      body: submitted.body ?? "",
      isDefault: !!submitted.isDefault,
      createdAt: new Date().toISOString(),
    };
    partnerInquiryTemplates = [...partnerInquiryTemplates, template];
    const res = json(template);
    await throwIfResNotOk(res);
    return res;
  }

  const templatePatchMatch = url.match(/^\/api\/partner\/inquiry-templates\/(\d+)$/);
  if (method === "PATCH" && templatePatchMatch) {
    const id = Number(templatePatchMatch[1]);
    const idx = partnerInquiryTemplates.findIndex((t) => t.id === id);
    if (idx >= 0) {
      partnerInquiryTemplates[idx] = { ...partnerInquiryTemplates[idx], ...(data as object) };
    }
    const res = json(partnerInquiryTemplates[idx]);
    await throwIfResNotOk(res);
    return res;
  }

  if (method === "DELETE" && templatePatchMatch) {
    const id = Number(templatePatchMatch[1]);
    partnerInquiryTemplates = partnerInquiryTemplates.filter((t) => t.id !== id);
    const res = json({ success: true });
    await throwIfResNotOk(res);
    return res;
  }

  // --- QR-Scanner check-in (partner-scanner.tsx) ---
  const checkInMatch = url.match(/^\/api\/partner\/check-in\/(\d+)$/);
  if (method === "POST" && checkInMatch) {
    const id = Number(checkInMatch[1]);
    const booking = scannerBookings.find((b) => b.id === id);
    if (!booking) {
      const res = json({ message: "Buchung nicht gefunden" }, 404);
      await throwIfResNotOk(res);
      return res;
    }
    booking.checkedIn = true;
    booking.checkedInAt = new Date().toISOString();
    const res = json(booking);
    await throwIfResNotOk(res);
    return res;
  }

  // Any other write (e.g. booking status updates) - simulate success locally,
  // no real state machine needed for a read-mostly demo dashboard.
  const res = json({ ok: true });
  await throwIfResNotOk(res);
  return res;
}

/**
 * Synchronous local lookup backing the inquiry detail sheet's queryFn -
 * mirrors the real GET /api/partner/inquiries/:id (inquiry + its replies).
 */
export function getPartnerInquiryById(id: number) {
  const inquiry = partnerInquiries.find((i) => i.id === id);
  if (!inquiry) throw new Error("Anfrage nicht gefunden");
  return { ...inquiry, replies: inquiry.replies };
}

type UnauthorizedBehavior = "returnNull" | "throw";

/**
 * Mocked replacement for the real getQueryFn. Resolves every GET queryKey
 * against the mock data above instead of fetching from a server.
 */
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401 }) =>
  async ({ queryKey, signal }) => {
    if (!apiConfig.useMockApi) {
      return apiClient.request<any>(queryKey[0] as string, { signal });
    }

    await delay(250);
    const url = queryKey[0] as string;

    if (url === "/api/partner/profile") return demoPartnerProfile as any;
    if (url === "/api/partner/stats") return demoPartnerStats as any;
    if (url === "/api/partner/bookings") return demoBookings as any;
    if (url === "/api/partner/experiences") return demoExperiences as any;
    if (url === "/api/partner/settlements") return demoSettlements as any;
    if (url === "/api/partner/commission-invoices") return demoCommissionInvoices as any;
    if (url === "/api/partner/resources") return demoPartnerResources as any;
    if (url === "/api/partner/group-activities") return partnerGroupActivities as any;

    // --- Group activity detail (partner-group-activity-detail.tsx) ---
    const groupActivityMatch = url.match(/^\/api\/partner\/group-activities\/(\d+)$/);
    if (groupActivityMatch) {
      const activity = partnerGroupActivities.find((a) => a.id === Number(groupActivityMatch[1]));
      if (!activity) throw new Error("404: Gruppe nicht gefunden");
      return activity as any;
    }

    if (url === "/api/categories") return demoCategories as any;

    if (url === "/api/partner/inquiries") {
      // queryKey: ["/api/partner/inquiries", filterType, filterStatus]
      const filterType = queryKey[1] as string | undefined;
      const filterStatus = queryKey[2] as string | undefined;
      const filtered = partnerInquiries.filter((i) => {
        if (filterType && filterType !== "all" && i.type !== filterType) return false;
        if (filterStatus && filterStatus !== "all" && i.status !== filterStatus) return false;
        return true;
      });
      return filtered.map(({ replies, ...rest }) => rest) as any;
    }
    if (url === "/api/partner/inquiries/stats") return computeInquiryStats(partnerInquiries) as any;
    if (url === "/api/partner/inquiry-templates") return partnerInquiryTemplates as any;

    // --- QR-Scanner validate-booking (partner-scanner.tsx) ---
    if (url.startsWith("/api/partner/validate-booking/")) {
      const code = url.slice("/api/partner/validate-booking/".length);
      const booking = scannerBookings.find((b) => b.bookingReference === code);
      if (!booking) {
        return {
          valid: false,
          error: "Diese Buchung existiert nicht oder gehört nicht zu Ihrem Unternehmen.",
        } as any;
      }
      return {
        valid: true,
        booking: {
          id: booking.id,
          bookingReference: booking.bookingReference,
          contactName: booking.customerName,
          contactEmail: booking.customerEmail,
          experienceTitle: booking.experienceTitle,
          experienceId: booking.experienceId,
          date: booking.bookingDate,
          participants: booking.numberOfPeople,
          totalPrice: booking.totalPrice,
          status: booking.status,
          checkedIn: booking.checkedIn,
          checkedInAt: booking.checkedInAt,
        },
      } as any;
    }

    // --- Home screen browse/discovery ---
    if (url === "/api/experiences?featured=true") return demoFeaturedExperiences as any;
    if (url === "/api/partners") return demoPartners as any;
    if (url === "/api/cities") return demoCities as any;
    if (url === "/api/bundles") return demoBundles as any;

    // --- Public shop page ("Shop ansehen" -> /partners/:id, partner-shop.tsx) ---
    const shopPartnerMatch = url.match(/^\/api\/partners\/(\d+)$/);
    if (shopPartnerMatch) {
      const partnerId = Number(shopPartnerMatch[1]);
      return (demoShopPartners.find((p) => p.id === partnerId) ?? null) as any;
    }
    if (url === "/api/experiences") return demoShopExperiences as any;

    // Unknown endpoint in demo mode - return an empty-ish shape rather than
    // throwing, so pages that request something not yet mocked degrade
    // gracefully instead of crashing the whole page.
    return (Array.isArray([]) ? [] : null) as any;
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
