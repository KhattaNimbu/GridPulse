async function run() {
  const base = process.env.TEST_BASE_URL ?? 'http://localhost:3000'
  console.log('Testing sign-in')
  try {
    const res = await fetch(`${base}/api/auth/callback/credentials`, { method: 'POST' })
    console.log('Sign-in endpoint status:', res.status)
  } catch (e) {
    console.error('Auth test failed', e)
    process.exit(1)
  }
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
