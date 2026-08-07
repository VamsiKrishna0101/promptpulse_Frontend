import { api } from "./api"

// ─── Types ────────────────────────────────────────────────────────────────────

export type WhatsAppQualityRating = "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN"
export type WhatsAppCampaignStatus = "DRAFT" | "SCHEDULED" | "RUNNING" | "COMPLETED" | "PAUSED" | "FAILED"
export type WhatsAppTemplateStatus = "APPROVED" | "PENDING" | "REJECTED" | "PAUSED" | "DISABLED"
export type WhatsAppTemplateCategory = "MARKETING" | "UTILITY" | "AUTHENTICATION"
export type WhatsAppRecipientStatus = "QUEUED" | "SENT" | "DELIVERED" | "READ" | "FAILED"

export interface WhatsAppAccount {
    id: string
    project_id: string
    waba_id: string
    phone_number_id: string
    display_phone: string
    display_name: string
    access_token: string
    quality_rating: WhatsAppQualityRating
    messaging_limit: number
    profile_pic_url?: string | null
    about?: string | null
    business_category?: string | null
    business_description?: string | null
    website?: string | null
    address?: string | null
    is_green_badge: boolean
    created_at: string
    updated_at: string
}

export interface WhatsAppHealthCheck {
    status: "healthy" | "degraded" | "unhealthy"
    checkedAt: string
    durationMs: number
    credentials: { status: "healthy" | "unhealthy"; message: string }
    phone: { status: "healthy" | "unhealthy"; displayPhone?: string; verifiedName?: string; qualityRating?: string; message?: string }
    profile: { status: "healthy" | "unhealthy"; message: string }
    webhook: { status: "healthy" | "unhealthy"; configured: boolean; url: string | null; message?: string }
}

export interface WhatsAppTemplateComponent {
    type: "HEADER" | "BODY" | "FOOTER" | "BUTTONS"
    format?: "TEXT" | "IMAGE" | "VIDEO" | "DOCUMENT"
    text?: string
    buttons?: Array<{
        type: "QUICK_REPLY" | "URL" | "PHONE_NUMBER"
        text: string
        url?: string
        phone_number?: string
    }>
}

export interface WhatsAppTemplate {
    id: string
    account_id: string
    meta_id?: string | null
    name: string
    language: string
    category: WhatsAppTemplateCategory
    status: WhatsAppTemplateStatus
    components: WhatsAppTemplateComponent[]
    created_at: string
    updated_at: string
}

export interface WhatsAppCampaign {
    id: string
    account_id: string
    user_id: string
    name: string
    objective?: string | null
    status: WhatsAppCampaignStatus
    template_id?: string | null
    header_media_url?: string | null
    header_media_type?: string | null
    variable_mapping?: Record<string, string> | null
    total_recipients: number
    sent_count: number
    delivered_count: number
    read_count: number
    failed_count: number
    estimated_cost_inr?: string | null
    pace_per_second: number
    scheduled_at?: string | null
    started_at?: string | null
    completed_at?: string | null
    error_message?: string | null
    created_at: string
    updated_at: string
    template?: Pick<WhatsAppTemplate, "name" | "category" | "language"> | null
}

export interface WhatsAppRecipient {
    id: string
    campaign_id: string
    phone: string
    name?: string | null
    variables?: Record<string, string> | null
    status: WhatsAppRecipientStatus
    meta_msg_id?: string | null
    error_code?: string | null
    error_msg?: string | null
    sent_at?: string | null
    delivered_at?: string | null
    read_at?: string | null
    created_at: string
}

export interface CostEstimate {
    recipients: number
    category: WhatsAppTemplateCategory
    ratePerMsg: number
    subtotal: number
    gstAmount: number
    totalInr: number
}

export interface ParsedContact {
    name: string
    phone: string
    rawPhone: string
    valid: boolean
    extra: Record<string, string>
}

// ─── Account API ──────────────────────────────────────────────────────────────

export async function getWhatsAppAccount(projectId: string): Promise<WhatsAppAccount | null> {
    try {
        const { data } = await api.get<WhatsAppAccount>("/campaigns/whatsapp/account", {
            params: { project_id: projectId },
        })
        return data
    } catch (err: any) {
        if (err?.response?.status === 404) return null
        throw err
    }
}

export async function connectWhatsAppAccount(payload: {
    project_id: string
    wabaId: string
    phoneNumberId: string
    displayPhone: string
    displayName: string
    accessToken: string
}): Promise<WhatsAppAccount> {
    const { data } = await api.post<WhatsAppAccount>("/campaigns/whatsapp/account", payload)
    return data
}

export async function connectWhatsAppTestAccount(projectId: string): Promise<WhatsAppAccount> {
    const { data } = await api.post<WhatsAppAccount>("/campaigns/whatsapp/account/test", { project_id: projectId })
    return data
}

export async function updateWhatsAppAccountProfile(
    accountId: string,
    payload: Partial<{
        about: string
        businessCategory: string
        businessDescription: string
        website: string
        address: string
    }>,
): Promise<WhatsAppAccount> {
    const { data } = await api.patch<WhatsAppAccount>(
        `/campaigns/whatsapp/account/${accountId}`,
        payload,
    )
    return data
}

export async function uploadWhatsAppProfilePic(
    accountId: string,
    file: File,
): Promise<{ success: boolean; handle: string }> {
    const base64 = await fileToBase64(file)
    const { data } = await api.post(`/campaigns/whatsapp/account/${accountId}/upload-profile-pic`, {
        fileBase64: base64,
        fileName: file.name,
        fileType: file.type,
    })
    return data
}

export async function syncWhatsAppAccount(accountId: string): Promise<WhatsAppAccount> {
    const { data } = await api.post<WhatsAppAccount>(
        `/campaigns/whatsapp/account/${accountId}/sync`,
    )
    return data
}

export async function checkWhatsAppHealth(accountId: string): Promise<WhatsAppHealthCheck> {
    const { data } = await api.get<WhatsAppHealthCheck>(
        `/campaigns/whatsapp/account/${accountId}/health`,
    )
    return data
}

export async function disconnectWhatsAppAccount(accountId: string): Promise<void> {
    await api.delete(`/campaigns/whatsapp/account/${accountId}`)
}

// ─── Templates API ────────────────────────────────────────────────────────────

export async function listWhatsAppTemplates(accountId: string): Promise<WhatsAppTemplate[]> {
    const { data } = await api.get<WhatsAppTemplate[]>("/campaigns/whatsapp/templates", {
        params: { account_id: accountId },
    })
    return data
}

export async function syncWhatsAppTemplates(accountId: string): Promise<WhatsAppTemplate[]> {
    const { data } = await api.post<WhatsAppTemplate[]>("/campaigns/whatsapp/templates/sync", {
        account_id: accountId,
    })
    return data
}

export async function createWhatsAppTemplate(payload: {
    accountId: string
    name: string
    language: string
    category: WhatsAppTemplateCategory
    components: WhatsAppTemplateComponent[]
}): Promise<WhatsAppTemplate> {
    const { data } = await api.post<WhatsAppTemplate>("/campaigns/whatsapp/templates", payload)
    return data
}

// ─── Campaigns API ────────────────────────────────────────────────────────────

export async function listWhatsAppCampaigns(accountId: string): Promise<WhatsAppCampaign[]> {
    const { data } = await api.get<WhatsAppCampaign[]>("/campaigns/whatsapp", {
        params: { account_id: accountId },
    })
    return data
}

export async function getWhatsAppCampaign(campaignId: string): Promise<WhatsAppCampaign> {
    const { data } = await api.get<WhatsAppCampaign>(`/campaigns/whatsapp/${campaignId}`)
    return data
}

export interface CreateCampaignPayload {
    accountId: string
    name: string
    objective?: string
    templateId?: string
    headerMediaUrl?: string
    headerMediaType?: string
    variableMapping?: Record<string, string>
    scheduledAt?: string
    pacePerSecond?: number
    recipients: Array<{ phone: string; name?: string; variables?: Record<string, string> }>
}

export async function createWhatsAppCampaign(
    payload: CreateCampaignPayload,
): Promise<WhatsAppCampaign> {
    const { data } = await api.post<WhatsAppCampaign>("/campaigns/whatsapp", payload)
    return data
}

export async function launchWhatsAppCampaign(
    campaignId: string,
): Promise<{ success: boolean; status: string }> {
    const { data } = await api.post(`/campaigns/whatsapp/${campaignId}/launch`)
    return data
}

export async function pauseWhatsAppCampaign(campaignId: string): Promise<WhatsAppCampaign> {
    const { data } = await api.patch<WhatsAppCampaign>(`/campaigns/whatsapp/${campaignId}/pause`)
    return data
}

export async function deleteWhatsAppCampaign(campaignId: string): Promise<void> {
    await api.delete(`/campaigns/whatsapp/${campaignId}`)
}

export async function listCampaignRecipients(
    campaignId: string,
    page = 1,
    limit = 50,
): Promise<{ total: number; page: number; limit: number; recipients: WhatsAppRecipient[] }> {
    const { data } = await api.get(`/campaigns/whatsapp/${campaignId}/recipients`, {
        params: { page, limit },
    })
    return data
}

export async function getCampaignCostEstimate(
    recipients: number,
    category: WhatsAppTemplateCategory,
): Promise<CostEstimate> {
    const { data } = await api.post<CostEstimate>("/campaigns/whatsapp/cost-estimate", {
        recipients,
        category,
    })
    return data
}

// ─── Client-side cost calculator (no API call needed) ─────────────────────────

const RATES: Record<WhatsAppTemplateCategory, number> = {
    MARKETING: 0.87,
    UTILITY: 0.12,
    AUTHENTICATION: 0.12,
}
const GST = 0.18

export function calcCostLocally(
    recipients: number,
    category: WhatsAppTemplateCategory,
): CostEstimate {
    const ratePerMsg = RATES[category]
    const subtotal = Math.round(recipients * ratePerMsg * 100) / 100
    const gstAmount = Math.round(subtotal * GST * 100) / 100
    const totalInr = Math.round((subtotal + gstAmount) * 100) / 100
    return { recipients, category, ratePerMsg, subtotal, gstAmount, totalInr }
}

// ─── Indian phone validation ──────────────────────────────────────────────────

export function normalizeIndianPhone(raw: string): { phone: string; valid: boolean } {
    const digits = raw.replace(/\D/g, "")
    if (digits.length === 10 && /^[6-9]/.test(digits)) {
        return { phone: `+91${digits}`, valid: true }
    }
    if (digits.length === 12 && digits.startsWith("91") && /^91[6-9]/.test(digits)) {
        return { phone: `+${digits}`, valid: true }
    }
    if (digits.length === 13 && digits.startsWith("091") && /^091[6-9]/.test(digits)) {
        return { phone: `+91${digits.slice(3)}`, valid: true }
    }
    return { phone: raw, valid: false }
}

export function parseCSVContacts(csvText: string): Array<{
    name: string
    phone: string
    rawPhone: string
    valid: boolean
    extra: Record<string, string>
}> {
    const lines = csvText.trim().split("\n")
    if (lines.length < 2) return []

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/^"|"$/g, ""))
    const nameIdx = headers.findIndex((h) => h === "name" || h === "full_name" || h === "customer_name")
    const phoneIdx = headers.findIndex((h) => h === "phone" || h === "mobile" || h === "number" || h === "phone_number")

    if (phoneIdx === -1) return []

    return lines.slice(1).map((line) => {
        const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""))
        const rawPhone = cols[phoneIdx] ?? ""
        const { phone, valid } = normalizeIndianPhone(rawPhone)
        const extra: Record<string, string> = {}
        headers.forEach((h, i) => {
            if (i !== nameIdx && i !== phoneIdx && cols[i]) {
                extra[h] = cols[i]
            }
        })
        return {
            name: nameIdx >= 0 ? (cols[nameIdx] ?? "") : "",
            phone,
            rawPhone,
            valid,
            extra,
        }
    }).filter((c) => c.rawPhone.trim() !== "")
}

// ─── Bot & Dynamic Services Catalog & Leads Types ────────────────────────────

export interface DoctorSpecialist {
    id: string
    name: string
    title: string
    timing: string
    fee?: string
}

export interface DepartmentService {
    id: string
    name: string
    desc?: string
    fee?: string
    timing?: string
    doctors?: DoctorSpecialist[]
}

export interface FAQItem {
    question: string
    answer: string
    category?: string
}

export interface WhatsAppBotConfig {
    id: string
    account_id: string
    is_enabled: boolean
    business_name: string
    business_type: string
    greeting_message: string
    services_catalog: DepartmentService[]
    faq_knowledge_base: FAQItem[]
    required_fields: string[]
    escalation_phones: string[]
    escalation_message?: string | null
    confirmation_message?: string | null
    ai_fallback_enabled: boolean
    created_at?: string
    updated_at?: string
}

export type LeadStatus = "PENDING_CALL" | "CALLED" | "APPOINTMENT_CONFIRMED" | "NOT_INTERESTED" | "CANCELLED"

export interface WhatsAppAppointmentLead {
    id: string
    account_id: string
    patient_name: string
    patient_phone: string
    service_requested: string
    doctor_requested?: string | null
    preferred_time?: string | null
    symptoms?: string | null
    status: LeadStatus
    escalated_to_phone?: string | null
    staff_notes?: string | null
    created_at: string
    updated_at: string
}

// ─── Bot & Lead API Methods ──────────────────────────────────────────────────

export async function fetchBotConfig(projectId: string): Promise<WhatsAppBotConfig> {
    const { data } = await api.get<{ config: WhatsAppBotConfig }>(
        "/api/campaigns/whatsapp/bot-config",
        { params: { project_id: projectId } },
    )
    return data.config
}

export async function updateBotConfig(
    projectId: string,
    config: Partial<WhatsAppBotConfig>,
): Promise<WhatsAppBotConfig> {
    const { data } = await api.put<{ success: boolean; config: WhatsAppBotConfig }>(
        "/api/campaigns/whatsapp/bot-config",
        { project_id: projectId, ...config },
    )
    return data.config
}

export async function fetchLeads(
    projectId: string,
    status?: string,
): Promise<WhatsAppAppointmentLead[]> {
    const { data } = await api.get<{ leads: WhatsAppAppointmentLead[] }>(
        "/api/campaigns/whatsapp/leads",
        { params: { project_id: projectId, status: status || undefined } },
    )
    return data.leads
}

export async function updateLead(
    leadId: string,
    projectId: string,
    payload: { status?: LeadStatus; staff_notes?: string },
): Promise<void> {
    await api.patch(`/api/campaigns/whatsapp/leads/${leadId}`, {
        project_id: projectId,
        ...payload,
    })
}

export async function deleteLead(leadId: string, projectId: string): Promise<void> {
    await api.delete(`/api/campaigns/whatsapp/leads/${leadId}`, {
        params: { project_id: projectId },
    })
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
            const result = reader.result as string
            resolve(result.split(",")[1]) // strip data URL prefix
        }
        reader.onerror = reject
        reader.readAsDataURL(file)
    })
}
