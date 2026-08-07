import axios from "axios"
import { api } from "./api"
import { VOICE_AI_API_BASE_URL } from "@/config/baseUrls"

const voiceApi = axios.create({
    baseURL: VOICE_AI_API_BASE_URL,
    headers: { "Content-Type": "application/json" },
})

voiceApi.interceptors.request.use((config) => {
    const token = localStorage.getItem("promptpulse_access_token")
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

export type VoicePlaybookType =
    | "OPD_APPOINTMENT_CONFIRMATION"
    | "POST_DISCHARGE_CARE"
    | "LAB_REPORT_ALERT"
    | "PREVENTIVE_HEALTH_CAMP"
    | "CUSTOM_OUTREACH"

export type VoiceCallStatus =
    | "QUEUED"
    | "RINGING"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "BUSY"
    | "NO_ANSWER"
    | "FAILED"

export type VoiceOutcomeIntent =
    | "CONFIRMED"
    | "RESCHEDULED"
    | "CANCELLED"
    | "URGENT_EMERGENCY_ESCALATION"
    | "CALLBACK_REQUESTED"
    | "NOT_INTERESTED"
    | "UNKNOWN"

export interface TranscriptTurn {
    sender: "ai" | "user" | "system"
    text: string
    timestamp: string
    intent?: VoiceOutcomeIntent
}

export interface VoiceAgentConfig {
    id: string
    account_id: string
    name: string
    playbook_type: VoicePlaybookType
    language: string
    voice_name: string
    system_prompt: string
    emergency_keywords: string[]
    live_transfer_number?: string | null
    created_at: string
    updated_at: string
}

export interface VoiceAccount {
    id: string
    project_id: string
    user_id: string
    provider: string
    caller_id: string
    azure_region?: string | null
    is_verified: boolean
    created_at: string
    updated_at: string
    agents?: VoiceAgentConfig[]
}

export interface VoiceCampaign {
    id: string
    account_id: string
    agent_id: string
    name: string
    playbook_type: VoicePlaybookType
    status: "DRAFT" | "QUEUED" | "IN_PROGRESS" | "PAUSED_TIME_WINDOW" | "COMPLETED" | "PAUSED"
    total_recipients: number
    called_count: number
    confirmed_count: number
    rescheduled_count: number
    cancelled_count: number
    urgent_count: number
    failed_count: number
    concurrent_limit: number
    scheduled_at?: string | null
    started_at?: string | null
    completed_at?: string | null
    created_at: string
    updated_at: string
    agent?: VoiceAgentConfig
}

export interface VoiceCallRecord {
    id: string
    campaign_id: string
    patient_name: string
    patient_phone: string
    doctor_name?: string | null
    scheduled_slot?: string | null
    status: VoiceCallStatus
    outcome_intent: VoiceOutcomeIntent
    duration_seconds: number
    ai_summary?: string | null
    transcript?: TranscriptTurn[] | null
    recording_url?: string | null
    is_urgent: boolean
    created_at: string
    updated_at: string
}

export interface VoicePlaybookDefinition {
    id: VoicePlaybookType
    name: string
    badge: string
    category: "Healthcare" | "General Business"
    description: string
    objective: string
    defaultLanguage: string
    defaultVoice: string
    systemPrompt: string
    sampleDialogueTelugu: string
    sampleDialogueEnglish: string
    emergencyTriggers: string[]
    recommendedSlots: string[]
}

export interface VoiceTimeStatus {
    allowed: boolean
    currentIST: string
    message?: string
}

export interface ParsedVoiceRecipient {
    name: string
    phone: string
    doctor_name?: string
    scheduled_slot?: string
    notes?: string
}

// ─── API Methods ─────────────────────────────────────────────────────────────

export async function getVoiceAccount(projectId: string): Promise<{ account: VoiceAccount; timeStatus: VoiceTimeStatus }> {
    const res = await api.get(`/campaigns/voice/account?project_id=${projectId}`)
    return res.data
}

export async function getVoicePlaybooks(): Promise<VoicePlaybookDefinition[]> {
    const res = await api.get("/campaigns/voice/playbooks")
    return res.data
}

export async function updateVoiceAgent(data: Partial<VoiceAgentConfig> & { agentId: string }): Promise<VoiceAgentConfig> {
    const res = await api.put("/campaigns/voice/agent", data)
    return res.data
}

export async function synthesizeVoicePreview(text: string, voiceName = "te-IN-ShrutiNeural"): Promise<Blob> {
    const res = await api.post(
        "/campaigns/voice/synthesize-preview",
        { text, voiceName },
        { responseType: "blob" }
    )
    return res.data
}

export async function parseVoiceCsv(csvText: string): Promise<{ count: number; recipients: ParsedVoiceRecipient[] }> {
    const res = await api.post("/campaigns/voice/parse-csv", { csvText })
    return res.data
}

export async function createVoiceCampaign(data: {
    accountId: string
    agentId: string
    name: string
    playbookType: VoicePlaybookType
    recipients: ParsedVoiceRecipient[]
    concurrentLimit?: number
    autoLaunch?: boolean
}): Promise<VoiceCampaign> {
    const res = await api.post("/campaigns/voice/campaigns", data)
    return res.data
}

export async function listVoiceCampaigns(projectId: string): Promise<VoiceCampaign[]> {
    const res = await api.get(`/campaigns/voice/campaigns?project_id=${projectId}`)
    return res.data
}

export async function getVoiceCampaign(id: string): Promise<{ campaign: VoiceCampaign; timeStatus: VoiceTimeStatus }> {
    const res = await api.get(`/campaigns/voice/campaigns/${id}`)
    return res.data
}

export async function listVoiceCallRecords(campaignId: string, filters?: { status?: string; intent?: string }): Promise<VoiceCallRecord[]> {
    const params = new URLSearchParams()
    if (filters?.status) params.append("status", filters.status)
    if (filters?.intent) params.append("intent", filters.intent)
    const res = await api.get(`/campaigns/voice/campaigns/${campaignId}/records?${params.toString()}`)
    return res.data
}

export async function launchVoiceCampaign(id: string): Promise<VoiceCampaign> {
    const res = await api.post(`/campaigns/voice/campaigns/${id}/launch`)
    return res.data
}

export async function processVoiceBatch(id: string): Promise<VoiceCampaign> {
    const res = await api.post(`/campaigns/voice/campaigns/${id}/process-batch`)
    return res.data
}

export async function createPrimaryVoiceCampaign(data: {
    name: string
    playbookType: VoicePlaybookType
    recipients: ParsedVoiceRecipient[]
    concurrentLimit?: number
}): Promise<VoiceCampaign> {
    const recipients = data.recipients.map((recipient) => ({
        patient_name: recipient.name,
        patient_phone: recipient.phone,
        doctor_name: recipient.doctor_name,
        scheduled_slot: recipient.scheduled_slot,
        notes: recipient.notes,
    }))
    const res = await voiceApi.post("/campaigns", { ...data, recipients, autoLaunch: false })
    return res.data
}

export async function launchPrimaryVoiceCampaign(id: string): Promise<VoiceCampaign> {
    const res = await voiceApi.post(`/campaigns/${id}/launch`)
    return res.data
}

export async function listPrimaryVoiceRecords(id: string): Promise<VoiceCallRecord[]> {
    const res = await voiceApi.get(`/campaigns/${id}/records`)
    return res.data
}

export async function listPrimaryVoiceCampaigns(): Promise<VoiceCampaign[]> {
    const res = await voiceApi.get("/campaigns")
    return res.data
}

export async function getPrimaryVoiceHealth(): Promise<{ status: string }> {
    const res = await voiceApi.get("/health")
    return res.data
}

export async function synthesizePrimaryVoicePreview(text: string, voiceName: string): Promise<Blob> {
    const res = await voiceApi.post("/audio/preview", { text, voiceName }, { responseType: "blob" })
    return res.data
}
