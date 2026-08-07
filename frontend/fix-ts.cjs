const fs = require('fs');

function removeImport(file, name) {
  let content = fs.readFileSync(file, 'utf8');
  let regex = new RegExp('(\\b|\\s)' + name + '\\s*(,|})', 'g');
  content = content.replace(regex, (match, p1, p2) => {
    return p2 === '}' ? '}' : p1;
  });
  // Clean up empty imports
  content = content.replace(/import\s*\{\s*\}\s*from\s*['"][^'"]+['"];?\n/g, '');
  content = content.replace(/import\s*React\s*,?\s*/g, 'import ');
  content = content.replace(/import \s*\{\s*/g, 'import { ');
  
  // also handle "const [name] ="
  let regexState = new RegExp(name + '\\s*,\\s*set[a-zA-Z]+\\] = useState', 'g');
  content = content.replace(regexState, '  ] = useState');
  
  let regexState2 = new RegExp('const\\s*\\[' + name + '\\]\\s*=\\s*useState', 'g');
  content = content.replace(regexState2, 'const [] = useState');
  
  fs.writeFileSync(file, content);
}

removeImport('src/tabs/campaigns/CampaignsChannelsView.tsx', 'ArrowRight');
removeImport('src/tabs/campaigns/CampaignsTab.tsx', 'navigate');
removeImport('src/tabs/campaigns/email/EmailCampaignsHub.tsx', 'BarChart2');
removeImport('src/tabs/campaigns/voice/VoiceAgentStudio.tsx', 'React');
removeImport('src/tabs/campaigns/voice/VoiceAgentStudio.tsx', 'Play');
removeImport('src/tabs/campaigns/voice/VoiceAgentStudio.tsx', 'PhoneForwarded');
removeImport('src/tabs/campaigns/voice/VoiceAgentStudio.tsx', 'VoicePlaybookType');

removeImport('src/tabs/campaigns/voice/VoiceCampaignWizard.tsx', 'FileSpreadsheet');
removeImport('src/tabs/campaigns/voice/VoiceCampaignWizard.tsx', 'CheckCircle2');
removeImport('src/tabs/campaigns/voice/VoiceCampaignWizard.tsx', 'ShieldCheck');
removeImport('src/tabs/campaigns/voice/VoiceCampaignWizard.tsx', 'Sparkles');
removeImport('src/tabs/campaigns/voice/VoiceCampaignWizard.tsx', 'FileText');
removeImport('src/tabs/campaigns/voice/VoiceCampaignWizard.tsx', 'setAutoLaunch');
removeImport('src/tabs/campaigns/voice/VoiceCampaignWizard.tsx', 'parsing');

removeImport('src/tabs/campaigns/voice/VoiceHub.tsx', 'React');
removeImport('src/tabs/campaigns/voice/VoiceHub.tsx', 'PhoneCall');
removeImport('src/tabs/campaigns/voice/VoiceHub.tsx', 'Sparkles');
removeImport('src/tabs/campaigns/voice/VoiceHub.tsx', 'Calendar');
removeImport('src/tabs/campaigns/voice/VoiceHub.tsx', 'XCircle');
removeImport('src/tabs/campaigns/voice/VoiceHub.tsx', 'Play');
removeImport('src/tabs/campaigns/voice/VoiceHub.tsx', 'Sliders');
removeImport('src/tabs/campaigns/voice/VoiceHub.tsx', 'timeStatus');
removeImport('src/tabs/campaigns/voice/VoiceHub.tsx', 'totalRescheduled');

removeImport('src/tabs/campaigns/voice/VoiceLiveDeskView.tsx', 'React');
removeImport('src/tabs/campaigns/voice/VoiceLiveDeskView.tsx', 'Clock');
removeImport('src/tabs/campaigns/voice/VoiceLiveDeskView.tsx', 'PhoneCall');
removeImport('src/tabs/campaigns/voice/VoiceLiveDeskView.tsx', 'Volume2');
removeImport('src/tabs/campaigns/voice/VoiceLiveDeskView.tsx', 'User');
removeImport('src/tabs/campaigns/voice/VoiceLiveDeskView.tsx', 'ChevronRight');
removeImport('src/tabs/campaigns/voice/VoiceLiveDeskView.tsx', 'VoiceOutcomeIntent');

removeImport('src/tabs/campaigns/voice/VoicePlaybooksCatalog.tsx', 'React');

removeImport('src/tabs/campaigns/whatsapp/WhatsAppBotConfigView.tsx', 'config');
removeImport('src/tabs/campaigns/whatsapp/WhatsAppBotConfigView.tsx', 'webhookUrl');
removeImport('src/tabs/campaigns/whatsapp/WhatsAppBotConfigView.tsx', 'setWebhookUrl');

removeImport('src/tabs/voice-desk/VoiceAiHubPage.tsx', 'Phone');
removeImport('src/tabs/voice-desk/VoiceAiHubPage.tsx', 'PhoneCall');
removeImport('src/tabs/voice-desk/VoiceAiHubPage.tsx', 'Settings');
removeImport('src/tabs/voice-desk/VoiceAiHubPage.tsx', 'Sparkles');
removeImport('src/tabs/voice-desk/VoiceAiHubPage.tsx', 'ShieldCheck');
removeImport('src/tabs/voice-desk/VoiceAiHubPage.tsx', 'Volume2');
removeImport('src/tabs/voice-desk/VoiceAiHubPage.tsx', 'Play');
removeImport('src/tabs/voice-desk/VoiceAiHubPage.tsx', 'Users');
removeImport('src/tabs/voice-desk/VoiceAiHubPage.tsx', 'Activity');
removeImport('src/tabs/voice-desk/VoiceAiHubPage.tsx', 'Clock');

let testModal = fs.readFileSync('src/tabs/voice-desk/components/LiveVoiceCallTesterModal.tsx', 'utf8');
testModal = testModal.replace('RefreshCw,', 'RefreshCw, Volume2, Play,');
fs.writeFileSync('src/tabs/voice-desk/components/LiveVoiceCallTesterModal.tsx', testModal);

let emailStudio = fs.readFileSync('src/tabs/campaigns/email/EmailTemplatesStudio.tsx', 'utf8');
emailStudio = emailStudio.replace('Eye }', 'Eye, LayoutTemplate }');
fs.writeFileSync('src/tabs/campaigns/email/EmailTemplatesStudio.tsx', emailStudio);
