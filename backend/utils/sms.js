const maskMobile = (m) => String(m).replace(/\d(?=\d{4})/g, '•');

const sendSms = async (to, body) => {
  const { TWILIO_SID, TWILIO_TOKEN, TWILIO_FROM } = process.env;
  if (!TWILIO_SID || !TWILIO_TOKEN || !TWILIO_FROM) {
    console.log(`\n[DEV SMS] To: ${to}\n${body}\n`);
    return;
  }
  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${TWILIO_SID}:${TWILIO_TOKEN}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ To: to, From: TWILIO_FROM, Body: body }),
    }
  );
  if (!res.ok) {
    console.error('SMS failed:', await res.text());
    throw new Error('Unable to send SMS right now');
  }
};

module.exports = { sendSms, maskMobile };