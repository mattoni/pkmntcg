import sgMail from '@sendgrid/mail'

if (!process.env.SENDGRID_API_KEY) {
  throw new Error('No sendgrid API key present')
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

export {sgMail as mailClient}
