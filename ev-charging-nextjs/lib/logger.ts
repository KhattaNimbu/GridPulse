import fs from 'fs'
import path from 'path'

const LOG_DIR = path.join(process.cwd(), 'logs')
const AUDIT_LOG = path.join(LOG_DIR, 'audit.log')
const ERROR_LOG = path.join(LOG_DIR, 'errors.log')
type LogMeta = Record<string, unknown>

function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true })
  }
}

export async function auditLog(message: string, meta?: LogMeta) {
  try {
    ensureLogDir()
    const entry = { time: new Date().toISOString(), message, meta }
    await fs.promises.appendFile(AUDIT_LOG, JSON.stringify(entry) + '\n')
  } catch (err) {
    // Best-effort; don't crash the app
    console.error('Failed to write audit log', err)
  }
}

export async function errorAlert(message: string, meta?: LogMeta) {
  try {
    ensureLogDir()
    const entry = { time: new Date().toISOString(), message, meta }
    await fs.promises.appendFile(ERROR_LOG, JSON.stringify(entry) + '\n')

    const webhook = process.env.ALERT_WEBHOOK
    if (webhook) {
      // best-effort fire-and-forget
      fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message, meta }),
      }).catch(() => {})
    }
  } catch (err) {
    console.error('Failed to write error alert', err)
  }
}

const logger = { auditLog, errorAlert }

export default logger
