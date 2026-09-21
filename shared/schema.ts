/**
 * Plain TypeScript mirror of the source project's Drizzle schema
 * (freizeitengel-source/shared/schema.ts), trimmed to the tables the Admin
 * Panel actually imports. No Drizzle/DB dependency here on purpose — this
 * project has no database. Field names/types match the source schema's
 * `pgTable` definitions exactly (via `$inferSelect`) so the copied admin
 * page components compile and render unchanged against mock data shaped
 * the same way the real API would shape it.
 *
 * When the real backend is connected later, this file can be deleted and
 * replaced with the real `@shared/schema` import — see README.md.
 */

export type Role = "user" | "partner" | "admin";

export interface User {
  id: number;
  username: string;
  password: string;
  email: string;
  fullName: string;
  profileImage: string | null;
  role: string;
  createdAt: Date | string | null;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  imageUrl: string | null;
  bookingArchetype: string | null;
  defaultDurationMin: number | null;
  requiresEquipment: boolean | null;
  maxGroupSize: number | null;
  priceModel: string | null;
}

export interface Experience {
  id: number;
  title: string;
  description: string;
  shortDescription: string;
  location: string;
  city: string;
  postalCode: string;
  country: string;
  price: number;
  imageUrl: string | null;
  categoryId: number;
  partnerId: number;
  partnerName?: string;
  rating: number | null;
  reviewCount: number | null;
  createdAt: Date | string | null;
  featured: boolean;
  trending: boolean;
  recommended: boolean;
  active: boolean;
  duration: string | null;
  maxParticipants: string | null;
  specialNotes: string | null;
  partnerContact: unknown;
  instantBooking: boolean | null;
  requiresApproval: boolean | null;
  bookingConfig: unknown;
}

export interface Partner {
  id: number;
  userId: number;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string | null;
  address: string | null;
  postalCode: string | null;
  city: string | null;
  location: string;
  country: string | null;
  category: string | null;
  description: string;
  website: string | null;
  foundedYear: number | null;
  status: string | null;
  approved: boolean;
  openingHours: string | null;
  latitude: number | null;
  longitude: number | null;
  logoUrl: string | null;
  logoBgColor: string | null;
  tourUrl: string | null;
  isLive: boolean | null;
  bookingSystem: string | null;
  rollerClientId: string | null;
  rollerClientSecret: string | null;
  rollerVenueId: string | null;
  rollerEnvironment: string | null;
  regiondoApiKey: string | null;
  regiondoSecretKey: string | null;
  regiondoSupplierId: string | null;
  regiondoEnvironment: string | null;
  eversportApiToken: string | null;
  eversportVenueId: string | null;
  eversportEnvironment: string | null;
  pretixApiToken: string | null;
  pretixOrganizerSlug: string | null;
  pretixEventSlug: string | null;
  pretixEnvironment: string | null;
  planyoApiKey: string | null;
  planyoHashKey: string | null;
  planyoSiteId: string | null;
  planyoEnvironment: string | null;
  createdAt: Date | string;
}

export interface Booking {
  id: number;
  bookingReference: string | null;
  userId: number | null;
  experienceId: number;
  slotId: number | null;
  resourceId: number | null;
  date: Date | string;
  startTime: Date | string | null;
  endTime: Date | string | null;
  participants: number;
  adultsCount: number | null;
  childrenCount: number | null;
  unitPrice: number | null;
  totalPrice: number;
  discountAmount: number | null;
  discountReason: string | null;
  status: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string | null;
  message: string | null;
  specialRequests: string | null;
  paymentMethod: string;
  paymentStatus: string;
  paymentId: string | null;
  stripePaymentIntentId: string | null;
  stripeChargeId: string | null;
  stripeTransferId: string | null;
  isGuestBooking: boolean;
  qrCode: string | null;
  bookingDetails: unknown;
  createdAt: Date | string;
  confirmedAt: Date | string | null;
  cancelledAt: Date | string | null;
}

export interface ChatChannel {
  id: number;
  name: string;
  description: string | null;
  type: string;
  createdBy: number | null;
  createdAt: Date | string | null;
}

export interface ChatMessage {
  id: number;
  channelId: number;
  senderId: number;
  content: string;
  type: string;
  replyToId: number | null;
  isEdited: boolean | null;
  createdAt: Date | string | null;
}

export interface ChatMeeting {
  id: number;
  title: string;
  description: string | null;
  channelId: number | null;
  organizerId: number;
  startTime: Date | string;
  endTime: Date | string;
  location: string | null;
  meetingUrl: string | null;
  status: string;
  createdAt: Date | string | null;
}

export interface ProjectBoard {
  id: number;
  name: string;
  description: string | null;
  createdBy: number;
  createdAt: Date | string | null;
}

export interface ProjectColumn {
  id: number;
  boardId: number;
  name: string;
  color: string | null;
  position: number;
}

export interface ProjectTask {
  id: number;
  boardId: number;
  columnId: number;
  title: string;
  description: string | null;
  priority: string;
  assigneeId: number | null;
  dueDate: Date | string | null;
  labels: string[] | null;
  position: number;
  createdBy: number;
  createdAt: Date | string | null;
  updatedAt: Date | string | null;
}

export interface ProjectTaskComment {
  id: number;
  taskId: number;
  userId: number;
  content: string;
  createdAt: Date | string | null;
}

export interface KbCategory {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  displayOrder: number | null;
  createdAt: Date | string | null;
}

export interface KbArticle {
  id: number;
  categoryId: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  tags: string[] | null;
  published: boolean | null;
  views: number | null;
  createdAt: Date | string | null;
  updatedAt: Date | string | null;
}

export interface PaymentAccount {
  id: number;
  partnerId: number;
  stripeAccountId: string | null;
  accountStatus: string;
  onboardingComplete: boolean | null;
  payoutsEnabled: boolean | null;
  chargesEnabled: boolean | null;
  defaultCurrency: string | null;
  commissionRate: number | null;
  businessType: string | null;
  companyName: string | null;
  email: string | null;
  country: string | null;
  bankAccountLast4: string | null;
  bankName: string | null;
  totalEarnings: number | null;
  totalPayouts: number | null;
  pendingBalance: number | null;
  createdAt: Date | string | null;
  updatedAt: Date | string | null;
}

export interface PaymentTransaction {
  id: number;
  transactionRef: string;
  bookingId: number | null;
  partnerId: number;
  customerId: number | null;
  customerEmail: string | null;
  customerName: string | null;
  type: string;
  status: string;
  grossAmount: number;
  platformFee: number;
  partnerAmount: number;
  commissionRate: number;
  currency: string | null;
  paymentMethod: string | null;
  stripePaymentIntentId: string | null;
  stripeTransferId: string | null;
  description: string | null;
  metadata: unknown;
  failureReason: string | null;
  refundedAmount: number | null;
  paidAt: Date | string | null;
  createdAt: Date | string | null;
  updatedAt: Date | string | null;
}

export interface PaymentPayout {
  id: number;
  payoutRef: string;
  partnerId: number;
  paymentAccountId: number;
  amount: number;
  currency: string | null;
  status: string;
  stripePayoutId: string | null;
  periodStart: Date | string | null;
  periodEnd: Date | string | null;
  transactionCount: number | null;
  bankAccountLast4: string | null;
  failureReason: string | null;
  processedAt: Date | string | null;
  createdAt: Date | string | null;
}

export interface DmFolder {
  id: number;
  name: string;
  parentId: number | null;
  color: string | null;
  icon: string | null;
  createdBy: string | null;
  createdAt: Date | string | null;
  updatedAt: Date | string | null;
}

export interface DmFile {
  id: number;
  name: string;
  folderId: number | null;
  mimeType: string;
  size: number;
  data: string;
  tags: string[] | null;
  starred: boolean | null;
  description: string | null;
  uploadedBy: string | null;
  createdAt: Date | string | null;
  updatedAt: Date | string | null;
}

export interface HrDepartment {
  id: number;
  name: string;
  description: string | null;
  color: string | null;
  headOfDepartment: string | null;
  createdAt: Date | string | null;
}

export interface HrEmployee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  position: string;
  departmentId: number | null;
  employmentType: string | null;
  status: string | null;
  startDate: string | null;
  salary: number | null;
  weeklyHours: number | null;
  vacationDays: number | null;
  usedVacationDays: number | null;
  profileImage: string | null;
  address: string | null;
  city: string | null;
  zipCode: string | null;
  emergencyContact: string | null;
  emergencyPhone: string | null;
  notes: string | null;
  createdAt: Date | string | null;
  updatedAt: Date | string | null;
}

export interface HrAbsence {
  id: number;
  employeeId: number;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  status: string | null;
  reason: string | null;
  approvedBy: string | null;
  createdAt: Date | string | null;
}

export interface Meeting {
  id: number;
  title: string;
  description: string | null;
  date: string;
  startTime: string;
  endTime: string | null;
  duration: number | null;
  type: string | null;
  status: string | null;
  roomId: string;
  meetingUrl: string | null;
  organizer: string | null;
  participants: string[] | null;
  notes: string | null;
  recurring: string | null;
  color: string | null;
  createdAt: Date | string | null;
}

export interface PartnerOnboarding {
  id: number;
  partnerId: number;
  stepRegistration: boolean | null;
  stepRegistrationDate: Date | string | null;
  stepRegistrationNotes: string | null;
  stepContract: boolean | null;
  stepContractDate: Date | string | null;
  stepContractNotes: string | null;
  stepStripe: boolean | null;
  stepStripeDate: Date | string | null;
  stepStripeNotes: string | null;
  stepExperiences: boolean | null;
  stepExperiencesDate: Date | string | null;
  stepExperiencesNotes: string | null;
  stepBranding: boolean | null;
  stepBrandingDate: Date | string | null;
  stepBrandingNotes: string | null;
  stepMarketing: boolean | null;
  stepMarketingDate: Date | string | null;
  stepMarketingNotes: string | null;
  stepTesting: boolean | null;
  stepTestingDate: Date | string | null;
  stepTestingNotes: string | null;
  stepGoLive: boolean | null;
  stepGoLiveDate: Date | string | null;
  stepGoLiveNotes: string | null;
  overallStatus: string | null;
  assignedTo: string | null;
  priority: string | null;
  createdAt: Date | string | null;
  updatedAt: Date | string | null;
}

export interface SupportConversation {
  id: number;
  sessionId: string;
  userId: number | null;
  visitorName: string | null;
  visitorEmail: string | null;
  status: string;
  category: string | null;
  summary: string | null;
  satisfaction: number | null;
  createdAt: Date | string | null;
  updatedAt: Date | string | null;
}

export interface SupportMessage {
  id: number;
  conversationId: number;
  role: string;
  content: string;
  metadata: unknown;
  createdAt: Date | string | null;
}

/** Zod schema stand-ins — the real project uses `drizzle-zod` to derive
 * these from the DB table definitions. Kept as plain zod objects here
 * (same shape/validation behavior) purely so `zodResolver(insertXSchema)`
 * calls in the copied page components keep working unchanged. */
import { z } from "zod";

export const insertUserSchema = z.object({
  username: z.string(),
  password: z.string(),
  email: z.string(),
  fullName: z.string(),
});

export const insertPartnerSchema = z.object({
  companyName: z.string().min(1, { message: "Firmenname wird benötigt" }),
  category: z.string().min(1, { message: "Kategorie wird benötigt" }),
  city: z.string().min(1, { message: "Stadt wird benötigt" }),
  location: z.string().min(1, { message: "Adresse wird benötigt" }),
  website: z.string().optional().or(z.literal("")),
  contactPerson: z.string().min(1, { message: "Ansprechpartner wird benötigt" }),
  email: z.string().email({ message: "Ungültige E-Mail-Adresse" }),
  phone: z.string().optional().or(z.literal("")),
  description: z.string().min(1, { message: "Beschreibung wird benötigt" }),
});

export const insertExperienceSchema = z.object({
  title: z.string(),
  description: z.string(),
  shortDescription: z.string(),
  location: z.string(),
  city: z.string(),
  postalCode: z.string(),
  country: z.string().default("Deutschland"),
  price: z.number(),
  imageUrl: z.string().optional(),
  categoryId: z.number(),
  partnerId: z.number(),
  featured: z.boolean().optional(),
  trending: z.boolean().optional(),
  recommended: z.boolean().optional(),
  active: z.boolean().optional(),
  duration: z.string().optional(),
  maxParticipants: z.string().optional(),
  specialNotes: z.string().optional(),
  instantBooking: z.boolean().optional(),
  requiresApproval: z.boolean().optional(),
});
