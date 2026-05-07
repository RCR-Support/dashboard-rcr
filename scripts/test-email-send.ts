import { sendApplicationConfirmationEmail } from '../lib/email/postmark';

async function main() {
  const applicationId = process.argv[2];
  const toEmail = process.argv[3];

  if (!applicationId) {
    console.error('Usage: npx ts-node scripts/test-email-send.ts <applicationId> [toEmail]');
    process.exit(1);
  }

  console.log(`Enviando email para application ${applicationId}...`);
  
  try {
    const result = await sendApplicationConfirmationEmail(applicationId, toEmail);
    console.log('✅ Email enviado:', result);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
