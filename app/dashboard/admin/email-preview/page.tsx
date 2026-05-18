'use client';

import { getEmailPreviews } from '@/lib/email/preview-templates';
import { EmailPreviewClient } from './EmailPreviewClient';
import { withPermission } from '@/components/ui/auth/withPermission';

const EmailPreviewPage = () => {
  const templates = getEmailPreviews();
  return <EmailPreviewClient templates={templates} />;
};

export default withPermission(EmailPreviewPage, '/dashboard/admin');
