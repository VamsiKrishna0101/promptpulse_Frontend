import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useProjects } from "@/hooks/useProjects"
import { CampaignsChannelsView } from "./CampaignsChannelsView"
import { CampaignsHub } from "./whatsapp/CampaignsHub"
import { CreateCampaignWizard } from "./whatsapp/wizard/CreateCampaignWizard"
import { WhatsAppTemplatesView } from "./whatsapp/WhatsAppTemplatesView"
import { WhatsAppSenderProfileView } from "./whatsapp/WhatsAppSenderProfileView"
import { CampaignDetailView } from "./whatsapp/CampaignDetailView"
import { ConnectAccountBanner } from "./whatsapp/ConnectAccountBanner"
import { WhatsAppBotConfigView } from "./whatsapp/WhatsAppBotConfigView"
import { WhatsAppLeadsView } from "./whatsapp/WhatsAppLeadsView"
import { WhatsAppSetupWizard } from "./whatsapp/WhatsAppSetupWizard"
import { useWhatsAppAccount } from "./whatsapp/hooks/useWhatsAppAccount"
import { VoiceHub } from "./voice/VoiceHub"
import { EmailCampaignsHub } from "./email/EmailCampaignsHub"
import { EmailCampaignWizard } from "./email/wizard/EmailCampaignWizard"
import { EmailTemplatesStudio } from "./email/EmailTemplatesStudio"

export type CampaignView =
    | "channels"
    | "hub"
    | "voice"
    | "email"
    | "email-create"
    | "email-templates"
    | "create"
    | "templates"
    | "sender-profile"
    | "detail"
    | "bot-builder"
    | "leads"

export function CampaignsTab() {
    const navigate = useNavigate()
    const { selectedProject } = useProjects()
    const projectId = selectedProject?.id ?? null
    const [view, setView] = useState<CampaignView>("channels")
    const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null)
    const { account, loading, reload } = useWhatsAppAccount(projectId)

    function openDetail(campaignId: string) {
        setSelectedCampaignId(campaignId)
        setView("detail")
    }

    if (!projectId) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <p className="text-sm text-zinc-400">Select a project to manage campaigns.</p>
            </div>
        )
    }

    if (view === "channels") {
        return (
            <div className="flex flex-col gap-5 pb-10">
                <CampaignsChannelsView
                    account={account}
                    accountLoading={loading}
                    onOpenWhatsApp={() => setView("hub")}
                    onOpenBot={() => setView("bot-builder")}
                    onOpenVoice={() => setView("voice")}
                    onOpenEmail={() => setView("email")}
                />
            </div>
        )
    }

    if (view === "voice") {
        return (
            <VoiceHub
                projectId={projectId}
                onBackToChannels={() => setView("channels")}
            />
        )
    }

    if (view === "email") {
        return (
            <EmailCampaignsHub
                projectId={projectId}
                onBack={() => setView("channels")}
                onNewCampaign={() => setView("email-create")}
                onOpenTemplates={() => setView("email-templates")}
                onOpenSettings={() => alert("Settings coming soon")}
                onOpenCampaign={(id) => console.log("Open email campaign", id)}
            />
        )
    }

    if (view === "email-create") {
        return (
            <EmailCampaignWizard
                projectId={projectId}
                onBack={() => setView("email")}
                onSuccess={() => setView("email")}
            />
        )
    }

    if (view === "email-templates") {
        return (
            <EmailTemplatesStudio
                projectId={projectId}
                onBack={() => setView("email")}
            />
        )
    }

    // Show connect banner only for whatsapp hub view when no account
    const showConnectBanner = !loading && !account && view === "hub"

    if (view === "bot-builder") {
        if (loading || !account) {
            return (
                <WhatsAppSetupWizard
                    projectId={projectId}
                    onBack={() => setView("channels")}
                    onConnected={async () => { await reload() }}
                />
            )
        }
        return (
            <WhatsAppBotConfigView
                projectId={projectId}
                onBack={() => setView("channels")}
                onOpenLeads={() => setView("leads")}
            />
        )
    }

    if (view === "leads") {
        return (
            <WhatsAppLeadsView
                projectId={projectId}
                onBack={() => setView("bot-builder")}
                onOpenBotConfig={() => setView("bot-builder")}
            />
        )
    }

    if (view === "create") {
        return (
            <CreateCampaignWizard
                account={account}
                projectId={projectId}
                onBack={() => setView("hub")}
                onSuccess={() => setView("hub")}
            />
        )
    }

    if (view === "templates" && account) {
        return (
            <WhatsAppTemplatesView
                account={account}
                onBack={() => setView("hub")}
                onReloadAccount={reload}
            />
        )
    }

    if (view === "sender-profile") {
        return (
            <WhatsAppSenderProfileView
                account={account}
                projectId={projectId}
                onBack={() => setView("hub")}
                onAccountChanged={reload}
            />
        )
    }

    if (view === "detail" && selectedCampaignId) {
        return (
            <CampaignDetailView
                campaignId={selectedCampaignId}
                onBack={() => setView("hub")}
            />
        )
    }

    return (
        <div className="flex flex-col gap-5 pb-10">
            {showConnectBanner && (
                <ConnectAccountBanner
                    projectId={projectId}
                    onConnected={reload}
                    onOpenProfile={() => setView("sender-profile")}
                />
            )}
            <CampaignsHub
                account={account}
                accountLoading={loading}
                projectId={projectId}
                onBack={() => setView("channels")}
                onNewCampaign={() => setView("create")}
                onOpenTemplates={() => setView("templates")}
                onOpenSenderProfile={() => setView("sender-profile")}
                onOpenCampaign={openDetail}
            />
        </div>
    )
}

