import { api } from "./api"

export type EmailCampaignStatus = "DRAFT" | "SCHEDULED" | "RUNNING" | "COMPLETED" | "PAUSED" | "FAILED"
export type EmailRecipientStatus = "QUEUED" | "SENT" | "DELIVERED" | "BOUNCED" | "COMPLAINT" | "OPENED" | "CLICKED" | "FAILED"

export interface EmailAccount {
    id: string
    project_id: string
    user_id: string
    provider: string
    from_name: string
    from_email: string
    reply_to_email?: string
    is_verified: boolean
    aws_region?: string
    created_at: string
    updated_at: string
}

export interface EmailTemplate {
    id: string
    account_id: string
    name: string
    subject: string
    html_body: string
    design_json?: any
    created_at: string
    updated_at: string
}

export interface EmailCampaign {
    id: string
    account_id: string
    user_id: string
    name: string
    status: EmailCampaignStatus
    template_id?: string
    total_recipients: number
    sent_count: number
    delivered_count: number
    opened_count: number
    clicked_count: number
    bounced_count: number
    complaint_count: number
    failed_count: number
    scheduled_at?: string
    started_at?: string
    completed_at?: string
    error_message?: string
    created_at: string
    updated_at: string
    template?: EmailTemplate
}

export async function getEmailAccount(projectId: string): Promise<EmailAccount | null> {
    try {
        const { data } = await api.get<EmailAccount>("/campaigns/email/account", {
            headers: { "x-project-id": projectId }
        })
        return data
    } catch (err: any) {
        if (err?.response?.status === 404) return null
        throw err
    }
}

export async function createEmailAccount(projectId: string, payload: {
    fromName: string
    fromEmail: string
    provider?: string
    awsRegion?: string
    awsAccessKey?: string
    awsSecretKey?: string
}): Promise<EmailAccount> {
    const { data } = await api.post<EmailAccount>("/campaigns/email/account", payload, {
        headers: { "x-project-id": projectId }
    })
    return data
}

export async function listEmailTemplates(projectId: string): Promise<EmailTemplate[]> {
    const { data } = await api.get<EmailTemplate[]>("/campaigns/email/templates", {
        headers: { "x-project-id": projectId }
    })
    return data
}

export async function createEmailTemplate(projectId: string, payload: {
    name: string
    subject: string
    htmlBody: string
    designJson?: any
}): Promise<EmailTemplate> {
    const { data } = await api.post<EmailTemplate>("/campaigns/email/templates", payload, {
        headers: { "x-project-id": projectId }
    })
    return data
}

export async function listEmailCampaigns(projectId: string): Promise<EmailCampaign[]> {
    const { data } = await api.get<EmailCampaign[]>("/campaigns/email/list", {
        headers: { "x-project-id": projectId }
    })
    return data
}

export async function getEmailCampaign(projectId: string, id: string): Promise<EmailCampaign> {
    const { data } = await api.get<EmailCampaign>(`/campaigns/email/${id}`, {
        headers: { "x-project-id": projectId }
    })
    return data
}

export async function createEmailCampaign(projectId: string, payload: {
    name: string
    templateId: string
}): Promise<EmailCampaign> {
    const { data } = await api.post<EmailCampaign>("/campaigns/email/create", payload, {
        headers: { "x-project-id": projectId }
    })
    return data
}

export async function uploadEmailRecipients(projectId: string, campaignId: string, csv: string): Promise<{ success: boolean; count: number }> {
    const { data } = await api.post<{ success: boolean; count: number }>(`/campaigns/email/${campaignId}/recipients/upload`, { csv }, {
        headers: { "x-project-id": projectId }
    })
    return data
}

export async function launchEmailCampaign(projectId: string, campaignId: string): Promise<{ success: boolean }> {
    const { data } = await api.post<{ success: boolean }>(`/campaigns/email/${campaignId}/launch`, {}, {
        headers: { "x-project-id": projectId }
    })
    return data
}
