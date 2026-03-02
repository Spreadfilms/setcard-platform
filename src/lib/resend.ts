import { Resend } from 'resend'

export function getResend() {
  return new Resend(process.env.RESEND_API_KEY || 'placeholder')
}

export const resend = {
  emails: {
    send: (opts: Parameters<Resend['emails']['send']>[0]) => getResend().emails.send(opts),
  },
}

export const FROM_EMAIL = 'casting@spreadfilms.de'
export const FROM_NAME = 'Spreadfilms Casting'
